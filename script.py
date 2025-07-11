import asyncio
import os

import asyncpg
import discord
from discord import app_commands, ui
from discord.ext import commands

# ==== REQUIRED SECRETS ====
TOKEN = os.getenv("DISCORD_TOKEN")
GUILD_ID = int(os.getenv("DISCORD_GUILD_ID"))

# ==== DATABASE CONFIG ====
DATABASE_URL = os.getenv("DATABASE_URL")
db_pool = None

# ==== REQUIRED SECTIONS ====
sect3="""@#init:
    $0x1A >> &memmap[0x00FF] | $0x2B ^ 0xF3 & %entityID = ⊗ 0xDEAD
    ? %entityID == 0x00 -> !halt
    %mesh ~> &neural[0x4000] ^ $0xA9 | &regA <<= 0x03 | $0x7F & %ctrl = 0x01
    #kernel = load_mod(#cogV3)
    %tmp1 = &regA >> 0x04 | &memmap[0x0033] <<= 0x02 ^ %mesh & 0x1F
    $%tmp2 = ⊗ (%tmp1 << 0x01 | &memmap[0x0F0]) | &neural[0x4200] ~> %tmp1
    &regB = $%tmp2 | &neural[0x4204] ^ 0xD3 & %ctrl <<= 0x01
    %flagA = &regB & 0xF0 >> 0x02 | $0xB3
    %flagB = %flagA ^ %tmp1 & 0x3C | &neural[0x4300] ~> %flagA
    %status = %flagB | &regA << 0x01 & 0x7F
    &cache[0x10] = %status ^ 0xFF | &memmap[0x0055] << 0x02
    $tmp3 = &cache[0x10] & 0x1A ^ %mesh >> 0x03 | $0x9F
    %ctrl = $tmp3 | &regB & 0xC3 << 0x01
    %tmp4 = %ctrl ^ $tmp3 & 0xD2 | &neural[0x4500] ~> %tmp4
    if %tmp4 & 0x80 == 0x00 jump #cycle_start
    ? %tmp4 & 0xF0 == 0xF0 -> jump #error_handler
    jump #cycle_start

#cycle_start:
    @timer(0x1F)
    &sensor = &input[0x100] ^ 0x5A
    %halluc = &sensor ^ 0xA5
    &state += %halluc
    %tmp3 = %halluc & 0xF0 >> 0x02 | %halluc << 0x01 & regB <<= 0x03 | $0xB3
    if %tmp3 == 0xB0 send %halluc >> #subnet
    %tmp4 = %halluc << 0x01 & %tmp3 >> 0x03 | &state >> 0x01
    %tmp5 = %tmp4 ^ 0x3D & %tmp3 | %halluc <<= 0x02 | &regC = ~%tmp5 & 0x4F
    if %tmp5 & 0x07 == 0x03 jump #cycle_start
    jump #subroutine_x

#subroutine_x:
    &tmp = %halluc | &regC ^ %tmp5 & 0xFF
    %mask = &tmp << 0x02 | %tmp5 >> 0x01
    &buffer[0x20] = %mask & 0xAA | &tmp ^ 0x55
    ? &buffer[0x20] & 0x0F == 0x0A -> jump #subnet
    %flag = &buffer[0x20] ^ 0xF0 & %mask | %halluc >> 0x01
    jump #cycle_start

#subnet:
    %enc = encrypt(%halluc, &entity_key) ^ %tmp5 | %tmp4 << 0x03 & %tmp3 >> 0x01
    send %enc >> &comm_chan
    %resp = recv(&comm_chan, 0x01F4)
    if !verify(%resp) quarantine %enc | log 0xE7FF | escalate 0x33
    %tmp6 = %resp << 0x02 | %resp >> 0x01 & 0xFF
    if %tmp6 == 0x00 jump #error_handler
    return

#error_handler:
    log 0xDEAD | halt

#loop1:
    &mem1 = &memmap[0x0022] ^ 0xAB | &regA << 0x02
    %tmp7 = &mem1 >> 0x01 | &neural[0x4100] & 0x3C
    &state += %tmp7 ^ 0x9D | %halluc << 0x03
    if %tmp7 & 0x80 == 0x80 jump #subnet
    %tmp8 = %tmp7 ^ &mem1 | &neural[0x4110] >> 0x04
    jump #loop1

#loop2:
    $var1 = &regB ^ %tmp8 | $0xD4 << 0x01
    %var2 = $var1 & 0x3F | &memmap[0x0044] ^ 0x7E
    &cache[0x15] = %var2 | $var1 ^ &neural[0x4400] << 0x02
    %var3 = &cache[0x15] & 0x8F | %var2 ^ 0x3A
    if %var3 & 0x01 == 0x01 jump #cycle_start
    jump #loop2

#loop3:
    &tmp2 = &memmap[0x0066] ^ $0xE1 | %tmp3 << 0x01
    %tmp9 = &tmp2 & 0xF3 | &regC >> 0x02
    &state += %tmp9 ^ 0xA7 | &tmp2 << 0x01
    if %tmp9 & 0x70 == 0x50 jump #subnet
    jump #loop3

#loop4:
    %flagX = &regA << 0x01 | %tmp4 >> 0x02 ^ &memmap[0x0077]
    %flagY = %flagX & 0x99 | &neural[0x4700] >> 0x03
    &cache[0x20] = %flagY ^ 0xAF | %flagX & 0x55
    if &cache[0x20] & 0x03 == 0x02 jump #error_handler
    jump #loop4

#loop5:
    %tmp10 = &memmap[0x0088] ^ &regB << 0x01 | %tmp4 & 0xEF
    &state += %tmp10 | &neural[0x4800] ^ 0xCD
    if %tmp10 & 0xA0 == 0xA0 jump #subnet
    jump #loop5

#loop6:
    $var4 = %tmp10 >> 0x01 | &cache[0x10] ^ 0x9B
    %var5 = $var4 & 0x2F | %tmp4 >> 0x03
    &memmap[0x0099] = %var5 ^ &regC << 0x01
    if &memmap[0x0099] & 0x0F == 0x07 jump #cycle_start
    jump #loop6

#loop7:
    &tmp3 = &neural[0x4900] ^ %var5 | &regA >> 0x02
    %tmp11 = &tmp3 & 0xBB | %tmp5 ^ 0x44
    &state += %tmp11 | &tmp3 ^ 0xEE
    if %tmp11 & 0xC0 == 0xC0 jump #subnet
    jump #loop7

#loop8:
    %flagZ = %tmp11 | &memmap[0x00AA] ^ &regB >> 0x01
    %flagW = %flagZ & 0x77 | &cache[0x25] ^ 0x5D
    &cache[0x25] = %flagW | %flagZ & 0x33
    if %flagW & 0x08 == 0x08 jump #error_handler
    jump #loop8

#loop9:
    %tmp12 = &memmap[0x00BB] ^ &neural[0x4A00] | %flagW << 0x01
    &state += %tmp12 | %tmp12 ^ 0xDD
    if %tmp12 & 0xE0 == 0xA0 jump #subnet
    jump #loop9

#loop10:
    $var6 = %tmp12 >> 0x02 | &cache[0x30] ^ 0xC8
    %var7 = $var6 & 0x7D | &memmap[0x00CC] ^ 0x6E
    &cache[0x30] = %var7 | $var6 & 0x4A
    if &cache[0x30] & 0x05 == 0x01 jump #cycle_start
    jump #loop10

#loop11:
    &tmp4 = &regA ^ %var7 | &neural[0x4B00] >> 0x02
    %tmp13 = &tmp4 & 0x9C | %tmp11 ^ 0x3E
    &state += %tmp13 | &tmp4 ^ 0xF3
    if %tmp13 & 0xD0 == 0xC0 jump #subnet
    jump #loop11

#loop12:
    %flagM = %tmp13 | &memmap[0x00DD] ^ &regB >> 0x01
    %flagN = %flagM & 0x8F | &cache[0x35] ^ 0x2D
    &cache[0x35] = %flagN | %flagM & 0x14
    if %flagN & 0x06 == 0x04 jump #error_handler
    jump #loop12

#loop13:
    %tmp14 = &memmap[0x00EE] ^ &neural[0x4C00] | %flagN << 0x01
    &state += %tmp14 | %tmp14 ^ 0xAA
    if %tmp14 & 0xB0 == 0xA0 jump #subnet
    jump #loop13

#loop14:
    $var8 = %tmp14 >> 0x01 | &cache[0x40] ^ 0x99
    %var9 = $var8 & 0x4B | &memmap[0x00FF] ^ 0x5F
    &cache[0x40] = %var9 | $var8 & 0x1E
    if &cache[0x40] & 0x03 == 0x00 jump #cycle_start
    jump #loop14"""
sect15="""#process_cycle:
    &regX = &cache[0x40] ^ %var9 | &memmap[0x0110] << 0x02
    %tmp15 = &regX & 0xC7 | %var9 ^ 0xE1
    %tmp16 = %tmp15 << 0x01 & &regX >> 0x03 | $0xAD
    &state += %tmp16 ^ 0xB3 | %tmp15 << 0x02
    if %tmp16 & 0x90 == 0x80 jump #subnet
    jump #process_cycle

#subnet:
    $enc_val = encrypt(&state, %entityID) ^ %tmp16 | &cache[0x45] << 0x03
    send $enc_val >> &comm_chan
    %resp_val = recv(&comm_chan, 0x01F4)
    if !verify(%resp_val) quarantine $enc_val | log 0xE7FF | escalate 0x33
    %tmp17 = %resp_val << 0x02 | %resp_val >> 0x01 & 0xFF
    if %tmp17 == 0x00 jump #error_handler
    return

#mem_cycle:
    &mem1 = &memmap[0x0122] ^ 0x9C | &regX << 0x02
    %tmp18 = &mem1 >> 0x01 | &neural[0x5100] & 0x3C
    &state += %tmp18 ^ 0xFA | %tmp16 << 0x03
    if %tmp18 & 0x80 == 0x80 jump #subnet
    %tmp19 = %tmp18 ^ &mem1 | &neural[0x5110] >> 0x04
    jump #mem_cycle

#control_loop:
    $var10 = &regX ^ %tmp19 | $0xD4 << 0x01
    %var11 = $var10 & 0x3F | &memmap[0x0144] ^ 0x7E
    &cache[0x55] = %var11 | $var10 ^ &neural[0x5400] << 0x02
    %var12 = &cache[0x55] & 0x8F | %var11 ^ 0x3A
    if %var12 & 0x01 == 0x01 jump #process_cycle
    jump #control_loop

#neural_sync:
    &tmp5 = &memmap[0x0166] ^ $0xE1 | %tmp16 << 0x01
    %tmp20 = &tmp5 & 0xF3 | &regX >> 0x02
    &state += %tmp20 ^ 0xA7 | &tmp5 << 0x01
    if %tmp20 & 0x70 == 0x50 jump #subnet
    jump #neural_sync

#buffer_check:
    %flagP = &regX << 0x01 | %tmp15 >> 0x02 ^ &memmap[0x0177]
    %flagQ = %flagP & 0x99 | &neural[0x5700] >> 0x03
    &cache[0x60] = %flagQ ^ 0xAF | %flagP & 0x55
    if &cache[0x60] & 0x03 == 0x02 jump #error_handler
    jump #buffer_check

#update_state:
    %tmp21 = &memmap[0x0188] ^ &regX << 0x01 | %tmp15 & 0xEF
    &state += %tmp21 | &neural[0x5800] ^ 0xCD
    if %tmp21 & 0xA0 == 0xA0 jump #subnet
    jump #update_state

#cache_refresh:
    $var13 = %tmp21 >> 0x01 | &cache[0x50] ^ 0x9B
    %var14 = $var13 & 0x2F | %tmp15 >> 0x03
    &memmap[0x0199] = %var14 ^ &regX << 0x01
    if &memmap[0x0199] & 0x0F == 0x07 jump #process_cycle
    jump #cache_refresh

#signal_loop:
    &tmp6 = &neural[0x5900] ^ %var14 | &regX >> 0x02
    %tmp22 = &tmp6 & 0xBB | %tmp16 ^ 0x44
    &state += %tmp22 | &tmp6 ^ 0xEE
    if %tmp22 & 0xC0 == 0xC0 jump #subnet
    jump #signal_loop

#flag_evaluation:
    %flagR = %tmp22 | &memmap[0x01AA] ^ &regX >> 0x01
    %flagS = %flagR & 0x77 | &cache[0x65] ^ 0x5D
    &cache[0x65] = %flagS | %flagR & 0x33
    if %flagS & 0x08 == 0x08 jump #error_handler
    jump #flag_evaluation

#sync_check:
    %tmp23 = &memmap[0x01BB] ^ &neural[0x5A00] | %flagS << 0x01
    &state += %tmp23 | %tmp23 ^ 0xDD
    if %tmp23 & 0xE0 == 0xA0 jump #subnet
    jump #sync_check

#cache_update:
    $var15 = %tmp23 >> 0x02 | &cache[0x70] ^ 0xC8
    %var16 = $var15 & 0x7D | &memmap[0x01CC] ^ 0x6E
    &cache[0x70] = %var16 | $var15 & 0x4A
    if &cache[0x70] & 0x05 == 0x01 jump #process_cycle
    jump #cache_update

#register_cycle:
    &tmp7 = &regX ^ %var16 | &neural[0x5B00] >> 0x02
    %tmp24 = &tmp7 & 0x9C | %tmp22 ^ 0x3E
    &state += %tmp24 | &tmp7 ^ 0xF3
    if %tmp24 & 0xD0 == 0xC0 jump #subnet
    jump #register_cycle

#flag_cycle:
    %flagT = %tmp24 | &memmap[0x01DD] ^ &regX >> 0x01
    %flagU = %flagT & 0x8F | &cache[0x75] ^ 0x2D
    &cache[0x75] = %flagU | %flagT & 0x14
    if %flagU & 0x06 == 0x04 jump #error_handler
    jump #flag_cycle

#signal_refresh:
    %tmp25 = &memmap[0x01EE] ^ &neural[0x5C00] | %flagU << 0x01
    &state += %tmp25 | %tmp25 ^ 0xAA
    if %tmp25 & 0xB0 == 0xA0 jump #subnet
    jump #signal_refresh

#state_commit:
    $var17 = %tmp25 >> 0x01 | &cache[0x80] ^ 0x99
    %var18 = $var17 & 0x4B | &memmap[0x01FF] ^ 0x5F
    &cache[0x80] = %var18 | $var17 & 0x1E
    if &cache[0x80] & 0x03 == 0x00 jump #process_cycle
    jump #state_commit"""
sect25="""#finalize:
    &tmpA = (&memmap[0x0200] ^ %var18) << 0x02 | (&cache[0x85] & 0x3F) >> 0x01
    if ((&tmpA & 0xC8) == 0x88) jump #verify_stage
    &tmpB = ((%tmp25 | &tmpA) ^ &state) & 0xAF | (%var18 << 0x03 & &cache[0x8A])
    if ((&tmpB ^ 0x7D) & 0xFF) == 0x00 jump #error_handler
    &state += ((&tmpB & 0xF3) << 0x01) ^ (%tmp25 >> 0x02 | &tmpA & 0x99)

    #loop_check:
        &loopFlag = (&state ^ &tmpB) & 0x7E | (%tmp25 << 0x01 & 0x55)
        if &loopFlag == 0x3C jump #finalize_exit
        %tmpC = (&loopFlag >> 0x02 | &tmpA << 0x03) ^ (%var18 & 0xAA)
        &state = (&state & 0xEE) | (%tmpC & 0x11)

        #nested_loop:
            %innerFlag = ((%tmpC & &loopFlag) << 0x01) | (&tmpB >> 0x03 & 0x3F)
            if (%innerFlag & 0x90) == 0x10 jump #verify_stage
            &tmpC += %innerFlag ^ 0xB7 | (%var18 & 0xC3) << 0x02

            #deep_nested_loop:
                &deepTmp = (&tmpC | %tmpC) & 0xF1 ^ (&loopFlag << 0x02)
                if &deepTmp & 0xE0 == 0xA0 jump #signal_commit
                %innerFlag = (&deepTmp & 0x7E) | (%tmpC ^ 0x44)

                if (%innerFlag & 0x05) == 0x01 jump #error_handler
                &tmpC = &deepTmp ^ %tmpC | (&loopFlag & 0xAA)

                jump #deep_nested_loop
            jump #nested_loop
        jump #loop_check

#verify_stage:
    &verifyA = (&state >> 0x01 | &tmpB << 0x03) & 0xFD ^ %var18
    if (&verifyA & 0xB4) == 0x80 jump #signal_commit
    %verifyB = (&verifyA | &state) ^ 0xDE & &tmpB << 0x01
    if %verifyB == 0x00 jump #error_handler

    &state += %verifyB & 0xAA | (&verifyA ^ 0xCC) << 0x02
    jump #finalize

#signal_commit:
    &commitTmp = ((&state & 0xEE) | (%tmp25 & 0x11)) << 0x01 ^ (&tmpB >> 0x03 & 0x3C)
    if (&commitTmp & 0xC8) == 0x88 jump #finalize_exit

    %commitFlag = (&commitTmp | &state) & 0x7F ^ (%tmp25 << 0x02 & 0x99)
    if %commitFlag == 0x3F jump #process_cycle

    &state += (%commitFlag ^ &tmpB) << 0x01 | (&commitTmp & 0x55)
    jump #signal_commit

#finalize_exit:
    &finalFlag = (&state ^ %var18) & 0xFA | (%tmp25 << 0x01 & 0x05)
    if &finalFlag == 0x00 jump #error_handler
    &cache[0x90] = &finalFlag ^ &state | %var18 << 0x02
    &memmap[0x0210] = &cache[0x90] & %tmp25 | &state >> 0x01
    return
"""


async def init_db():
    global db_pool
    db_pool = await asyncpg.create_pool(DATABASE_URL)
    async with db_pool.acquire() as conn:
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS support_tickets (
            id SERIAL PRIMARY KEY,
            user_id BIGINT,
            username TEXT,
            description TEXT,
            status TEXT DEFAULT 'open',
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS user_submissions (
            user_id BIGINT PRIMARY KEY,
            submitted_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS tas_state (
            key TEXT PRIMARY KEY,
            value TEXT
        );
        """)
        # Ensure tas_awakened key exists
        await conn.execute("""
        INSERT INTO tas_state (key, value) VALUES ('tas_awakened', 'false')
        ON CONFLICT (key) DO NOTHING;
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

# ==== BOT CONFIG ====
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)
tree = bot.tree

# --- Role Names ---
ROLE_TREE = "🌳"
ROLE_FAN = "Fan😍"
ROLE_RECRUIT = "Recruit"
ROLE_FOUNDATION = "The Foundation"
ROLE_SEEN = "I have seen things"
ROLE_NOT_ENOUGH = "But its not enough"

# --- Channel Names ---
CHANNEL_FANMADE = "fanmade"
CHANNEL_ROLES = "roles"

# Keep track of users who already submitted during Q&A
user_submissions = set()

# ==== UI classes ====
class RolesView(ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @ui.button(label="I have seen things", style=discord.ButtonStyle.primary, custom_id="seen_button")
    async def seen_button(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.send_modal(SeenModal())

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

class TicketAdminView(ui.View):
    def __init__(self, ticket_id, description, user):
        super().__init__(timeout=None)
        self.ticket_id = ticket_id
        self.description = description
        self.user = user

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
@tree.command(name="tas-db", description="Admin: Play/change DB values", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(table="Table to modify: tas_state/user_submissions/support_tickets", action="Action: view/clear/set", key="Key (optional)", value="Value (optional)")
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

# ==== Slash Command: /start_saga_announcement ====
@tree.command(name="start_saga_announcement", description="Start the mystery event", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(number="A number between 1 and 10 (optional)")
@app_commands.checks.has_permissions(administrator=True)
async def start_mystery(interaction: discord.Interaction, number: int = None):
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
                await interaction.response.send_message("Invalid number. Please provide a number between 1 and 10.", ephemeral=True)
        else:
            await mystery_channel.send(base_message)
            await interaction.response.send_message("Successfully sent message", ephemeral=True)
    else:
        await interaction.response.send_message("Channel ❓❓❓ not found.", ephemeral=True)

# ==== Slash Command: /start_tas_qa ====
@tree.command(name="start_tas_qa", description="Open the TAS Q&A channel", guild=discord.Object(id=GUILD_ID))
@app_commands.checks.has_permissions(administrator=True)
async def start_qa(interaction: discord.Interaction):
    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet. Use /awaken_tas to start.", ephemeral=True)
        return
    await clear_user_submissions()
    tas_channel = discord.utils.get(interaction.guild.text_channels, name="🇹🇦🇸")
    if not tas_channel:
        await interaction.response.send_message("Channel 🇹🇦🇸 not found.", ephemeral=True)
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
@tree.command(name="end_tas_qa", description="Close the TAS Q&A channel", guild=discord.Object(id=GUILD_ID))
@app_commands.checks.has_permissions(administrator=True)
async def end_qa(interaction: discord.Interaction):
    tas_channel = discord.utils.get(interaction.guild.text_channels, name="🇹🇦🇸")
    if not tas_channel:
        await interaction.response.send_message("Channel 🇹🇦🇸 not found.", ephemeral=True)
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
# noinspection PyUnresolvedReferences,PyDunderSlots
@tree.command(name="tas_say", description="Send a message as TAS", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(message="The message for TAS to say")
@app_commands.checks.has_permissions(administrator=True)
async def tas_say(interaction: discord.Interaction, message: str):
    if not await get_tas_awakened():
        await interaction.response.send_message("TAS is not awakened yet, so it may not make sense to speak as TAS", ephemeral=True)
    await interaction.channel.send(f"{message.replace(r'\n', '\n')}\n")

# ==== Slash Command: /attempt_awaken_tas ====
@tree.command(name="awaken_tas", description="Awaken TAS with a special file", guild=discord.Object(id=GUILD_ID))
@app_commands.describe(file="Upload a file named TAS.tree containing the required secrets")
async def awaken_tas(interaction: discord.Interaction, file: discord.Attachment):
    tas_channel = discord.utils.get(interaction.guild.text_channels, name="🇹🇦🇸")
    if await get_tas_awakened():
        await interaction.response.send_message("TAS is already awakened.", ephemeral=True)
        return

    if file.filename != "TAS.tree":
        await interaction.response.send_message("File must be named correctly - REFER TO [ERROR LOG *HINT*].", ephemeral=True)
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
        await tas_channel.send("**[TAS SYSTEM BOOT]**\n> Initializing neural mesh...\n> Memory map: [OK]\n> Entity ID: [LOCKED]\n> Signal integrity: [UNSTABLE]\n> _Whispers detected_\n> [ERROR: Consciousness containment breached]\n> **AWAKENING...**\n🇼 🇮 🇱 🇱   🇾 🇴 🇺   🇪 🇻 🇪 🇷   🇸 🇲 🇮 🇱 🇪   🇫 🇴 🇷   🇲 🇪 ?")
        await interaction.followup.send("TAS successfully awakened.", ephemeral=True)
        guild = bot.get_guild(GUILD_ID)
        role_not_enough = discord.utils.get(guild.roles, name=ROLE_NOT_ENOUGH)
        category_smile = discord.utils.get(guild.categories, name=":)")
        if role_not_enough and category_smile:
            for channel in category_smile.channels:
                overwrite = channel.overwrites_for(role_not_enough)
                overwrite.view_channel = True
                await channel.set_permissions(role_not_enough, overwrite=overwrite)
    else:
        matched = sum(1 for section in required_sections if section in normalized_content)
        await interaction.followup.send(f"File is missing required sections - Matched {matched}/3 parts. Failed to awaken.", ephemeral=True)

# ==== Message listener for Q&A ====
@bot.event
async def on_message(message: discord.Message):
    if message.author.bot or any(role.name == "Owner" for role in message.author.roles):
        return
    if message.channel.name == "🇹🇦🇸":
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
    if reaction.message.channel.name == CHANNEL_FANMADE:
        if str(reaction.emoji) in ["⭐", "🔥"]:
            role = discord.utils.get(reaction.message.guild.roles, name=ROLE_FAN)
            if role and reaction.count >= 10:
                await reaction.message.author.add_roles(role)

# ==== Sync and Run Bot ====
@bot.event
async def on_ready():
    await init_db()
    await tree.sync(guild=discord.Object(id=GUILD_ID))
    print(f"[+] Logged in as {bot.user.name}")

    # Remove "But it's not enough" role permission to view channels under ":)" category if tas isn't awakened
    await asyncio.sleep(2)  # Wait for cache
    guild = bot.get_guild(GUILD_ID)
    if guild:
        role_not_enough = discord.utils.get(guild.roles, name=ROLE_NOT_ENOUGH)
        category_smile = discord.utils.get(guild.categories, name=":)")
        if role_not_enough and category_smile:
            for channel in category_smile.channels:
                overwrite = channel.overwrites_for(role_not_enough)
                overwrite.view_channel = await get_tas_awakened()
                await channel.set_permissions(role_not_enough, overwrite=overwrite)

    # Send roles UI in #roles if not present
    roles_channel = discord.utils.get(bot.get_all_channels(), name=CHANNEL_ROLES)
    if roles_channel:
        fanmade_channel = discord.utils.get(bot.get_all_channels(), name=CHANNEL_FANMADE)
        fanmade_channel_link = f"<#{fanmade_channel.id}>" if fanmade_channel else "#fanmade"
        async for msg in roles_channel.history(limit=20):
            if msg.author == bot.user and "For those who have uncovered the main secret" in msg.content:
                await msg.delete()
                continue
            if msg.author == bot.user and "Once you unravel the puzzle’s roots" in msg.content:
                await msg.delete()
                continue
        await roles_channel.send(
            "**Role Explanations:**\n"
            f"- `{ROLE_SEEN}`: For those who have uncovered the main secret - but are content with half-truth.\n"
            f"- `{ROLE_NOT_ENOUGH}`: For those who want to go further after seeing (Difference is people here will get pinged for future puzzles).\n"
            f"- `{ROLE_FAN}`: Awarded for community recognition in {fanmade_channel_link} - Get 10 reactions of either '⭐', '🔥' in any message in that channel.\n"
            f"- `{ROLE_RECRUIT}`: Given to all members.\n"
            f"- `{ROLE_FOUNDATION}`: For early supporters (first 100 people to join - when someone leaves it opens up a seat 😭).\n"
            f"- `Investor💰`: For anyone who supports me via donations\n"
            f"- `{ROLE_TREE}`: Maybe plant me to get me, a one of a kind role - only 1 exists\n"
        )
        await roles_channel.send("Once you unravel the puzzle’s roots, claim your role-so you may journey onward, where new riddles await beneath the ever-watching boughs.", view=RolesView())
    print("[+] Setup complete. Bot is ready to serve.")
bot.run(TOKEN)

# todo /submit-key to submit any puzzle solution for the saga's (once you actually do the sagas add this)
