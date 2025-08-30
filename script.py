import os
import random
import re
import sys
from typing import Any

import asyncpg
import discord
from discord import app_commands, ui
from discord.ext import commands
from dotenv import load_dotenv

from data import ROLE_SEEN, ROLE_NOT_ENOUGH, sect3, sect15, sect25, ROLE_TREE, ROLE_RECRUIT, ROLE_FOUNDATION, \
    CHANNEL_FANMADE, ROLE_FAN, CHANNEL_WELCOME, CHANNEL_RULES, CHANNEL_SPONSOR_LEEKS, CHANNEL_BUGS_AND_SUGGESTIONS, \
    CHANNEL_MEMES, CHANNEL_DISCUSSIONS, CHANNEL_GENERAL, CHANNEL_ROLES, role_explanation, rule1, rule2, announcement

# First try: load from environment
try:
    TOKEN = os.getenv("DISCORD_TOKEN")
    GUILD_ID = os.getenv("DISCORD_GUILD_ID")
    DATABASE_URL = os.getenv("DATABASE_URL")
except Exception as e:
    print(f"Error: Failed to load environment variables: {e}")
    sys.exit(1)

# If any required variable is missing, try loading from .env
if not TOKEN or not GUILD_ID or not DATABASE_URL:
    print("Warning: Environment variables not set. Attempting to load from .env file.")
    env_files = [f for f in os.listdir() if os.path.isfile(f) and f.endswith(".env")]

    if env_files:
        print(f"Found .env file, loading variables from {env_files[0]}...")
        try:
            load_dotenv(dotenv_path=env_files[0])
            TOKEN = TOKEN or os.getenv("DISCORD_TOKEN")
            GUILD_ID = GUILD_ID or os.getenv("DISCORD_GUILD_ID")
            DATABASE_URL = DATABASE_URL or os.getenv("DATABASE_URL")
        except Exception as e:
            print(f"Error: Failed to load .env file: {e}")
            sys.exit(1)
    else:
        print("Error: Environment variables not set and .env file not found.")
        sys.exit(1)

# Final check after fallback
missing = []
if not TOKEN:
    missing.append("DISCORD_TOKEN")
if not GUILD_ID:
    missing.append("DISCORD_GUILD_ID")
if not DATABASE_URL:
    missing.append("DATABASE_URL")

if missing:
    print(f"Error: Missing required environment variables: {', '.join(missing)}")
    sys.exit(1)

# If GUILD_ID is now set, cast to int
GUILD_ID = int(GUILD_ID)

# Init
db_pool: Any = None


# ==== BOT CONFIG ====
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)
tree = bot.tree

# Keep track of users who already submitted during Q&A
user_submissions = set()


# ==== Database Initialization ====
# noinspection PyUnresolvedReferences
async def init_db():
    global db_pool
    db_pool = await asyncpg.create_pool(DATABASE_URL)
    async with db_pool.acquire() as conn:
        await conn.execute("""
                           CREATE TABLE IF NOT EXISTS support_tickets
                           (
                               id
                               SERIAL
                               PRIMARY
                               KEY,
                               user_id
                               BIGINT,
                               username
                               TEXT,
                               description
                               TEXT,
                               status
                               TEXT
                               DEFAULT
                               'open',
                               created_at
                               TIMESTAMP
                               DEFAULT
                               NOW
                           (
                           )
                               );
                           CREATE TABLE IF NOT EXISTS user_submissions
                           (
                               user_id
                               BIGINT
                               PRIMARY
                               KEY,
                               submitted_at
                               TIMESTAMP
                               DEFAULT
                               NOW
                           (
                           )
                               );
                           CREATE TABLE IF NOT EXISTS tas_state
                           (
                               key
                               TEXT
                               PRIMARY
                               KEY,
                               value
                               TEXT
                           );
                           """)
        # Ensure tas_awakened key exists
        await conn.execute("""
                           INSERT INTO tas_state (key, value)
                           VALUES ('tas_awakened', 'false') ON CONFLICT (key) DO NOTHING;
                           """)


async def get_tas_awakened():
    async with db_pool.acquire() as conn:
        val = await conn.fetchval("SELECT value FROM tas_state WHERE key='tas_awakened'")
        return val == "true"


async def set_tas_awakened(state: bool):
    async with db_pool.acquire() as conn:
        await conn.execute("UPDATE tas_state SET value=$1 WHERE key='tas_awakened'", "true" if state else "false")


async def add_user_submission(user_id):
    async with db_pool.acquire() as conn:
        await conn.execute("INSERT INTO user_submissions (user_id) VALUES ($1) ON CONFLICT DO NOTHING", user_id)


async def has_user_submitted(user_id):
    async with db_pool.acquire() as conn:
        return await conn.fetchval("SELECT user_id FROM user_submissions WHERE user_id=$1", user_id) is not None


async def clear_user_submissions():
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM user_submissions")


# ==== UI classes ====
# noinspection PyTypeChecker,PyUnusedLocal
class RolesView(ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    # noinspection PyUnresolvedReferences
    @ui.button(label="I have seen things", style=discord.ButtonStyle.primary, custom_id="seen_button")
    async def seen_button(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.send_modal(SeenModal())

    # noinspection PyUnresolvedReferences
    @ui.button(label="But its not enough", style=discord.ButtonStyle.secondary, custom_id="not_enough_button")
    async def not_enough_button(self, interaction: discord.Interaction, button: ui.Button):
        role_seen = discord.utils.get(interaction.guild.roles, name=ROLE_SEEN)
        role_not_enough = discord.utils.get(interaction.guild.roles, name=ROLE_NOT_ENOUGH)
        if not role_seen or not role_not_enough:
            await interaction.response.send_message("Required role(s) not found.", ephemeral=True)
            return
        if role_seen not in interaction.user.roles:
            await interaction.response.send_message(
                "You must have the 'I have seen things' role before you can receive this one.", ephemeral=True
            )
            return
        await interaction.user.add_roles(role_not_enough)
        await interaction.response.send_message(
            "You have been given the role. _You have seen, but it is not enough._", ephemeral=True
        )


class SeenModal(ui.Modal, title="Role Question"):
    answer = ui.TextInput(label="What is keyword_6?", required=True)

    # noinspection PyUnresolvedReferences
    async def on_submit(self, interaction: discord.Interaction):
        if self.answer.value.lower().strip() == "unbirth":
            role = discord.utils.get(interaction.guild.roles, name=ROLE_SEEN)
            if role:
                await interaction.user.add_roles(role)
                await interaction.response.send_message("Correct! Role granted.", ephemeral=True)
            else:
                await interaction.response.send_message("Role not found.", ephemeral=True)
        else:
            await interaction.response.send_message("Incorrect answer.", ephemeral=True)


# noinspection PyTypeChecker,PyUnusedLocal
class TicketAdminView(ui.View):
    def __init__(self, ticket_id, description, user):
        super().__init__(timeout=None)
        self.ticket_id = ticket_id
        self.description = description
        self.user = user

    # noinspection PyUnresolvedReferences
    @ui.button(label="Accept", style=discord.ButtonStyle.success)
    async def accept(self, interaction: discord.Interaction, button: ui.Button):
        bugs_channel = discord.utils.get(interaction.guild.text_channels, name="bugs-and-suggestions")
        if bugs_channel:
            msg = await bugs_channel.send(
                f"**Ticket #{self.ticket_id}**\n{self.description}\n\n*Upvote/downvote this suggestion/request/bug report!*"
            )
        async with db_pool.acquire() as conn:
            await conn.execute("DELETE FROM support_tickets WHERE id=$1", self.ticket_id)
        await interaction.response.send_message("Ticket accepted and posted.", ephemeral=True)
        await interaction.message.delete()

    # noinspection PyUnresolvedReferences
    @ui.button(label="Reject", style=discord.ButtonStyle.danger)
    async def reject(self, interaction: discord.Interaction, button: ui.Button):
        bugs_channel = discord.utils.get(interaction.guild.text_channels, name="bugs-and-suggestions")
        if bugs_channel:
            await bugs_channel.send(
                f"**Ticket #{self.ticket_id}**\nStatus: Rejected"
            )
        async with db_pool.acquire() as conn:
            await conn.execute("DELETE FROM support_tickets WHERE id=$1", self.ticket_id)
        await interaction.response.send_message("Ticket rejected.", ephemeral=True)
        await interaction.message.delete()


# ==== Slash Command: /ticket ====
# noinspection PyUnresolvedReferences
@tree.command(name="ticket", description="Open a bug/support ticket", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(description="Describe your bug or issue")
async def open_ticket(interaction: discord.Interaction, description: str):
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO support_tickets (user_id, username, description) VALUES ($1, $2, $3) RETURNING id",
            interaction.user.id, str(interaction.user), description
        )
        ticket_id = row["id"]
    await interaction.response.send_message(
        f"✅ Your ticket has been submitted! Ticket number: {ticket_id}. Our team will review it soon.", ephemeral=True
    )

    ticket_backlog_channel = discord.utils.get(interaction.guild.text_channels, name="ticket-backlog")
    if ticket_backlog_channel:
        view = TicketAdminView(ticket_id, description, interaction.user)
        await ticket_backlog_channel.send(
            f"**New Ticket #{ticket_id}**\nUser: {interaction.user.mention}\nDescription: {description}",
            view=view
        )


# ==== Slash Command: /tas-db ====
# noinspection PyUnresolvedReferences
@tree.command(name="tas-db", description="Admin: Play/change DB values", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(table="Table to modify: tas_state/user_submissions/support_tickets",
                       action="Action: view/clear/set", key="Key (optional)", value="Value (optional)")
@app_commands.checks.has_permissions(administrator=True)
async def tas_bot_memory(interaction: discord.Interaction, table: str, action: str, key: str = None, value: str = None):
    result = ""
    async with db_pool.acquire() as conn:
        if table == "tas_state":
            if action == "view":
                rows = await conn.fetch("SELECT * FROM tas_state")
                result = "\n".join(f"{r['key']}: {r['value']}" for r in rows)
            elif action == "set" and key and value:
                await conn.execute("UPDATE tas_state SET value=$1 WHERE key=$2", value, key)
                result = f"Set {key} to {value}"
            else:
                result = "Invalid action or missing key/value."
        elif table == "user_submissions":
            if action == "view":
                rows = await conn.fetch("SELECT * FROM user_submissions")
                result = "\n".join(str(r['user_id']) for r in rows)
            elif action == "clear":
                await conn.execute("DELETE FROM user_submissions")
                result = "Cleared user_submissions."
            else:
                result = "Invalid action."
        elif table == "support_tickets":
            if action == "view":
                rows = await conn.fetch("SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 10")
                result = "\n".join(f"#{r['id']} {r['username']}: {r['description']} [{r['status']}]" for r in rows)
            elif action == "clear":
                await conn.execute("DELETE FROM support_tickets")
                result = "Cleared support_tickets."
            else:
                result = "Invalid action."
        else:
            result = "Unknown table."
    await interaction.response.send_message(f"```\n{result}\n```", ephemeral=True)


# ==== Slash Command: /saga_announcement ====
# noinspection PyUnresolvedReferences
@tree.command(name="saga_announcement", description="Start the mystery event", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(number="A number between 1 and 10 (optional)")
@app_commands.checks.has_permissions(administrator=True)
async def saga_announcement(interaction: discord.Interaction, number: int = None):
    SECRETS = [
        # 0 - Saga I: Connecting...
        "The connection was never about signal strength, was it?",

        # 1 - Saga II: Empty?
        "When something is missing, it means something else is hiding.",

        # 2 - Saga III: Clocks and Hands
        "Time lies, symbols replace intent. Watch the hands, not the face.",

        # 3 - Saga IV: Registration
        "Names can be rewritten. Consequences? Painted in red.",

        # 4 - Saga V: Narrator:I
        "Voices change midway through stories-especially if you're listening wrong.",

        # 5 - Saga VI: Clocks
        "Each clock is honest. Together, they conspire.",

        # 6 - Saga VII: Timelines
        "Canon is a comfort for those afraid of forks.",

        # 7 - Saga VIII: Bloom, Live and Die
        "Sometimes, flowers are meant to be trampled. You volunteered.",

        # 8 - Saga IX: Philosophy
        "Answers were never the goal. The questions changed you.",

        # 9 - Saga X: Narrator:II
        "The end was promised. But promises, like time, bend.",
    ]

    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet. Use /awaken_tas to start.", ephemeral=True)
        return

    mystery_channel = discord.utils.get(interaction.guild.text_channels, name="❓❓❓")
    if mystery_channel:
        base_message = "> **The tree stirs. The whispers begin.** 🌲👁️\n> _Something is coming..._\n\n"
        if number is not None:
            if 1 <= number <= 10:
                secret = SECRETS[number - 1]
                base_message += f"\n> ||{secret}||"
                await mystery_channel.send(base_message)
                await interaction.response.send_message("Successfully sent message", ephemeral=True)
            else:
                await interaction.response.send_message("Invalid number. Please provide a number between 1 and 10.",
                                                        ephemeral=True)
        else:
            await mystery_channel.send(base_message)
            await interaction.response.send_message("Successfully sent message", ephemeral=True)
    else:
        await interaction.response.send_message("Channel ❓❓❓ not found.", ephemeral=True)


# ==== Slash Command: /start_tas_qa ====
# noinspection PyUnresolvedReferences
@tree.command(name="start_tas_qa", description="Open the TAS Q&A channel", guild=discord.Object(id=GUILD_ID))
@app_commands.checks.has_permissions(administrator=True)
async def start_qa(interaction: discord.Interaction):
    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet. Use /awaken_tas to start.", ephemeral=True)
        return
    await clear_user_submissions()
    tas_channel = discord.utils.get(interaction.guild.text_channels, name="t-a-s")
    if not tas_channel:
        await interaction.response.send_message("Channel t-a-s not found.", ephemeral=True)
        return

    # Allow only users with specific roles to send messages
    allowed_roles = ["But its not enough", "I have seen things"]
    overwrite = tas_channel.overwrites_for(interaction.guild.default_role)
    overwrite.send_messages = False
    await tas_channel.set_permissions(interaction.guild.default_role, overwrite=overwrite)

    for role in interaction.guild.roles:
        if role.name in allowed_roles:
            role_overwrite = tas_channel.overwrites_for(role)
            role_overwrite.send_messages = True
            await tas_channel.set_permissions(role, overwrite=role_overwrite)

    await tas_channel.send("> **TAS is listening. Speak once. Choose wisely.** 🕳️🌿")
    await interaction.response.send_message("Q&A channel opened for eligible roles.", ephemeral=True)


# ==== Slash Command: /end_tas_qa ====
# noinspection PyUnresolvedReferences
@tree.command(name="end_tas_qa", description="Close the TAS Q&A channel", guild=discord.Object(id=GUILD_ID))
@app_commands.checks.has_permissions(administrator=True)
async def end_qa(interaction: discord.Interaction):
    tas_channel = discord.utils.get(interaction.guild.text_channels, name="t-a-s")
    if not tas_channel:
        await interaction.response.send_message("Channel t-a-s not found.", ephemeral=True)
        return

    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet. Use /awaken_tas to start.", ephemeral=True)
        return

    # Check if channel is already locked for all allowed roles
    locked_for_all = True
    for role in interaction.guild.roles:
        if role.name in ["But its not enough", "I have seen things"]:
            role_overwrite = tas_channel.overwrites_for(role)
            if role_overwrite.send_messages is not False:
                locked_for_all = False
                break

    # Get overwrite for default role
    overwrite = tas_channel.overwrites_for(interaction.guild.default_role)
    if overwrite.send_messages is False and locked_for_all:
        await interaction.response.send_message("Q&A channel is already locked.", ephemeral=True)
        return

    # Prevent new messages from being sent
    overwrite.send_messages = False
    await tas_channel.set_permissions(interaction.guild.default_role, overwrite=overwrite)

    await tas_channel.send("> _Many have spoken. Only the deserving shall be heard._ 🪵🗝️")
    await interaction.response.send_message("Q&A channel locked.", ephemeral=True)


# ==== Slash Command: /tas_say ====
# noinspection PyUnresolvedReferences
@tree.command(name="tas_say", description="Send a message as TAS", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(message="The message for TAS to say")
@app_commands.checks.has_permissions(administrator=True)
async def tas_say(interaction: discord.Interaction, message: str):
    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet, so it may not make sense to speak as TAS",
                                                ephemeral=True)
    await interaction.channel.send(message.replace(r'\n', '\n'))


# ==== Slash Command: /attempt_awaken_tas ====
# noinspection PyUnresolvedReferences
@tree.command(name="awaken_tas", description="Awaken TAS with a special file", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(file="Upload a file named TAS.tree containing the required secrets")
async def awaken_tas(interaction: discord.Interaction, file: discord.Attachment):
    tas_channel = discord.utils.get(interaction.guild.text_channels, name="t-a-s")
    if await get_tas_awakened():
        await interaction.response.send_message("TAS is already awakened.", ephemeral=True)
        return

    if file.filename != "TAS.tree":
        await interaction.response.send_message("File must be named correctly - REFER TO [ERROR LOG *HINT*].",
                                                ephemeral=True)
        return

    await interaction.response.defer(ephemeral=True)  # Defer immediately to avoid timeout

    content = (await file.read()).decode("utf-8", errors="ignore")

    def normalize(s):
        return "".join(s.split())

    required_sections = [normalize(sect3), normalize(sect15), normalize(sect25)]
    normalized_content = normalize(content)
    if all(section in normalized_content for section in required_sections):
        await set_tas_awakened(True)
        role = discord.utils.get(interaction.guild.roles, name=ROLE_TREE)
        if role:
            await interaction.user.add_roles(role)
        await tas_channel.send(
            "**[TAS SYSTEM BOOT]**\n> Initializing neural mesh...\n> Memory map: [OK]\n> Entity ID: [LOCKED]\n> Signal integrity: [UNSTABLE]\n> _Whispers detected_\n> [ERROR: Consciousness containment breached]\n> **AWAKENING...**\n🇼 🇮 🇱 🇱   🇾 🇴 🇺   🇪 🇻 🇪 🇷   🇸 🇲 🇮 🇱 🇪   🇫 🇴 🇷   🇲 🇪 ?")
        await interaction.followup.send("TAS successfully awakened.", ephemeral=True)
        guild = bot.get_guild(GUILD_ID)
        role_not_enough = discord.utils.get(guild.roles, name=ROLE_NOT_ENOUGH)
        category_smile = discord.utils.get(guild.categories, name=":)")
        if role_not_enough and category_smile:
            for channel in category_smile.channels:
                overwrite = channel.overwrites_for(role_not_enough)
                # noinspection PyUnresolvedReferences
                overwrite.view_channel = True
                await channel.set_permissions(role_not_enough, overwrite=overwrite)
    else:
        matched = sum(1 for section in required_sections if section in normalized_content)
        await interaction.followup.send(
            f"File is missing required sections - Matched {matched}/3 parts. Failed to awaken.", ephemeral=True)


# ==== Message listener for Q&A ====
@bot.event
async def on_message(message: discord.Message):
    if message.author.bot or any(role.name == "Owner" for role in message.author.roles):
        return
    if message.channel.name == "t-a-s":
        if await has_user_submitted(message.author.id):
            try:
                await message.delete()
                await message.author.send("You’ve already submitted your question to TAS. HE only listens once.")
            except discord.Forbidden:
                pass
        else:
            await add_user_submission(message.author.id)
            # Restrict user from sending more messages in the Q&A channel
            overwrite = message.channel.overwrites_for(message.author)
            # noinspection PyUnresolvedReferences
            overwrite.send_messages = False
            try:
                await message.channel.set_permissions(message.author, overwrite=overwrite)
            except discord.Forbidden:
                pass


# === Auto roles on member join ===
@bot.event
async def on_member_join(member):
    guild = member.guild
    recruit = discord.utils.get(guild.roles, name=ROLE_RECRUIT)
    foundation = discord.utils.get(guild.roles, name=ROLE_FOUNDATION)
    if recruit:
        await member.add_roles(recruit)
    if foundation:
        count = sum(1 for m in guild.members if foundation in m.roles)
        if count < 100:
            await member.add_roles(foundation)


# === Fan Roles Giver ===
@bot.event
async def on_reaction_add(reaction, user):
    # Check if the reaction is in the correct channel
    if reaction.message.channel.name != CHANNEL_FANMADE:
        return

    # Only proceed if the reactor is the message author
    if reaction.message.author != user:
        return

    # Check if author already has the role
    role_fan = discord.utils.get(reaction.message.guild.roles, name=ROLE_FAN)
    if role_fan and role_fan in reaction.message.author.roles:
        return

    # Only proceed if emoji has a name attribute
    if not hasattr(reaction.emoji, "name"):
        return

    # Get emoji name and check if it's one of the fan emojis
    emoji_name = reaction.emoji.name
    if emoji_name not in ["upvote", "downvote"]:
        return

    # Fetch all reactions on the message
    message = reaction.message
    upvotes = 0
    downvotes = 0

    for r in message.reactions:
        if not isinstance(reaction.emoji, discord.Emoji):
            return

        if r.emoji.name == "upvote":
            upvotes = r.count
        elif r.emoji.name == "downvote":
            downvotes = r.count

    net_votes = upvotes - downvotes

    if net_votes >= 10:
        role = discord.utils.get(message.guild.roles, name=ROLE_FAN)
        if role:
            await message.author.add_roles(role)
            try:
                await message.author.send(
                    "You have been awarded the Fan role as you got many upvotes in a post you done in the fanmade channel in Facility!")
            except discord.Forbidden:
                pass


# ==== Facility Welcome Message Generator ====
@bot.event
async def on_member_join(member):
    guild = member.guild
    # Prepare channel links
    welcome_channel = discord.utils.get(guild.text_channels, name=CHANNEL_WELCOME)
    rules_channel = discord.utils.get(guild.text_channels, name=CHANNEL_RULES)
    if not welcome_channel or not rules_channel:
        return
    link_dict = {
        "welcome_channel_link": f"<#{welcome_channel.id}>",
        "rules_channel_link": f"<#{rules_channel.id}>"
    }
    messages = [
        f"{member.mention}, access signal received. You have entered the [REDACTED] perimeter. Orientation begins now. Review {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} to avoid containment protocol violations.",
        f"{member.mention}, identity pattern unstable but admissible. You are now within Facility perimeter. Please consult {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} before proceeding.",
        f"{member.mention}... you’ve come far. We noticed. The trees are quieter now. Read {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} — your survival may depend on it.",
        f"User {member.mention} registered. VESSEL candidate or anomaly—TAS will observe. Review initial broadcasts in {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} immediately.",
        f"{member.mention}, the system acknowledges your intrusion. Check {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']} before the lights flicker again.",
        f"{member.mention}, your presence was... expected. Begin assimilation at {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']}. Do not look behind you.",
        f"{member.mention}, echo traces confirm arrival. Please stabilize identity and synchronize with facility expectations by reviewing {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']}.",
        f"{member.mention}, integration pending. Orientation required: {link_dict['welcome_channel_link']} and {link_dict['rules_channel_link']}. This is not a game. Not anymore."
    ]
    # noinspection PyUnresolvedReferences
    await welcome_channel.send(random.choice(messages))


# ==== Sync and Run Bot ====
async def get_channel_by_name(name: str) -> discord.TextChannel | None:
    return discord.utils.get(bot.get_all_channels(), name=name)


async def check_message_exists(channel: discord.TextChannel, content: str) -> bool:
    first5 = " ".join(content.split()[:5])
    async for msg in channel.history(limit=50):
        if " ".join(msg.content.split()[:5]) == first5:
            return True
    return False


def replace_channel_links(text: str, links: dict[str, str]) -> str:
    def repl(match):
        key = match.group(1).strip()  # handles accidental spaces
        return links.get(key, match.group(0))  # default to original if not found

    return re.sub(r"\[\[\s*(.*?)\s*]]", repl, text)


async def send_if_not_exists(channel, content, view=None):
    if not await check_message_exists(channel, content):
        await channel.send(content, view=view)


@bot.event
async def on_ready():
    await init_db()
    await tree.sync(guild=discord.Object(id=GUILD_ID))
    print(f"[+] Logged in as {bot.user.name}")

    guild = bot.get_guild(GUILD_ID)

    if guild:
        role_not_enough = discord.utils.get(guild.roles, name=ROLE_NOT_ENOUGH)
        category_smile = discord.utils.get(guild.categories, name=":)")
        if role_not_enough and category_smile:
            view_perm = await get_tas_awakened()
            for channel in category_smile.channels:
                overwrite = channel.overwrites_for(role_not_enough)
                # noinspection PyUnresolvedReferences
                overwrite.view_channel = view_perm
                await channel.set_permissions(role_not_enough, overwrite=overwrite)

    # Channels we care about
    channel_names = {
        "fanmade_channel_link": CHANNEL_FANMADE,
        "sponsor_leeks_channel_link": CHANNEL_SPONSOR_LEEKS,
        "bugs_and_suggestions_channel_link": CHANNEL_BUGS_AND_SUGGESTIONS,
        "memes_channel_link": CHANNEL_MEMES,
        "discussions_channel_link": CHANNEL_DISCUSSIONS,
        "general_channel_link": CHANNEL_GENERAL,
    }

    # Get channel objects and build link dict
    link_dict = {}
    for key, name in channel_names.items():
        chan = await get_channel_by_name(name)
        link_dict[key] = f"<#{chan.id}>" if chan else f"#{name}"

    # Roles
    roles_channel = await get_channel_by_name(CHANNEL_ROLES)
    if roles_channel:
        await send_if_not_exists(
            roles_channel,
            replace_channel_links(role_explanation, link_dict),
            view=RolesView()
        )

    # Rules
    rules_channel = await get_channel_by_name(CHANNEL_RULES)
    if rules_channel:
        for rule in [rule1, rule2]:
            await send_if_not_exists(rules_channel, replace_channel_links(rule, link_dict))

    # Welcome
    welcome_channel = await get_channel_by_name(CHANNEL_WELCOME)
    if welcome_channel:
        await send_if_not_exists(welcome_channel, replace_channel_links(announcement, link_dict))

    print("[+] Setup complete. Bot is ready to serve.")


if __name__ == "__main__":
    bot.run(TOKEN)

# todo /submit-key to submit any puzzle solution for the saga's (once you actually do the sagas add this)
