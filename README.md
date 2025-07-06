# Quest Tracker

A sophisticated web-based quest tracking system designed for managing complex ARG (Alternate Reality Game) questlines with advanced dependency resolution, boolean logic conditions, and comprehensive progress tracking.

## 🌟 Features

### Core Quest Management
- **Multi-Questline Organization**: Group related quests into logical questlines with metadata
- **Advanced Status Tracking**: Visual indicators for Pending, Solved, and Failed quests
- **Smart Dependency System**: Automatic quest locking based on requirements
- **Boolean Logic Conditions**: Complex fail conditions using AND, OR, XOR, NAND, NOR operators
- **Auto-Resolution Engine**: Automatic quest solving and failing based on dependencies

### Special Quest Types
- **Secret Quests**: Hidden quests that display as "???" until discovered
- **Auto-Solve Quests**: Quests that automatically resolve when conditions are met
- **Missable Quests**: Quests with permanent failure conditions
- **Manual Lock System**: Override automatic locking for special scenarios

### User Interface
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Advanced Filtering**: Filter by status, search by name/description
- **Progress Visualization**: Real-time completion percentages and statistics
- **Dependency Graph**: Interactive visual representation of quest relationships
- **Timeline View**: Chronological questline progression
- **Dark Theme**: Professional dark mode interface

### Data Management
- **Quest Credits**: Track who solved each quest and when
- **Reward System**: Comprehensive reward tracking with multiple types
- **Difficulty Ratings**: 1-5 star difficulty system
- **Time Estimates**: Track expected completion times
- **Cross-Questline Relations**: Link quests across different questlines

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd quest-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

### Basic Usage

1. **Navigate Questlines**: Browse questlines in the left sidebar
2. **View Quest Details**: Click any quest to see comprehensive information
3. **Track Progress**: Monitor completion percentages and statistics
4. **Explore Dependencies**: Use the dependency graph to understand quest relationships
5. **Submit Solutions**: Use the submission info to get your solutions recognized globally

## 📱 Mobile Support

The application is fully responsive with:
- **Collapsible Sidebar**: Overlay sidebar on mobile with hamburger menu
- **Optimized Tabs**: Properly sized tab navigation for touch devices
- **Touch-Friendly**: All interactive elements sized for mobile interaction
- **Adaptive Layout**: Content reflows appropriately for different screen sizes

## 🏗️ Architecture

### Project Structure

```
quest-tracker/
├── app/
│   ├── globals.css           # Global styles and theme variables
│   ├── layout.tsx           # Root layout with theme provider
│   └── page.tsx             # Main application component
├── components/
│   ├── quest-detail.tsx     # Detailed quest view with markdown support
│   ├── quest-filter.tsx     # Search and filter functionality
│   ├── quest-item.tsx       # Individual quest list items
│   ├── quest-statistics.tsx # Progress statistics dashboard
│   ├── quest-dependency-graph.tsx # Interactive dependency visualization
│   ├── quest-timeline.tsx   # Chronological questline view
│   ├── quest-rewards.tsx    # Quest reward display
│   ├── questline-list.tsx   # Questline management
│   ├── submission-info.tsx  # Submission guidelines
│   ├── theme-provider.tsx   # Dark theme management
│   └── ui/                  # Reusable UI components (shadcn/ui)
├── lib/
│   ├── quest-utils.ts       # Quest processing and validation logic
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # Utility functions
└── components/quests/       # Quest data files
    ├── all_quests.tsx       # Main quest data export
    ├── prologue.tsx         # Prologue questline
    ├── facility.tsx         # Facility questline
    └── ...                  # Additional questline files
```

### Core Processing Logic

The quest system uses a multi-pass processing approach:

1. **Validation Pass**: Validates schema compliance and unique identifiers
2. **Dependency Resolution**: Calculates quest lock states based on requirements
3. **Auto-Solve Processing**: Handles automatic quest resolution
4. **Fail Condition Evaluation**: Processes complex boolean logic for quest failures
5. **State Convergence**: Iterates until all quest states are stable

## 📋 Complete Schema Reference

### Questline Schema

```typescript
interface Questline {
  questline_name: string           // Unique questline identifier
  quests: QuestData[]             // Array of quests in this questline
  description?: string            // Questline description
  category?: QuestlineCategory    // Questline type classification
  requiredLevel?: number          // Minimum level requirement
  recommendedLevel?: number       // Suggested level
  location?: string              // Where questline takes place
  timeline?: number              // Chronological order (lower = earlier)
}

type QuestlineCategory = "Main Story" | "Side Content" | "Special Event" | "Tutorial"
```

### Quest Schema

```typescript
interface QuestData {
  // Core Identification
  QuestName: string                    // Unique quest identifier (add * for auto-solve)
  DetailsForSubmission: string         // Instructions shown when quest is pending
  SolveStatus: QuestStatus            // Current quest state
  
  // Quest Information (shown when solved)
  QuestDesc?: {
    Synopsis: string                   // Main description (supports markdown + quest links)
    Trivia?: string                   // Additional lore (supports markdown + quest links)
    Relations?: string                // Quest relationships (supports markdown + quest links)
  }
  
  // Dependencies and Requirements
  Requirement?: string[]              // Quest names that must be completed first
  
  // Failure Conditions
  MissName?: string                   // Name displayed when quest fails
  MissInfo?: string                   // Failure description (supports markdown + quest links)
  failIfFailed?: string              // Boolean logic for failure conditions
  failIfPending?: string             // Boolean logic for pending-based failures
  
  // Secret Quest System
  Secret?: boolean                    // Hide quest details until discovered
  SecretHint?: string                // Hint shown for secret quests (supports markdown + quest links)
  
  // Locking System
  manualLock?: boolean               // Override automatic locking
  
  // Metadata
  difficulty?: 1 | 2 | 3 | 4 | 5     // Difficulty rating
  category?: QuestCategory           // Quest type
  timeEstimate?: number              // Estimated completion time (minutes)
  
  // Rewards and Relations
  rewards?: QuestReward[]            // Array of quest rewards
  relatedQuestlines?: string[]       // Names of related questlines
  
  // Credit System
  QuestCredit: QuestCredit           // Required for solved quests
}

type QuestStatus = "Solved" | "Failed" | "Pending"
type QuestCategory = "Main" | "Side" | "Hidden" | "Special" | "Daily" | "Weekly"
```

### Supporting Interfaces

```typescript
interface QuestReward {
  type: "Item" | "Experience" | "Currency" | "Reputation" | "Skill" | "Achievement"
  name: string                       // Reward name
  amount?: number                    // Quantity (optional)
  description?: string               // Reward description
}

interface QuestCredit {
  name: string                       // Solver's name
  date: string                       // Solution date
}
```

## 🔧 Advanced Features

### Boolean Logic System

The quest system supports complex failure conditions using boolean operators:

#### Basic Operators
- `AND`: All conditions must be true
- `OR`: At least one condition must be true  
- `XOR`: Exactly one condition must be true
- `NAND`: Not all conditions are true
- `NOR`: No conditions are true

#### Syntax Examples

```typescript
// Simple condition
failIfFailed: "{{ Quest A }}"

// Multiple conditions with AND
failIfFailed: "{{ Quest A }} AND {{ Quest B }}"

// Complex logic with parentheses
failIfFailed: "({{ Quest A }} AND {{ Quest B }}) OR {{ Quest C }}"

// Advanced nesting
failIfFailed: "(({{ Q1 }} AND {{ Q2 }}) OR ({{ Q3 }} XOR {{ Q4 }}))"
```

#### Precedence Rules
- Parentheses have highest precedence
- AND/NAND operations are evaluated before OR/NOR/XOR
- Use parentheses for clarity in complex expressions

### Quest Linking System

Use `{{ QuestName }}` syntax to create interactive links between quests in any text field that supports it:

```typescript
{
  QuestDesc: {
    Synopsis: "You completed the first quest.",
    Relations: "This unlocks {{ Second Quest }} and relates to {{ Secret Quest }}."
  },
  MissInfo: "Failed because {{ Required Quest }} was not completed."
}
```

### Auto-Solve Quests

Mark quests for automatic resolution by adding `*` to the quest name:

```typescript
{
  QuestName: "Victory Celebration*",  // Auto-solves when previous quest completes
  DetailsForSubmission: "Automatically triggered after victory."
}
```

### Secret Quest System

Hide quest information until discovery:

```typescript
{
  QuestName: "Hidden Chamber",
  Secret: true,
  SecretHint: "Look for the hidden switch behind the bookshelf.",
  DetailsForSubmission: "Find the secret chamber."
}
```

### Manual Locking

Override automatic dependency resolution:

```typescript
{
  QuestName: "Timed Event",
  manualLock: true,              // Manually control when this unlocks
  Requirement: ["Previous Quest"], // Still shows requirements
  failIfPending: "{{ Time Limit }}" // Can still have fail conditions
}
```

## 📝 Data File Organization

### Main Export File

```typescript
// components/quests/all_quests.tsx
import { Prologue } from "./prologue";
import { Facility } from "./facility";
// ... other imports

export const Data: Questline[] = [
    ...Prologue,
    ...Facility,
    // ... other questlines
];
```

### Individual Questline Files

```typescript
// components/quests/example.tsx
import { Questline } from "@/lib/types";

export const ExampleQuestline: Questline[] = [
    {
        questline_name: "Example Questline",
        description: "An example questline for demonstration",
        category: "Tutorial",
        timeline: 1,
        quests: [
            {
                QuestName: "First Quest",
                DetailsForSubmission: "Complete the first quest.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "You completed the first quest successfully."
                },
                difficulty: 1,
                category: "Main",
                QuestCredit: {
                    name: "Pending",
                    date: "Pending"
                }
            }
        ]
    }
];
```

## 🎯 Best Practices

### Quest Design
1. **Unique Names**: Ensure all quest names are unique across all questlines
2. **Clear Dependencies**: Use logical requirement chains
3. **Meaningful Failures**: Provide clear failure conditions and descriptions
4. **Balanced Difficulty**: Use the 1-5 difficulty scale consistently
5. **Rich Descriptions**: Use markdown and quest links for engaging content

### Data Organization
1. **Logical Grouping**: Group related quests into questlines
2. **Chronological Order**: Use timeline numbers for story progression
3. **Consistent Categories**: Use categories consistently across questlines
4. **Complete Credits**: Always provide credit information for solved quests

### Boolean Logic
1. **Use Parentheses**: Clarify complex expressions with parentheses
2. **Test Thoroughly**: Verify logic conditions work as expected
3. **Document Intent**: Use clear quest names that indicate their purpose
4. **Avoid Complexity**: Keep logic as simple as possible while meeting requirements

## 🔍 Validation and Error Handling

The system includes comprehensive validation:

### Automatic Checks
- **Unique Names**: Validates quest and miss names are unique
- **Schema Compliance**: Ensures all required fields are present
- **Dependency Validation**: Checks that referenced quests exist
- **Logic Validation**: Validates boolean expressions are well-formed
- **Credit Validation**: Ensures solved quests have proper credit information

### Error Messages
The system provides detailed console warnings and errors for:
- Duplicate quest names
- Missing required fields
- Invalid quest references
- Malformed boolean logic
- Inconsistent quest states

## 🚀 Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Configuration

The application works out of the box with no additional configuration required. All quest data is embedded in the application.

## 🤝 Contributing

### Adding New Questlines

1. Create a new file in `components/quests/`
2. Define your questline using the schema
3. Export it as a named export
4. Import and add it to `all_quests.tsx`

### Modifying Existing Quests

1. Locate the appropriate questline file
2. Update the quest data
3. Ensure validation passes
4. Test the changes in the application

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framework**: Built with Next.js 15 and React 18
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React icon library
- **TypeScript**: Full type safety throughout the application

---

*For technical support or questions about quest design, please refer to the schema documentation above or examine the existing quest files for examples.*