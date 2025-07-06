# Quest Tracker

A sophisticated web-based quest tracking system designed for managing complex ARG (Alternate Reality Game) questlines with advanced dependency resolution, boolean logic conditions, and comprehensive progress tracking.

## 🌟 Features

### Core Quest Management
- **Multi-Questline Organization**: Group related quests into logical questlines with metadata
- **Advanced Status Tracking**: Visual indicators for Pending, Solved, and Failed quests
- **Smart Dependency System**: Automatic quest locking based on requirements
- **Boolean Logic Conditions**: Complex fail conditions using AND, OR, XOR, NAND, NOR operators
- **Auto-Resolution Engine**: Automatic quest solving and failing based on dependencies
- **Must Requirement System**: Critical quests that cascade failures to dependent quests

### Special Quest Types
- **Secret Quests**: Hidden quests that display as "???" until discovered
- **Auto-Solve Quests**: Quests that automatically resolve when conditions are met
- **Missable Quests**: Quests with permanent failure conditions
- **Must Requirement Quests**: Critical quests whose failure cascades to all dependent quests
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
│   └── utils.ts             # General utilities
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
5. **Must Requirement Cascading**: Handles cascading failures from critical quests
6. **State Convergence**: Iterates until all quest states are stable

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
  MustRequirement?: boolean           // If true, failure cascades to all dependent quests
  
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

### Must Requirement System

The `MustRequirement` field creates cascading failure chains when critical quests fail.

#### Must Requirement Mechanics

```typescript
{
  QuestName: "Critical Foundation"
  MustRequirement: true
  MissName: "Foundation Collapsed"
  MissInfo: "The foundation quest failed, making dependent quests impossible."
  // When this quest fails, ALL quests that require it will automatically fail
}
```

#### Must Requirement Behavior

**Primary Behavior:**
- If a quest is marked with `MustRequirement: true`, any quest that lists it as a requirement becomes an "Only Pass" quest relative to it
- If the must-required quest fails, **all quests that require it will auto-fail**, regardless of their own internal state or other fulfilled requirements

**Fail Cascade Logic:**
- Quests that depend on a failed must-requirement will:
  - Automatically fail
  - Skip their normal fail condition logic
  - Not be counted as "manually failable" in the system
- The must-requirement quest itself must be a valid failable quest with proper fail triggers and messaging

#### Must Requirement Examples

**Example 1: Basic Must Requirement**
```typescript
// Critical Quest
{
  QuestName: "Server Infrastructure"
  MustRequirement: true
  MissName: "Server Crash"
  MissInfo: "The server infrastructure failed catastrophically."
  failIfFailed: "{{ Power Grid }}"
}

// Dependent Quest
{
  QuestName: "Data Analysis"
  Requirement: ["Server Infrastructure"]
  // If "Server Infrastructure" fails, this quest automatically fails
  // Generic failure message: "Data Analysis failed due to a must requirement for Server Infrastructure"
}
```

**Example 2: Multi-Dependency with Must Requirement**
```typescript
// Mixed Dependencies
{
  QuestName: "Final Mission"
  Requirement: ["Critical Path", "Optional Support", "Nice to Have"]
  // Where:
  // - "Critical Path" has MustRequirement: true
  // - "Optional Support" has MustRequirement: false (or undefined)
  // - "Nice to Have" has MustRequirement: false (or undefined)
  
  // Behavior:
  // - If "Critical Path" fails → "Final Mission" auto-fails
  // - If "Optional Support" fails → "Final Mission" continues normally
  // - If "Nice to Have" fails → "Final Mission" continues normally
}
```

**Example 3: Must Requirement Chain**
```typescript
// Chain of Must Requirements
QuestA: { MustRequirement: true }
QuestB: { Requirement: ["Quest A"], MustRequirement: true }
QuestC: { Requirement: ["Quest B"] }

// If Quest A fails:
// 1. Quest B auto-fails (due to Quest A being must-requirement)
// 2. Quest C auto-fails (due to Quest B being must-requirement)
// Result: Cascading failure through the entire chain
```

#### Must Requirement UI & Messaging

**Visual Indicators:**
- Must requirement quests show a red "Must Requirement" badge
- Requirements list shows must requirements with a red asterisk (*)
- Failed quests due to must requirements show special failure messaging

**Failure Messages:**
- Quests that auto-fail due to must requirements show:
  - Generic fail message: "{{ questName }} failed due to a must requirement for {{ failedMustRequirement }}"
  - No custom fail name or logic required for dependent quests

#### Must Requirement Validation

**Required Fields for Must Requirement Quests:**
```typescript
{
  QuestName: "Critical Quest"
  MustRequirement: true
  MissName: "Critical Failure"        // REQUIRED
  MissInfo: "Failure description"     // REQUIRED
  failIfFailed: "{{ Some Condition }}" // REQUIRED - must have fail conditions
}
```

**Validation Errors:**
- Must requirement quests without `MissName` or `MissInfo` will generate validation errors
- Must requirement quests should have proper fail conditions to be meaningful

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

**Case 4: Must Requirement vs Regular Failure**
```typescript
{
  QuestName: "Dependent Quest"
  Requirement: ["Must Req Quest", "Regular Quest"]
  failIfFailed: "{{ Other Condition }}"
  // Priority: Must requirement failure overrides regular failure conditions
  // If "Must Req Quest" fails, this quest auto-fails regardless of "Other Condition"
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

**Case 3: Auto-Solve with Must Requirements**
```typescript
{
  QuestName: "Celebration*"
  Requirement: ["Critical Mission", "Optional Mission"]
  // Where "Critical Mission" has MustRequirement: true
  // Behavior:
  // - If "Critical Mission" fails → "Celebration" auto-fails (must requirement)
  // - If "Optional Mission" fails → "Celebration" can still auto-solve from "Critical Mission"
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

**Case 3: Secret Must Requirement**
```typescript
{
  QuestName: "Hidden Foundation"
  Secret: true
  MustRequirement: true
  // Behavior: Functions as must requirement, but shows as "???" until discovered
  // Dependent quests show "failed due to must requirement for ???" if it fails
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

**Use Case 4: Must Requirement with Manual Lock**
```typescript
{
  QuestName: "Critical Timed Event"
  MustRequirement: true
  manualLock: true
  failIfPending: "{{ Deadline }}"
  // Use: Critical quest that unlocks manually but can cascade failures
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

4. **Must Requirement Cascading Phase**
    - Check for failed must requirements
    - Apply cascading failures to dependent quests
    - Set generic failure messages

5. **Auto-Solve Phase**
    - Process auto-solve quests
    - Inherit states from dependencies
    - Apply auto-solve results

6. **Convergence Phase**
    - Repeat phases 2-5 until no changes occur
    - Ensure all quest states are stable
    - Finalize quest statuses

#### Convergence Example with Must Requirements

```typescript
// Initial State
QuestA: { SolveStatus: "Solved", MustRequirement: true }
QuestB: { SolveStatus: "Pending", Requirement: ["Quest A"] }
QuestC: { SolveStatus: "Pending", Requirement: ["Quest B"] }
QuestD: { SolveStatus: "Pending", failIfFailed: "{{ Quest A }}" }

// Pass 1: Dependency Resolution
QuestB: { isLocked: false }  // Quest A is solved
QuestC: { isLocked: true }   // Quest B is still pending

// Pass 2: User action causes Quest A to fail
QuestA: { SolveStatus: "Failed" }

// Pass 3: Must Requirement Cascading
QuestB: { SolveStatus: "Failed" }  // Auto-fails due to Quest A must requirement
QuestC: { isLocked: false }        // Quest B resolved (failed)

// Pass 4: Regular Failure Conditions
QuestD: { SolveStatus: "Failed" }  // Fails due to failIfFailed condition

// Pass 5: No more changes
// Final State: All quests stable with cascading failures applied
```

## 🔍 Advanced Examples

### Complex Questline with Must Requirements

```typescript
export const MustRequirementExample: Questline[] = [
  {
    questline_name: "Critical Infrastructure",
    description: "A questline demonstrating must requirements and cascading failures",
    category: "Main Story",
    timeline: 1,
    quests: [
      {
        QuestName: "Power Grid",
        DetailsForSubmission: "Establish the main power grid for the facility.",
        SolveStatus: "Pending",
        MustRequirement: true,
        difficulty: 5,
        MissName: "Grid Failure",
        MissInfo: "The power grid failed catastrophically, making all dependent systems impossible to operate.",
        failIfFailed: "{{ Generator Overload }} OR {{ Sabotage Attempt }}",
        QuestDesc: {
          Synopsis: "You successfully established a stable power grid.",
          Trivia: "This grid powers all critical facility systems.",
          Relations: "Essential for {{ Data Center }}, {{ Security System }}, and {{ Life Support }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Generator Overload",
        DetailsForSubmission: "Hidden quest: Monitor generator stress levels.",
        SolveStatus: "Pending",
        Secret: true,
        SecretHint: "Watch for unusual power consumption patterns.",
        difficulty: 3,
        category: "Hidden",
        QuestDesc: {
          Synopsis: "The generators were pushed beyond safe limits.",
          Trivia: "Overload was caused by simultaneous activation of all systems."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Sabotage Attempt",
        DetailsForSubmission: "Hidden quest: Detect and prevent sabotage.",
        SolveStatus: "Pending",
        Secret: true,
        SecretHint: "Someone doesn't want this facility to succeed.",
        difficulty: 4,
        category: "Hidden",
        QuestDesc: {
          Synopsis: "You discovered and stopped a sabotage attempt.",
          Trivia: "The saboteur was working for a rival organization."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Data Center",
        DetailsForSubmission: "Set up the main data processing center.",
        SolveStatus: "Pending",
        Requirement: ["Power Grid"],
        difficulty: 3,
        QuestDesc: {
          Synopsis: "The data center is operational and processing information.",
          Relations: "Enables {{ Research Database }} and {{ Communication Hub }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Security System",
        DetailsForSubmission: "Install comprehensive security measures.",
        SolveStatus: "Pending",
        Requirement: ["Power Grid"],
        difficulty: 4,
        MissName: "Security Breach",
        MissInfo: "Security systems failed, leaving the facility vulnerable.",
        failIfFailed: "{{ Intrusion Detected }}",
        QuestDesc: {
          Synopsis: "Advanced security systems are protecting the facility.",
          Relations: "Protects {{ Data Center }} and {{ Research Database }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Life Support",
        DetailsForSubmission: "Establish life support systems for personnel.",
        SolveStatus: "Pending",
        Requirement: ["Power Grid"],
        difficulty: 2,
        QuestDesc: {
          Synopsis: "Life support systems are maintaining safe conditions.",
          Trivia: "These systems can support up to 500 personnel."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Research Database",
        DetailsForSubmission: "Create a secure database for research data.",
        SolveStatus: "Pending",
        Requirement: ["Data Center", "Security System"],
        difficulty: 3,
        QuestDesc: {
          Synopsis: "The research database is secure and operational.",
          Relations: "Enables {{ Advanced Research }} projects."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Communication Hub",
        DetailsForSubmission: "Set up external communication systems.",
        SolveStatus: "Pending",
        Requirement: ["Data Center"],
        difficulty: 2,
        QuestDesc: {
          Synopsis: "Communication systems are connecting the facility to the outside world.",
          Relations: "Enables coordination with {{ External Partners }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Facility Operational*",
        DetailsForSubmission: "Automatically triggered when all systems are online.",
        SolveStatus: "Pending",
        Requirement: ["Research Database", "Communication Hub", "Life Support"],
        category: "Special",
        QuestDesc: {
          Synopsis: "The facility is fully operational with all systems online.",
          Trivia: "This represents the culmination of all infrastructure efforts."
        },
        rewards: [
          {
            type: "Achievement",
            name: "Infrastructure Master",
            description: "Successfully built a complete facility infrastructure."
          }
        ],
        QuestCredit: { name: "Pending", date: "Pending" }
      }
    ]
  }
];

// Failure Scenario Demonstration:
// If "Power Grid" fails due to "Generator Overload" or "Sabotage Attempt":
// 1. "Data Center" auto-fails (depends on Power Grid must requirement)
// 2. "Security System" auto-fails (depends on Power Grid must requirement)  
// 3. "Life Support" auto-fails (depends on Power Grid must requirement)
// 4. "Research Database" auto-fails (depends on Data Center, which failed)
// 5. "Communication Hub" auto-fails (depends on Data Center, which failed)
// 6. "Facility Operational" auto-fails (depends on multiple failed systems)
// Result: Complete facility failure from single critical point
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
      },
      {
        QuestName: "Must Requirement Logic",
        DetailsForSubmission: "Demonstrates must requirement with boolean logic.",
        SolveStatus: "Pending",
        MustRequirement: true,
        MissName: "Critical Logic Failure",
        MissInfo: "The logical foundation collapsed.",
        failIfFailed: "({{ Foundation A }} AND {{ Foundation B }}) OR {{ Critical Error }}",
        // This quest's failure will cascade to any quest that requires it
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Dependent on Must Requirement",
        DetailsForSubmission: "This quest depends on the must requirement above.",
        SolveStatus: "Pending",
        Requirement: ["Must Requirement Logic", "Other Requirement"],
        failIfFailed: "{{ Independent Failure }}",
        // If "Must Requirement Logic" fails, this auto-fails regardless of "Independent Failure"
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
3. **Strategic Must Requirements**: Only use must requirements for truly critical quests
4. **Balanced Complexity**: Don't overuse complex boolean logic unless necessary
5. **User-Friendly Names**: Use descriptive quest names that indicate their purpose
6. **Complete Documentation**: Always provide synopsis and trivia for solved quests

### Must Requirement Best Practices

1. **Use Sparingly**: Must requirements should be reserved for truly critical infrastructure or story elements
2. **Clear Failure Conditions**: Must requirement quests should have well-defined failure conditions
3. **Proper Validation**: Always include MissName and MissInfo for must requirement quests
4. **Consider Impact**: Think carefully about the cascading effect before marking a quest as must requirement
5. **Document Dependencies**: Clearly document which quests depend on must requirements

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
5. **Must Requirement Impact**: Consider the performance impact of cascading failures

## 🔍 Validation and Error Handling

The system includes comprehensive validation with detailed error reporting:

### Automatic Validation Checks

- **Unique Identifiers**: Ensures quest names and miss names are unique
- **Schema Compliance**: Validates all required fields are present and correctly typed
- **Dependency Validation**: Checks that all referenced quests exist
- **Logic Validation**: Validates boolean expressions are syntactically correct
- **Credit Validation**: Ensures solved quests have complete credit information
- **Must Requirement Validation**: Ensures must requirement quests have proper failure conditions
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

// ❌ Must requirement without proper failure conditions
{
  QuestName: "Invalid Must Req"
  MustRequirement: true
  // Error: Missing MissName or MissInfo
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
3. **Must Requirement Testing**: Test cascading failure scenarios thoroughly
4. **Edge Case Testing**: Test unusual combinations of quest states
5. **UI Testing**: Ensure changes display correctly in all views
6. **Mobile Testing**: Verify responsive behavior on mobile devices

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