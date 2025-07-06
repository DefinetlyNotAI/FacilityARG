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

## 🔧 System Mechanics Deep Dive

### Requirements System

The `Requirement` field controls when quests become available. Here's how it works in detail:

#### Basic Requirement Logic

```typescript
{
  QuestName: "Quest B"
  Requirement: ["Quest A"]  // Quest B is locked until Quest A is solved OR failed
  // ...
}
```

**Key Rule**: A quest is **unlocked** when ALL its requirements are either "Solved" OR "Failed". It only remains locked if any requirement is still "Pending".

#### Edge Case Examples

**Scenario 1: One Failed Requirement**
```typescript
// Quest Setup
QuestA: { SolveStatus: "Failed" }
QuestB: { SolveStatus: "Pending" }
QuestC: { Requirement: ["Quest A", "Quest B"] }

// Result: Quest C remains LOCKED
// Reason: Quest B is still pending, even though Quest A failed
```

**Scenario 2: Mixed Failed and Solved Requirements**
```typescript
// Quest Setup
QuestA: { SolveStatus: "Failed" }
QuestB: { SolveStatus: "Solved" }
QuestC: { Requirement: ["Quest A", "Quest B"] }

// Result: Quest C becomes UNLOCKED
// Reason: Both requirements have resolved (one failed, one solved)
```

**Scenario 3: All Failed Requirements**
```typescript
// Quest Setup
QuestA: { SolveStatus: "Failed" }
QuestB: { SolveStatus: "Failed" }
QuestC: { Requirement: ["Quest A", "Quest B"] }

// Result: Quest C becomes UNLOCKED
// Reason: All requirements have resolved, even though they failed
```

**Scenario 4: Cross-Questline Requirements**
```typescript
// Questline 1
QuestA: { SolveStatus: "Solved" }

// Questline 2  
QuestB: { 
  Requirement: ["Quest A"]  // References quest from different questline
  SolveStatus: "Pending"
}

// Result: Quest B becomes UNLOCKED
// Reason: Cross-questline requirements work the same way
```

#### Manual Lock Override

```typescript
{
  QuestName: "Timed Event"
  Requirement: ["Previous Quest"]
  manualLock: true  // Overrides requirement logic
  // Result: Quest stays locked regardless of "Previous Quest" status, and when unlocked, it will automatically resolve based on the requirements.
}
```

### Failure Condition System

The `failIfFailed` and `failIfPending` fields use boolean logic to automatically fail quests.

#### failIfFailed Mechanics

This field causes a quest to fail when the specified conditions become true.

**Basic Examples:**

```typescript
// Simple failure condition
{
  QuestName: "Rescue Mission"
  failIfFailed: "{{ Hostage Dies }}"
  // Result: Fails immediately when "Hostage Dies" fails
}

// Multiple conditions with AND
{
  QuestName: "Alliance Quest"
  failIfFailed: "{{ Faction A Betrays }} AND {{ Faction B Betrays }}"
  // Result: Fails only when BOTH factions betray
}

// Multiple conditions with OR  
{
  QuestName: "Stealth Mission"
  failIfFailed: "{{ Alarm Triggered }} OR {{ Guard Alerted }}"
  // Result: Fails when EITHER condition occurs
}
```

#### failIfPending Mechanics

This field causes a quest to fail when specified quests remain pending while unlocked.

**Key Difference**: `failIfPending` only triggers when the referenced quest is both "Pending" AND "Unlocked" (not locked by requirements).

```typescript
{
  QuestName: "Time Sensitive"
  failIfPending: "{{ Timer Expires }}"
  // Result: Fails when "Timer Expires" is pending but unlocked
  // (indicating the timer has run out but hasn't been addressed)
}
```

#### Complex Boolean Logic Examples

**Scenario 1: Nested Parentheses**
```typescript
{
  failIfFailed: "(({{ A }} AND {{ B }}) OR {{ C }}) AND {{ D }}"
  // Evaluation order:
  // 1. (A AND B) 
  // 2. ((A AND B) OR C)
  // 3. (((A AND B) OR C) AND D)
}
```

**Scenario 2: XOR Logic**
```typescript
{
  failIfFailed: "{{ Path A }} XOR {{ Path B }}"
  // Result: Fails when exactly ONE path fails (not both, not neither)
  // Use case: When you must choose one path and failing either is bad
}
```

**Scenario 3: NAND Logic**
```typescript
{
  failIfFailed: "{{ Ally A }} NAND {{ Ally B }}"
  // Result: Fails when it's NOT the case that both allies fail
  // Equivalent to: NOT (A AND B)
  // Use case: Quest succeeds only if both allies fail together
}
```

#### Edge Cases in Failure Logic

**Case 1: Self-Referential Logic (Invalid)**
```typescript
{
  QuestName: "Paradox Quest"
  failIfFailed: "{{ Paradox Quest }}"  // ❌ INVALID - cannot reference self
}
```

**Case 2: Circular Dependencies**
```typescript
// Quest A
{
  QuestName: "Quest A"
  failIfFailed: "{{ Quest B }}"
}

// Quest B  
{
  QuestName: "Quest B"
  failIfFailed: "{{ Quest A }}"
}
// Result: System detects circular dependency and prevents infinite loops
```

**Case 3: Mixed failIfFailed and failIfPending**
```typescript
{
  QuestName: "Complex Mission"
  failIfFailed: "{{ Critical Failure }}"
  failIfPending: "{{ Time Limit }}"
  // Result: Quest fails if EITHER condition is met
  // (Critical Failure occurs OR Time Limit expires)
}
```

### Auto-Solve System

Quests marked with `*` automatically inherit the status of their dependencies.

#### Auto-Solve Mechanics

```typescript
{
  QuestName: "Victory Celebration*"
  Requirement: ["Final Boss"]
  // Behavior:
  // - If "Final Boss" becomes "Solved" → "Victory Celebration" becomes "Solved"
  // - If "Final Boss" becomes "Failed" → "Victory Celebration" becomes "Failed"
}
```

#### Auto-Solve Edge Cases

**Case 1: Multiple Requirements**
```typescript
{
  QuestName: "Group Victory*"
  Requirement: ["Boss A", "Boss B", "Boss C"]
  // Result: Auto-solves only when ALL requirements are solved
  // Fails if ANY requirement fails
}
```

**Case 2: Auto-Solve with Failure Conditions**
```typescript
{
  QuestName: "Conditional Victory*"
  Requirement: ["Final Boss"]
  failIfFailed: "{{ Innocent Dies }}"
  // Behavior:
  // 1. Auto-solves when "Final Boss" is solved
  // 2. BUT fails immediately if "Innocent Dies" fails (overrides auto-solve)
}
```

### Secret Quest System

Secret quests hide their information until specific conditions are met.

#### Secret Quest Mechanics

```typescript
{
  QuestName: "Hidden Chamber"
  Secret: true
  SecretHint: "Look behind the bookshelf for a hidden switch."
  DetailsForSubmission: "Find the secret chamber and retrieve the artifact."
  // Display Behavior:
  // - When Pending: Shows "???" as name, shows SecretHint
  // - When Solved/Failed: Shows real name and full details
}
```

#### Secret Quest Edge Cases

**Case 1: Secret Quest in Requirements**
```typescript
// Secret Quest
{
  QuestName: "Secret Key"
  Secret: true
  SolveStatus: "Pending"
}

// Dependent Quest
{
  QuestName: "Locked Door"
  Requirement: ["Secret Key"]
  // Display: Shows requirement as "???" until Secret Key is discovered
}
```

**Case 2: Secret Quest in Failure Conditions**
```typescript
{
  QuestName: "Main Quest"
  failIfFailed: "{{ Secret Sabotage }}"  // Secret quest reference
  // Behavior: Failure condition works normally, but UI shows "???" in failure description
}
```

### Manual Lock System

The `manualLock` field overrides all automatic locking logic.

#### Manual Lock Use Cases

**Use Case 1: Timed Events**
```typescript
{
  QuestName: "Limited Time Event"
  manualLock: true  // Stays locked until manually unlocked
  Requirement: ["Previous Quest"]  // Still shows requirements in UI
  // Use: For events that unlock at specific real-world times
}
```

**Use Case 2: Preventing Premature Access**
```typescript
{
  QuestName: "Endgame Content"
  Requirement: ["All Main Quests"]
  manualLock: true
  // Use: Even if requirements are met, stays locked until story is ready
}
```

**Use Case 3: Complex Unlock Conditions**
```typescript
{
  QuestName: "Special Unlock"
  manualLock: true
  failIfPending: "{{ Time Expires }}"
  // Use: Quest that needs manual unlocking but can still auto-fail
}
```

### State Resolution Order

The system processes quest states in a specific order to ensure consistency:

#### Processing Phases

1. **Initialization Phase**
    - Load all quest data
    - Validate schema compliance
    - Set initial auto-solve flags

2. **Dependency Resolution Phase**
    - Calculate lock states based on requirements
    - Apply manual lock overrides
    - Update quest accessibility

3. **Failure Evaluation Phase**
    - Process `failIfFailed` conditions
    - Process `failIfPending` conditions
    - Apply failure states

4. **Auto-Solve Phase**
    - Process auto-solve quests
    - Inherit states from dependencies
    - Apply auto-solve results

5. **Convergence Phase**
    - Repeat phases 2-4 until no changes occur
    - Ensure all quest states are stable
    - Finalize quest statuses

#### Convergence Example

```typescript
// Initial State
QuestA: { SolveStatus: "Solved" }
QuestB: {
    SolveStatus: "Pending"
    Requirement: ["Quest A"] 
}
QuestC: {
    SolveStatus: "Pending"
    failIfFailed: "{{ Quest B }}" 
}

// Pass 1: Dependency Resolution
QuestB: { isLocked: false }  // Quest A is solved

// Pass 2: No failures yet
QuestC: { SolveStatus: "Pending" }  // Quest B hasn't failed

// Pass 3: User solves Quest B
QuestB: { SolveStatus: "Solved" }

// Pass 4: No changes needed
// Final State: All quests stable
```

## 🔍 Advanced Examples

### Complex Questline Example

```typescript
export const AdvancedExample: Questline[] = [
  {
    questline_name: "The Heist",
    description: "A complex multi-path heist with multiple failure conditions",
    category: "Main Story",
    timeline: 5,
    quests: [
      {
        QuestName: "Gather Intel",
        DetailsForSubmission: "Research the target building and security systems.",
        SolveStatus: "Pending",
        difficulty: 2,
        timeEstimate: 45,
        QuestDesc: {
          Synopsis: "You've gathered crucial intelligence about the target.",
          Relations: "This information is vital for {{ Plan the Route }} and {{ Recruit Team }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Plan the Route", 
        DetailsForSubmission: "Design the infiltration and escape routes.",
        SolveStatus: "Pending",
        Requirement: ["Gather Intel"],
        difficulty: 3,
        MissName: "Poor Planning",
        MissInfo: "Failed to account for security changes in {{ Security Upgrade }}.",
        failIfFailed: "{{ Security Upgrade }}",
        QuestDesc: {
          Synopsis: "You've planned the perfect route through the building.",
          Trivia: "The route accounts for guard rotations and camera blind spots."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Recruit Team",
        DetailsForSubmission: "Assemble a team of specialists for the heist.",
        SolveStatus: "Pending", 
        Requirement: ["Gather Intel"],
        difficulty: 3,
        MissName: "Team Betrayal",
        MissInfo: "The team was compromised when {{ Insider Threat }} was discovered.",
        failIfFailed: "{{ Insider Threat }}",
        QuestDesc: {
          Synopsis: "You've assembled a skilled team of professionals.",
          Relations: "Team includes specialists needed for {{ Execute Heist }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Security Upgrade",
        DetailsForSubmission: "Hidden quest: The target upgrades security unexpectedly.",
        SolveStatus: "Pending",
        Secret: true,
        SecretHint: "Monitor security company communications for changes.",
        difficulty: 4,
        category: "Hidden",
        QuestDesc: {
          Synopsis: "The target has upgraded their security systems.",
          Trivia: "This upgrade invalidates previous reconnaissance."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Insider Threat",
        DetailsForSubmission: "Hidden quest: Discover if team members can be trusted.",
        SolveStatus: "Pending",
        Secret: true,
        SecretHint: "Investigate team members' backgrounds and recent activities.",
        difficulty: 5,
        category: "Hidden",
        QuestDesc: {
          Synopsis: "You discovered a team member was working for the authorities.",
          Trivia: "The betrayal was planned from the beginning."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Execute Heist",
        DetailsForSubmission: "Carry out the heist according to your plan.",
        SolveStatus: "Pending",
        Requirement: ["Plan the Route", "Recruit Team"],
        difficulty: 5,
        timeEstimate: 120,
        MissName: "Heist Failed",
        MissInfo: "The heist failed due to planning issues or team problems.",
        failIfFailed: "({{ Plan the Route }} OR {{ Recruit Team }})",
        QuestDesc: {
          Synopsis: "The heist was executed flawlessly.",
          Trivia: "Perfect coordination between team members made this possible.",
          Relations: "Success triggers {{ Escape }} and {{ Celebrate Victory* }}."
        },
        rewards: [
          {
            type: "Currency",
            name: "Stolen Diamonds", 
            amount: 1000000,
            description: "Valuable diamonds stolen from the vault."
          },
          {
            type: "Achievement",
            name: "Master Thief",
            description: "Successfully completed a complex heist."
          }
        ],
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Escape",
        DetailsForSubmission: "Successfully escape with the stolen goods.",
        SolveStatus: "Pending",
        Requirement: ["Execute Heist"],
        difficulty: 4,
        MissName: "Caught Red-Handed", 
        MissInfo: "Captured during escape due to {{ Police Response }}.",
        failIfPending: "{{ Police Response }}",
        QuestDesc: {
          Synopsis: "You escaped cleanly with the stolen goods.",
          Relations: "Clean escape enables {{ Celebrate Victory* }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Police Response",
        DetailsForSubmission: "Hidden quest: Police response time and effectiveness.",
        SolveStatus: "Pending",
        Secret: true,
        SecretHint: "Monitor police communications and response patterns.",
        manualLock: true,  // Unlocks based on real-world timing
        difficulty: 3,
        category: "Hidden",
        QuestDesc: {
          Synopsis: "Police responded faster than expected to the heist.",
          Trivia: "The quick response was due to a tip from {{ Insider Threat }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Celebrate Victory*",
        DetailsForSubmission: "Automatically triggered after successful heist and escape.",
        SolveStatus: "Pending",
        Requirement: ["Execute Heist", "Escape"],
        category: "Special",
        QuestDesc: {
          Synopsis: "The team celebrates their successful heist.",
          Trivia: "The celebration was held at a secret location to avoid detection."
        },
        rewards: [
          {
            type: "Achievement",
            name: "Perfect Crime",
            description: "Completed the heist without any failures."
          }
        ],
        QuestCredit: { name: "Pending", date: "Pending" }
      }
    ]
  }
];
```

### Boolean Logic Showcase

```typescript
export const LogicExamples: Questline[] = [
  {
    questline_name: "Logic Puzzles",
    description: "Demonstrates complex boolean logic in quest conditions",
    quests: [
      {
        QuestName: "Simple AND",
        DetailsForSubmission: "Fails only if both conditions fail.",
        SolveStatus: "Pending",
        failIfFailed: "{{ Condition A }} AND {{ Condition B }}",
        // Fails when: A=Failed AND B=Failed
        // Succeeds when: A=Solved OR B=Solved (or both)
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Simple OR", 
        DetailsForSubmission: "Fails if either condition fails.",
        SolveStatus: "Pending",
        failIfFailed: "{{ Condition A }} OR {{ Condition B }}",
        // Fails when: A=Failed OR B=Failed (or both)
        // Succeeds when: A=Solved AND B=Solved
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "XOR Example",
        DetailsForSubmission: "Fails when exactly one condition fails.",
        SolveStatus: "Pending", 
        failIfFailed: "{{ Condition A }} XOR {{ Condition B }}",
        // Fails when: (A=Failed AND B=Solved) OR (A=Solved AND B=Failed)
        // Succeeds when: (A=Failed AND B=Failed) OR (A=Solved AND B=Solved)
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Complex Nested",
        DetailsForSubmission: "Complex nested boolean logic example.",
        SolveStatus: "Pending",
        failIfFailed: "(({{ A }} AND {{ B }}) OR {{ C }}) AND ({{ D }} XOR {{ E }})",
        // Evaluation:
        // 1. (A AND B) 
        // 2. ((A AND B) OR C)
        // 3. (D XOR E)
        // 4. (((A AND B) OR C) AND (D XOR E))
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "NAND Example",
        DetailsForSubmission: "Fails unless both conditions fail together.",
        SolveStatus: "Pending",
        failIfFailed: "{{ Condition A }} NAND {{ Condition B }}",
        // Fails when: NOT(A=Failed AND B=Failed)
        // Succeeds when: A=Failed AND B=Failed
        QuestCredit: { name: "Pending", date: "Pending" }
      }
    ]
  }
];
```

## 🎯 Best Practices

### Quest Design Guidelines

1. **Clear Dependencies**: Use logical requirement chains that make narrative sense
2. **Meaningful Failures**: Ensure failure conditions relate to quest objectives
3. **Balanced Complexity**: Don't overuse complex boolean logic unless necessary
4. **User-Friendly Names**: Use descriptive quest names that indicate their purpose
5. **Complete Documentation**: Always provide synopsis and trivia for solved quests

### Data Organization Best Practices

1. **Logical Grouping**: Group related quests into coherent questlines
2. **Chronological Order**: Use timeline numbers to indicate story progression
3. **Consistent Categories**: Apply categories consistently across similar quest types
4. **Complete Credits**: Always provide credit information for solved quests
5. **Validation**: Test complex logic conditions thoroughly before deployment

### Performance Considerations

1. **Avoid Deep Nesting**: Limit boolean logic nesting to maintain readability
2. **Minimize Circular References**: Design quest dependencies to avoid circular logic
3. **Efficient Requirements**: Use the minimum number of requirements necessary
4. **Clear Failure Conditions**: Make failure conditions as simple as possible while meeting design goals

## 🔍 Validation and Error Handling

The system includes comprehensive validation with detailed error reporting:

### Automatic Validation Checks

- **Unique Identifiers**: Ensures quest names and miss names are unique
- **Schema Compliance**: Validates all required fields are present and correctly typed
- **Dependency Validation**: Checks that all referenced quests exist
- **Logic Validation**: Validates boolean expressions are syntactically correct
- **Credit Validation**: Ensures solved quests have complete credit information
- **Circular Dependency Detection**: Prevents infinite loops in quest logic

### Common Validation Errors

```typescript
// ❌ Duplicate quest names
{
  QuestName: "Duplicate Name"  // Error: Name already exists
}

// ❌ Missing required fields
{
  QuestName: "Incomplete Quest"
  // Error: Missing DetailsForSubmission and QuestCredit
}

// ❌ Invalid quest references
{
  failIfFailed: "{{ Nonexistent Quest }}"  // Error: Quest doesn't exist
}

// ❌ Malformed boolean logic
{
  failIfFailed: "{{ Quest A }} AND OR {{ Quest B }}"  // Error: Invalid syntax
}

// ❌ Self-reference
{
  QuestName: "Self Reference"
  failIfFailed: "{{ Self Reference }}"  // Error: Cannot reference self
}
```

## 🚀 Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

### Environment Configuration

The application requires no additional configuration. All quest data is embedded and processed client-side.

## 🤝 Contributing

### Adding New Questlines

1. Create a new TypeScript file in `components/quests/`
2. Define your questline following the schema
3. Export it as a named export
4. Import and add to the main data array in `all_quests.tsx`

### Modifying Existing Quests

1. Locate the appropriate questline file
2. Update quest data following schema guidelines
3. Ensure all validation passes
4. Test complex logic conditions thoroughly

### Testing Guidelines

1. **Dependency Testing**: Verify requirement chains work as expected
2. **Logic Testing**: Test all boolean conditions with various quest states
3. **Edge Case Testing**: Test unusual combinations of quest states
4. **UI Testing**: Ensure changes display correctly in all views
5. **Mobile Testing**: Verify responsive behavior on mobile devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framework**: Built with Next.js 15 and React 18
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React icon library
- **TypeScript**: Full type safety throughout the application

---

*For technical support or questions about quest design, please refer to the comprehensive examples above or examine the existing quest files in the codebase.*