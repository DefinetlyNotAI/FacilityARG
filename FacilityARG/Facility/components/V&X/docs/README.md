# Terminal VN Engine Documentation

A professional, terminal-aesthetic Visual Novel engine for React/Next.js applications with dynamic typing, branching
narratives, and a custom scripting language.

## Features

- 🖥️ **Terminal Aesthetic**: Authentic terminal look and feel with green monospace text
- ⌨️ **Dynamic Typing**: Smooth character-by-character text rendering
- 🔀 **Branching Narratives**: Support for choices and conditional paths
- 📝 **Custom Scripting Language**: Easy-to-learn syntax for creating VN stories
- 🎮 **Interactive Elements**: Choices, user input, and dynamic variables
- ♿ **Accessible**: Keyboard navigation, screen reader support, and responsive design
- 🎨 **Customizable**: Adjustable typing speed, custom styling, and theme support

## Installation

The engine is already included in your project. Simply import the components:

```typescript
import {TerminalVN} from '@/components/V&X/terminal-app';
import {generateExampleScript} from '@/components/V&X/terminal-vn-parser';
```

## Basic Usage

```typescript
'use client';

import {TerminalVN} from '@/components/V&X/terminal-app';

export default function MyStory() {
    const script = `
    @node start
    > System: Welcome to my story!
    > This is a simple example.
    @jump end

    @node end
    > System: Thanks for playing!
  `;

    return (
        <TerminalVN
            script = {script}
    onComplete = {()
=>
    {
        console.log('Story complete!');
    }
}
    />
)
    ;
}
```

## Scripting Language Reference

### Node Definition

Define story nodes (scenes/chapters):

```
@node node_name
```

Every script must have a `start` node.

### Dialogue

Display text to the user:

```
> Text without speaker
> Speaker Name: Text with speaker
```

### Commands

Execute actions and manipulate variables:

```
$ set variableName = value
$ add variableName 10
$ sub variableName 5
$ mul variableName 2
$ div variableName 4
$ log Message to display in console
$ clear
```

### Choices

Present options to the user:

```
? Prompt text
- Option 1 -> target_node
- Option 2 -> another_node
- Conditional option [score > 10] -> special_node
```

### User Input

Request text input from the user:

```
? {variableName} Prompt text
```

The user's input will be stored in the specified variable.

### Jumps

Navigate to another node:

```
@jump node_name
```

If no explicit jump is specified, the story ends when the node completes.

### Conditionals

Show content only when conditions are met:

```
[condition] > This text only shows if condition is true
[score >= 100] > You got a high score!
```

### Comments

Add comments to your script:

```
// This is a comment
# This is also a comment (and can define metadata)
```

### Metadata

Define story metadata:

```
# title: My Story Title
# author: Your Name
# version: 1.0
```

## Complete Example

```
# title: Adventure Demo
# author: VN Engine
# version: 1.0

@node start
> System: Welcome, brave adventurer!
$ set health = 100
$ set gold = 0
? {playerName} What is your name?

@node introduction
> Guide: Welcome, {playerName}!
> Your journey begins here.
> You have {health} HP and {gold} gold.
? Choose your path:
- Enter the forest -> forest
- Visit the town -> town
- Rest at camp -> rest

@node forest
> System: You venture into the dark forest...
$ sub health 10
$ add gold 25
> You found 25 gold but took 10 damage!
> Health: {health} | Gold: {gold}
? What now?
- Continue exploring [health > 20] -> forest_deep
- Return to camp -> rest
- Go to town -> town

@node forest_deep
> System: Deep in the forest, you find a treasure chest!
$ add gold 100
> You gained 100 gold!
@jump victory

@node town
> Merchant: Welcome to town, {playerName}!
[gold >= 50] > I see you have some gold to spend.
? What would you like to do?
- Buy health potion (50 gold) [gold >= 50] -> buy_potion
- Explore the forest -> forest
- Rest -> rest

@node buy_potion
$ sub gold 50
$ add health 30
> Merchant: Here's your potion!
> Health restored! Health: {health} | Gold: {gold}
@jump town

@node rest
$ set health = 100
> System: You rest and recover your health.
> Health: {health}
@jump introduction

@node victory
> System: Congratulations, {playerName}!
> Final Stats: {health} HP | {gold} Gold
> Thanks for playing!
@jump end

@node end
> System: Game Over
```

## Component Props

### TerminalVN

| Prop               | Type                                  | Default  | Description                    |
|--------------------|---------------------------------------|----------|--------------------------------|
| `script`           | `string`                              | required | The VN script to execute       |
| `onComplete`       | `() => void`                          | optional | Callback when story completes  |
| `onVariableChange` | `(vars: Record<string, any>) => void` | optional | Callback when variables change |
| `initialVariables` | `Record<string, any>`                 | `{}`     | Initial variable values        |
| `typingSpeed`      | `number`                              | `30`     | Milliseconds per character     |
| `className`        | `string`                              | `''`     | Additional CSS classes         |

## Keyboard Shortcuts

- **SPACE**: Skip typing animation
- **1-9**: Select choice option by number
- **ENTER**: Submit text input

## Advanced Features

### Variable Interpolation

Use `{variableName}` in dialogue to insert variable values:

```
$ set score = 100
> Your score is {score} points!
```

### Conditional Logic

Conditions support JavaScript expressions:

```
[score > 50 && health > 0]
[playerName === "Hero"]
[gold >= 100 || luck > 5]
```

### History Tracking

The engine automatically tracks node history, useful for implementing "back" functionality.

### Event Handling

Monitor engine events:

```typescript
<TerminalVN
    script = {script}
onVariableChange = {(vars)
=>
{
    console.log('Variables changed:', vars);
    // Save to localStorage, send to server, etc.
}
}
onComplete = {()
=>
{
    console.log('Story complete!');
    // Redirect, show credits, etc.
}
}
/>
```

## Styling

### Custom Themes

Override CSS variables:

```css
.terminal-vn {
    --vn-bg: #0a0a0a;
    --vn-text: #00ff00;
    --vn-border: #333;
}
```

### Custom Classes

Add custom styling:

```typescript
<TerminalVN
    script = {script}
className = "my-custom-terminal"
    / >
```

## Best Practices

1. **Start Simple**: Begin with linear stories, add branching later
2. **Test Conditions**: Always test conditional paths thoroughly
3. **Validate Scripts**: Use `validateScript()` to check for errors
4. **Save Variables**: Store important variables for save/load functionality
5. **Keep Nodes Focused**: Each node should represent a single scene/moment
6. **Use Comments**: Document complex logic and branches
7. **Error Handling**: Wrap script execution in try/catch blocks

## Troubleshooting

### Script won't parse

- Check for syntax errors in your script
- Ensure you have a `start` node
- Verify all jumps point to existing nodes

### Variables not updating

- Make sure variable names match exactly
- Check command syntax (`set`, `add`, etc.)
- Verify conditions are evaluating correctly

### Choices not showing

- Ensure choice format is correct (`? prompt` followed by `- option`)
- Check that conditions allow options to display
- Verify options array is not empty

## API Reference

### Parser Functions

```typescript
// Parse a script string into a structured object
parseVNScript(script
:
string
):
TerminalVNScript

// Validate a parsed script for errors
validateScript(script
:
TerminalVNScript
):
{
    valid: boolean;
    errors: string[]
}

// Generate an example script for testing
generateExampleScript()
:
string
```

## Examples

See `parser.ts` for a complete example script demonstrating all features.

## License

Part of the Facility project. See LICENSE file for details.

