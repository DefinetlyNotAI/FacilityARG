import {templates} from "@/lib/client/data/terminalVN/templates";

/**
 * Get a template by name
 */
export function getTemplate(name: keyof typeof templates): string {
    return templates[name] || templates.minimal;
}

/**
 * Generate example script
 */
export function generateExampleScript(): string {
    return `# title: Example VN Story
# author: Terminal VN Engine
# version: 1.0

@node start
> System: Welcome to the Terminal VN Engine
> This is a demonstration of the scripting language
$ set playerName = "Unknown"
? {playerName} What is your name?

@node greeting
> System: Nice to meet you, {playerName}!
$ set score = 0
> Now, let's test your knowledge...
? Choose a path:
- Learn about commands -> commands
- Try a quiz -> quiz
- End demo -> end

@node commands
> System: Commands allow you to manipulate variables and control flow
$ log Available commands: set, add, sub, mul, div, log, clear
$ add score 10
> You earned 10 points for curiosity!
? Continue?
- Go to quiz -> quiz
- End demo -> end

@node quiz
> System: Quick quiz! What is 2 + 2?
? Your answer:
- 4 [score >= 10] -> correct
- 4 -> correct_basic
- 3 -> wrong
- 5 -> wrong

@node correct
> System: Correct! Bonus points for exploring commands first!
$ add score 20
@jump finale

@node correct_basic
> System: Correct!
$ add score 10
@jump finale

@node wrong
> System: Not quite, but nice try!
$ add score 5
@jump finale

@node finale
> System: Your final score is {score} points!
> Thanks for trying the Terminal VN Engine!
@jump end

@node end
> System: Demo complete. Goodbye!
`;
}

/**
 * Generate a script template
 */
export function generateTemplate(title: string = 'My Story'): string {
    return `# title: ${title}
# author: Your Name
# version: 1.0

@node start
> System: Welcome to ${title}!
$ set gameStarted = true
? {playerName} What is your name?

@node introduction
> Narrator: Hello, {playerName}!
> Your story begins here...
? What would you like to do?
- Continue -> next_scene
- Skip intro -> main_menu

@node next_scene
> Narrator: Scene content goes here...
@jump main_menu

@node main_menu
> System: Main Menu
? Choose an option:
- Start Game -> game_start
- Settings -> settings
- Exit -> end

@node game_start
> Narrator: The game begins...
@jump end

@node settings
> System: Settings menu (not implemented yet)
@jump main_menu

@node end
> System: Thanks for playing!
`;
}
