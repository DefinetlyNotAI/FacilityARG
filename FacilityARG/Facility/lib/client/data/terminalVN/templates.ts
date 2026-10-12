/**
 * VN Script Templates
 * Ready-to-use templates for different types of visual novels
 */

export const templates = {
    /**
     * Minimal template - Simplest possible VN
     */
    minimal: `@node start
> System: This is a minimal VN template.
> Add your story here!
@jump end

@node end
> System: The end.
`,

    /**
     * Basic story template with choices
     */
    basic: `# title: My Story
# author: Your Name
# version: 1.0

@node start
> Narrator: Welcome to my visual novel!
> This is a basic template with choices.
? What would you like to do?
- Continue the story -> chapter1
- Skip to ending -> end

@node chapter1
> Narrator: Chapter 1 begins here...
> Add your story content.
@jump end

@node end
> Narrator: Thanks for reading!
`,

    /**
     * RPG-style adventure template
     */
    rpg: `# title: RPG Adventure
# author: Your Name
# version: 1.0

@node start
$ set health = 100
$ set gold = 0
$ set level = 1
? {playerName} Enter your character name:

@node hub
> System: === CHARACTER STATUS ===
> Name: {playerName}
> Level: {level}
> Health: {health} HP
> Gold: {gold}g
> ======================
? What would you like to do?
- Explore -> explore
- Shop -> shop
- Rest -> rest
- Quit -> end

@node explore
> Narrator: You venture into the wilderness...
$ set encounter = "random"
$ sub health 15
$ add gold 30
> You encountered a monster!
> Lost 15 HP, gained 30 gold.
[health <= 0] @jump game_over
@jump hub

@node shop
> Merchant: Welcome to my shop!
> Healing potions cost 50 gold.
[gold >= 50] ? Buy a potion?
[gold >= 50] - Yes -> buy_potion
- Leave shop -> hub

@node buy_potion
$ sub gold 50
$ add health 40
> Merchant: Here's your potion!
> Restored 40 HP!
@jump shop

@node rest
> Narrator: You rest at the inn...
$ set health = 100
> Health fully restored!
@jump hub

@node game_over
> System: GAME OVER
> You were defeated!
> Final stats: Level {level}, {gold} gold
@jump end

@node end
> System: Thanks for playing!
`,

    /**
     * Mystery/Detective template
     */
    mystery: `# title: Mystery Story
# author: Your Name
# version: 1.0

@node start
$ set clues = 0
$ set suspicion = 0
> Detective: A murder has occurred...
> You must investigate and find the culprit.
? {detectiveName} What's your name, detective?

@node investigation_hub
> Detective {detectiveName}: Let's review what we know.
> Clues found: {clues}
? Where to investigate next?
- Interview witness -> witness
- Search crime scene -> crime_scene
- Confront suspect [clues >= 3] -> confront
- Give up -> end

@node witness
> Witness: I saw someone suspicious...
$ add clues 1
$ add suspicion 10
> You found a clue!
@jump investigation_hub

@node crime_scene
> {detectiveName}: Let me examine this area...
$ add clues 2
> You discovered important evidence!
@jump investigation_hub

@node confront
[clues >= 5] @jump solve
[clues < 5] @jump fail

@node solve
> {detectiveName}: I've figured it out!
> The culprit is... [dramatic reveal]
> Case solved!
@jump end

@node fail
> {detectiveName}: I don't have enough evidence...
> The case remains unsolved.
@jump end

@node end
> System: Case closed.
> Clues collected: {clues}
`,

    /**
     * Dating sim template
     */
    datingSim: `# title: Dating Sim
# author: Your Name
# version: 1.0

@node start
$ set romance_a = 0
$ set romance_b = 0
$ set day = 1
? {playerName} What's your name?

@node daily_life
> Narrator: Day {day}
> You wake up to a beautiful morning.
? What would you like to do today?
- Hang out with Alex -> meet_alex
- Spend time with Blake -> meet_blake
- Study alone -> study
- Fast forward to ending [day >= 7] -> ending

@node meet_alex
$ add romance_a 10
$ add day 1
> Alex: Hey {playerName}! Want to grab coffee?
> You had a great time with Alex.
> Alex relationship: +10
@jump daily_life

@node meet_blake
$ add romance_b 10
$ add day 1
> Blake: {playerName}! I was hoping to see you!
> You enjoyed spending time with Blake.
> Blake relationship: +10
@jump daily_life

@node study
$ add day 1
> Narrator: You spent the day studying.
> Your knowledge increased!
@jump daily_life

@node ending
[romance_a > romance_b] @jump ending_alex
[romance_b > romance_a] @jump ending_blake
@jump ending_neutral

@node ending_alex
> Alex: {playerName}, I... I love you!
> ALEX ENDING ACHIEVED
@jump end

@node ending_blake
> Blake: {playerName}, you mean everything to me!
> BLAKE ENDING ACHIEVED
@jump end

@node ending_neutral
> Narrator: You graduated, but alone...
> NEUTRAL ENDING
@jump end

@node end
> Narrator: Thanks for playing!
`,

    /**
     * Interactive tutorial template
     */
    tutorial: `# title: VN Engine Tutorial
# author: Terminal VN Engine
# version: 1.0

@node start
> Tutorial: Welcome to the VN Engine tutorial!
> This will teach you how to use the scripting language.
? Ready to begin?
- Yes, let's go! -> lesson1
- Skip tutorial -> end

@node lesson1
> Tutorial: Lesson 1 - Basic Dialogue
> Lines starting with > create dialogue.
> You can also add speakers: > Name: Text
? Continue to next lesson?
- Next -> lesson2
- Back to start -> start

@node lesson2
> Tutorial: Lesson 2 - Variables
$ set example = 42
> Use $ commands to set variables.
> Example value: {example}
$ add example 8
> After adding 8: {example}
? Continue?
- Next -> lesson3
- Previous -> lesson1

@node lesson3
> Tutorial: Lesson 3 - Choices
> The ? symbol creates choices.
> Options start with - and can jump to nodes.
? Which lesson interests you?
- User Input -> lesson4
- Conditions -> lesson5
- Finish tutorial -> complete

@node lesson4
> Tutorial: Lesson 4 - User Input
> You can ask users for text input:
? {userName} Enter your name:

@node lesson4_result
> Tutorial: Hello, {userName}!
> Your input was stored in a variable.
? Continue?
- Next -> lesson5
- Back -> lesson3

@node lesson5
> Tutorial: Lesson 5 - Conditions
$ set score = 75
> Conditions use [brackets]
[score >= 70] > Your score ({score}) is passing!
[score < 70] > Your score ({score}) needs improvement.
? Ready to complete?
- Finish -> complete
- Review lessons -> start

@node complete
> Tutorial: Congratulations!
> You've completed the tutorial.
> Now you can create your own VN stories!
@jump end

@node end
> Tutorial: Tutorial complete!
`,
};
