# Quest Tracker

A web-based, modular quest tracking system for managing complex questlines with dependencies, auto-resolution logic, and
secret quests.

## Table of Contents

- [Features](#features)
- [User Guide](#user-guide)
- [Developer Documentation](#developer-documentation)
- [JSON (TSX) Schema Reference](#json-tsx-schema-reference)
- [Advanced Usage Examples](#advanced-usage-examples)
- [License](#license)

## Features

- **Questline Organization**: Group quests into logical questlines
- **Quest Status Visualization**: Track quest status (Pending, Solved, Failed) with visual indicators
- **Quest Dependencies**: Set requirements between quests with automatic locking
- **Auto-Resolution Logic**: Automatically resolve or fail quests based on dependencies
- **Secret Quests**: Hide quest details until they are discovered
- **Missable Quests**: Track quests that can be permanently failed
- **Quest Filtering**: Filter quests by status (Pending, Solved, Failed)
- **Search Functionality**: Find quests by name or description
- **Progress Tracking**: View completion percentage for each questline
- **Quest Statistics**: View overall completion statistics
- **Dependency Visualization**: Visual graph showing quest dependencies
- **Quest Timeline**: Chronological view of questlines and quests
- **Quest Rewards**: Track rewards associated with quests
- **Quest Difficulty**: Rate quests by difficulty level
- **Quest Categories**: Categorize quests by type (Main, Side, Hidden, etc.)
- **Time Estimates**: Track estimated completion time for quests
- **Questline Relationships**: Show connections between different questlines
- **Boolean Logic for Fail Conditions**: Use AND, OR, XOR, NAND, and NOR operators in fail conditions
- **Quest Credits**: Track who solved each quest and when
- **Light/Dark Mode**: Toggle between light and dark themes with cookie-based persistence
- **Submission Info**: Information on how to submit quest solutions for global recognition

## User Guide

### Getting Started

1. **Browse Questlines**: The left sidebar displays all available questlines
2. **View Quest Details**: Click on any quest to see its details in the main panel
3. **Track Progress**: Each questline shows a progress bar indicating completion percentage
4. **View Statistics**: Click the Statistics tab to see overall quest completion statistics
5. **Explore Dependencies**: Use the Dependencies tab to visualize quest relationships
6. **View Timeline**: Check the Timeline tab to see quests in chronological order
7. **Toggle Theme**: Switch between light and dark mode using the theme toggle button
8. **View Submission Info**: Click the Submission Info button to learn how to submit your solutions

### Understanding Quest Status

Quests can have one of three statuses:

- **Pending** (white circle): Quest is available but not completed
- **Solved** (green checkmark): Quest has been successfully completed
- **Failed** (red X): Quest has failed and cannot be completed

### Special Quest Types

- **Secret Quests** (purple question mark): Hidden quests that show as "???" until discovered
- **Auto-Solve Quests** (marked with *): Quests that automatically solve when the previous quest is completed
- **Missable Quests** (red alert icon): Quests that can be permanently failed based on specific conditions

### Quest Dependencies

- **Locked Quests** (lock icon): Quests that require other quests to be completed first
- **Auto-Fail Conditions**: Some quests will automatically fail if their dependencies fail

### Quest Credits

When a quest is solved, credit information is displayed showing:

- The name of the person who solved the quest
- The date when the quest was solved

To get your solution recognized globally, use the Submission Info button to learn how to submit your solutions.

### Filtering and Searching

1. Use the search bar to find quests by name or description
2. Click the filter icon to filter quests by status (Pending, Solved, Failed)
3. Clear filters to see all quests again

### Using the Dependency Graph

1. Select a questline to view its dependency graph
2. Blue lines indicate requirements (quest A requires quest B)
3. Red dashed lines indicate fail conditions (quest A fails if quest B fails)
4. Purple dotted lines indicate related quests
5. Click on any quest node to select that quest

### Exploring the Timeline

1. The timeline shows questlines in chronological order
2. Each questline shows its category, location, and level requirements
3. Quests within each questline are displayed with their status and difficulty
4. Click on any quest to view its details

## Developer Documentation

### Project Structure

```
quest-tracker/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main application page
├── components/
│   ├── quest-detail.tsx  # Quest detail view
│   ├── quest-filter.tsx  # Quest filtering component
│   ├── quest-item.tsx    # Individual quest list item
│   ├── quest-statistics.tsx # Statistics dashboard
│   ├── quest-dependency-graph.tsx # Dependency visualization
│   ├── quest-timeline.tsx # Chronological view
│   ├── quest-rewards.tsx # Quest rewards component
│   ├── questline-list.tsx # Questline list component
│   ├── theme-provider.tsx # Theme context provider
│   ├── theme-toggle.tsx  # Theme toggle button
│   ├── submission-info.tsx # Submission information dialog
│   └── ui/               # UI components (shadcn/ui)
├── lib/
│   ├── quest-utils.ts    # Quest processing utilities
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # General utilities
└── public/
    └── ...               # Static assets
```

### Core Data Types

The application uses the following key data types:

```typescript
// Quest description
interface QuestDesc {
    Synopsis: string
    Trivia?: string
    Relations?: string
}

// Quest reward
interface QuestReward {
    type: "Item" | "Experience" | "Currency" | "Reputation" | "Skill" | "Achievement"
    name: string
    amount?: number
    description?: string
}

// Boolean logic operators for failIfFailed conditions
type LogicOperator = "AND" | "OR" | "XOR" | "NAND" | "NOR"

// failIfFailed can now be a string, array of strings, or array with logic operators
type FailCondition = string | (string | LogicOperator)[]

// Quest credit information
interface QuestCredit {
    name: string
    date: string
}

// Individual quest data
interface QuestData {
    QuestName: string
    DetailsForSubmission: string
    SolveStatus: "Solved" | "Failed" | "Pending"
    MissName?: string
    MissInfo?: string
    Requirement?: string[]
    Secret?: boolean
    SecretHint?: string
    failIfFailed?: FailCondition
    QuestDesc?: QuestDesc
    isLocked?: boolean
    autoSolve?: boolean
    difficulty?: 1 | 2 | 3 | 4 | 5
    category?: "Main" | "Side" | "Hidden" | "Special" | "Daily" | "Weekly"
    timeEstimate?: number
    rewards?: QuestReward[]
    relatedQuestlines?: string[]
    QuestCredit: QuestCredit // Compulsory field for tracking who solved the quest
}

// Questline containing multiple quests
interface Questline {
    questline_name: string
    quests: QuestData[]
    description?: string
    category?: "Main Story" | "Side Content" | "Special Event" | "Tutorial"
    requiredLevel?: number
    recommendedLevel?: number
    location?: string
    timeline?: number
}

// Quest connection for dependency graph
interface QuestConnection {
    source: string
    target: string
    type: "requires" | "unlocks" | "fails" | "related"
}

// Theme type for light/dark mode
type Theme = "light" | "dark"
```

### Quest Resolution Rules

- A quest is **locked** if any of its required quests are not solved or failed
- A quest will **auto-fail** if its `failIfFailed` condition evaluates to true
- A quest will **auto-solve** if it's marked with * and the previous quest is solved

## JSON TSX Schema Reference

### Complete Schema

```tsx
import {Questline} from "@/lib/types";

export const Data: Questline[] = [
    {
        questline_name: "String (required)",
        description: "String (optional) - questline description",
        category: "String (optional) - one of: 'Main Story', 'Side Content', 'Special Event', 'Tutorial'",
        requiredLevel: "Number (optional) - minimum level required",
        recommendedLevel: "Number (optional) - recommended level",
        location: "String (optional) - questline location",
        timeline: "Number (optional) - chronological order",
        quests: [
            {
                QuestName: "String (required)",
                DetailsForSubmission: "String (required) - use {{ QuestName }} for links",
                SolveStatus: "String (required) - one of: 'Solved', 'Failed', 'Pending'",
                QuestDesc: {
                    Synopsis: "String (required) - use {{ QuestName }} for links",
                    Trivia: "String (optional) - use {{ QuestName }} for links",
                    Relations: "String (optional) - use {{ QuestName }} for links",
                },
                Requirement: ["String (optional) - array of quest names, dont use {{ QuestName }} just use the raw name"],
                MissName: "String (optional) - name shown when quest fails",
                MissInfo: "String (optional) - description of failure condition",
                Secret: "Boolean (optional) - whether quest is a secret or not",
                SecretHint: "String (optional) - hint for secret quests",
                failIfFailed: "String(optional) - quests that cause this quest to fail if they are failed, more info downwards",
                failIfPending: "String(optional) - quests that cause this quest to fail if they are pending and unlocked, more info downwards",
                manualLock: "Boolean (optional) - if true, this quest will be locked until manually unlocked - useful and recommended for quests that use failIfPending if the quest has requirements that are manual",
                difficulty: "Number (optional) - 1-5 star scale",
                category: "String (optional) - one of: 'Main', 'Side', 'Hidden', 'Special', 'Daily', 'Weekly'",
                timeEstimate: "Number (optional) - estimated time in minutes",
                rewards: [
                    {
                        type: "String (required) - one of: 'Item', 'Experience', 'Currency', 'Reputation', 'Skill', 'Achievement'",
                        name: "String (required) - reward name",
                        amount: "Number (optional) - reward amount",
                        description: "String (optional) - reward description",
                    },
                ],
                relatedQuestlines: ["String (optional) - related questline names (Note these dont link), dont use {{ QuestName }} just use the raw name"],
                QuestCredit: {
                    name: "String (required only if SolveStatus is Solved) - name of person who solved the quest",
                    date: "String (required only if SolveStatus is Solved) - date when the quest was solved",
                },
            },
        ],
    },
];
```

### Field Descriptions

#### Questline Fields

| Field            | Type   | Required | Description                                                |
|------------------|--------|----------|------------------------------------------------------------|
| questline_name   | String | Yes      | Name of the questline group                                |
| quests           | Array  | Yes      | Array of quest objects in this questline                   |
| description      | String | No       | Description of the questline                               |
| category         | String | No       | Category of the questline (Main Story, Side Content, etc.) |
| requiredLevel    | Number | No       | Minimum level required to start the questline              |
| recommendedLevel | Number | No       | Recommended level for the questline                        |
| location         | String | No       | Location where the questline takes place                   |
| timeline         | Number | No       | Chronological order in the story (lower = earlier)         |

#### Quest Fields

| Field                | Type    | Required | Description                                                             |
|----------------------|---------|----------|-------------------------------------------------------------------------|
| QuestName            | String  | Yes      | Unique identifier for the quest. Add * at the end for auto-solve quests |
| DetailsForSubmission | String  | Yes      | Description of the quest shown when pending                             |
| SolveStatus          | String  | Yes      | Current status: "Solved", "Failed", or "Pending"                        |
| QuestDesc            | Object  | No       | Additional quest information shown when solved                          |
| Requirement          | Array   | No       | List of quest names that must be completed before this quest            |
| MissName             | String  | No       | Name to display when quest fails                                        |
| MissInfo             | String  | No       | Description of why the quest failed                                     |
| Secret               | Boolean | No       | If true, quest will show as "???" until solved or failed                |
| SecretHint           | String  | No       | Hint shown for secret quests that are pending                           |
| failIfFailed         | String  | No       | List of quests that cause this quest to fail if they fail               |
| difficulty           | Number  | No       | Difficulty rating on a scale of 1-5 (5 being hardest)                   |
| category             | String  | No       | Category of the quest (Main, Side, Hidden, etc.)                        |
| timeEstimate         | Number  | No       | Estimated time to complete in minutes                                   |
| rewards              | Array   | No       | Array of reward objects for completing the quest                        |
| relatedQuestlines    | Array   | No       | Names of questlines related to this quest                               |
| QuestCredit          | Object  | Yes      | Information about who solved the quest and when                         |

#### QuestDesc Fields

| Field     | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| Synopsis  | String | Yes      | Description shown when quest is solved          |
| Trivia    | String | No       | Optional trivia information                     |
| Relations | String | No       | Description of how this quest relates to others |

#### QuestReward Fields

| Field       | Type   | Required | Description                                       |
|-------------|--------|----------|---------------------------------------------------|
| type        | String | Yes      | Type of reward (Item, Experience, Currency, etc.) |
| name        | String | Yes      | Name of the reward                                |
| amount      | Number | No       | Quantity of the reward                            |
| description | String | No       | Description of the reward                         |

#### QuestCredit Fields

| Field | Type   | Required | Description                             |
|-------|--------|----------|-----------------------------------------|
| name  | String | Yes      | Name of the person who solved the quest |
| date  | String | Yes      | Date when the quest was solved          |

### Special Syntax

#### **Auto-Solve Quests**

Add an asterisk (*) to the end of QuestName to mark it as an auto-solve for the previous quest,
This means it will automatically change to the status of the previous quest,

  ```tsx
  {
    QuestName: "Victory Celebration*"
}
  ```

#### **Quest Links**

Use `{{ QuestName }}` to create links to other quests

  ```tsx
  {
    Relations: "This leads to {{ Secret Chamber }}."
}
  ```

#### **failIfX Quests**

This works for both `failIfFailed` and `failIfPending` conditions.

The application uses a multi-pass approach to process quest data:

1. **Validation Pass**: Validates unique quest names and schema requirements
2. **Auto-Solve Pass**: Marks quests with * for auto-solve
3. **Lock Status Pass**: Determines which quests are locked based on requirements
4. **Auto-Fail Pass**: Applies auto-fail logic for quests that aren't locked

##### **Basic Logic**

* `{{ Quest A }}` <-- Only 1 quest passed means it will fail if this quest fails.
* `{{ Quest A }} AND {{ Quest B }}` <-- If both quests fail, fail this quest
* `{{ Quest A }} OR {{ Quest B }}` <-- If either quest fails, fail this quest

Available logic: `AND`, `OR`, `NAND`, `NOR`, `XOR`

##### **With Parentheses**

* `({{ Quest A }} AND {{ Quest B }}) OR {{ Quest C }}` <-- Both quests A and B must be failed OR quest C must be failed
  to fail this quest
* `{{ Quest A }} AND ({{ Quest B }} OR {{ Quest C }})` <-- Either quests B and C must be failed AND quest A must be
  failed to fail this quest

##### **Deep Nesting**

`This is still untested thoroughly`

* `(({{ Q1 }} AND {{ Q2 }}) OR ({{ Q3 }} AND ({{ Q4 }} XOR {{ Q5 }})))`

---

##### **Limitations**

1. **No unary `NOT` support**
   There’s no way to write `NOT {{ Quest X }}` – you'd need to use `NOR`/`NAND` logic for negative logic.

2. **Flat precedence rules (mostly)**
   While parentheses fix operator grouping, this parser **does not apply true precedence rules** like in classical logic
   parsers.
   Instead:

    - `parseExpression()` handles OR/NOR/XOR
    - `parseTerm()` handles AND/NAND, So:
        - `A AND B OR C` is parsed as `(A AND B) OR C`
          But if the user meant `A AND (B OR C)`, they must **use parentheses**.

3. **Multiple top-level operators without parentheses = warning**
   Expressions like `{{ A }} AND {{ B }} OR {{ C }}` are ambiguous unless parenthesized, if an ambiguous query is passed
   a warning will be raised.
   ```ts
   console.warn(`Warning: Multiple different logic operators used without parentheses`)
   ```

## Advanced Usage Examples

### Basic Quest Chain

This example shows a simple linear quest chain where each quest requires the previous one:

```tsx
export const Data: Questline[] = [
    {
        questline_name: "Simple Chain",
        quests: [
            {
                QuestName: "First Quest",
                DetailsForSubmission: "Complete the first quest.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "You completed the first quest.",
                    Relations: "This unlocks {{ Second Quest }}."
                },
                QuestCredit: {
                    name: "Pending",
                    date: "Pending"
                }
            },
            {
                QuestName: "Second Quest",
                DetailsForSubmission: "Complete the second quest.",
                SolveStatus: "Pending",
                Requirement: ["First Quest"],
                QuestDesc: {
                    Synopsis: "You completed the second quest.",
                    Relations: "This unlocks {{ Third Quest }}."
                },
                QuestCredit: {
                    name: "Pending",
                    date: "Pending"
                }
            },
            {
                QuestName: "Third Quest",
                DetailsForSubmission: "Complete the third quest.",
                SolveStatus: "Pending",
                Requirement: ["Second Quest"],
                QuestDesc: {
                    Synopsis: "You completed the third quest."
                },
                QuestCredit: {
                    name: "Pending",
                    date: "Pending"
                }
            }
        ]
    }
]
```

### Complex Fail Conditions with Boolean Logic

This example shows how to use boolean logic operators in fail conditions:

```tsx
export const Data: Questline[] = [{
    questline_name: "Logic Puzzles",
    quests: [
        {
            QuestName: "AND Example",
            DetailsForSubmission: "This quest fails if both Puzzle A and Puzzle B fail.",
            SolveStatus: "Pending",
            MissName: "Logic Failure",
            MissInfo: "You failed to solve both puzzles.",
            failIfFailed: [
                "Puzzle A",
                "AND",
                "Puzzle B"
            ],
            QuestDesc: {
                Synopsis: "You successfully solved the AND logic puzzle."
            },
            QuestCredit: {
                name: "Pending",
                date: "Pending"
            }
        },
        {
            QuestName: "OR Example",
            DetailsForSubmission: "This quest fails if either Puzzle A or Puzzle B fail.",
            SolveStatus: "Pending",
            MissName: "Logic Failure",
            MissInfo: "You failed to solve at least one puzzle.",
            failIfFailed: [
                "Puzzle A",
                "OR",
                "Puzzle B"
            ],
            QuestDesc: {
                Synopsis: "You successfully solved the OR logic puzzle."
            },
            QuestCredit: {
                name: "Pending",
                date: "Pending"
            }
        },
        {
            QuestName: "XOR Example",
            DetailsForSubmission: "This quest fails if exactly one of Puzzle A or Puzzle B fails.",
            SolveStatus: "Pending",
            MissName: "Logic Failure",
            MissInfo: "You failed to solve exactly one puzzle.",
            failIfFailed: [
                "Puzzle A",
                "XOR",
                "Puzzle B"
            ],
            QuestDesc: {
                Synopsis: "You successfully solved the XOR logic puzzle."
            },
            QuestCredit: {
                name: "Pending",
                date: "Pending"
            }
        }
    ]
}]
```

### Quest with Credits and Rewards

This example shows a quest with credits, rewards, difficulty rating, and time estimate:

```tsx
export const Data: Questline[] = [{
    questline_name: "Treasure Hunt",
    quests: [
        {
            QuestName: "Find the Map",
            DetailsForSubmission: "Locate the treasure map.",
            SolveStatus: "Solved",
            difficulty: 2,
            category: "Main",
            timeEstimate: 30,
            QuestDesc: {
                Synopsis: "You found the treasure map."
            },
            rewards: [
                {
                    type: "Item",
                    name: "Treasure Map",
                    description: "A map showing the location of buried treasure."
                },
                {
                    type: "Experience",
                    name: "XP",
                    amount: 100,
                    description: "Experience points for finding the map."
                }
            ],
            QuestCredit: {
                name: "Explorer Jane",
                date: "2023-05-15"
            }
        }
    ],
    description: "Hunt for buried treasure using an ancient map.",
    category: "Side Content",
    recommendedLevel: 5,
    location: "Coastal Shores"
},
] 
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and Tailwind CSS
- UI components from shadcn/ui
- Icons from Lucide React
