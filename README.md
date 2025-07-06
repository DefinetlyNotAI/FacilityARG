# Quest Tracker

A sophisticated web-based quest tracking system designed for managing complex ARG (Alternate Reality Game) questlines with advanced dependency resolution, boolean logic conditions, and comprehensive progress tracking.

## 🌟 Features

### Core Quest Management
- **Multi-Questline Organization**: Group related quests into logical questlines with metadata
- **Advanced Status Tracking**: Visual indicators for Pending, Solved, and Failed quests
- **Smart Dependency System**: Automatic quest locking based on requirements
- **Boolean Logic Conditions**: Complex fail conditions using AND, OR, XOR, NAND, NOR operators
- **Auto-Resolution Engine**: Automatic quest solving and failing based on dependencies
- **Recursive Must Requirement System**: Critical quests that cascade failures through entire dependency chains

### Special Quest Types
- **Secret Quests**: Hidden quests that display as "???" until discovered
- **Auto-Solve Quests**: Quests that automatically resolve when conditions are met
- **Missable Quests**: Quests with permanent failure conditions
- **Must Requirement Quests**: Critical quests whose failure recursively cascades to all dependent quests
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
5. **Recursive Must Requirement Cascading**: Handles cascading failures through entire dependency chains
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
  MustRequirement?: boolean           // If true, failure recursively cascades to all dependent quests
  
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

### Recursive Must Requirement System

The `MustRequirement` field creates **recursive** cascading failure chains when critical quests fail.

#### Must Requirement Mechanics

```typescript
{
  QuestName: "Critical Foundation"
  MustRequirement: true
  MissName: "Foundation Collapsed"
  MissInfo: "The foundation quest failed, making dependent quests impossible."
  // When this quest fails, ALL quests that require it will automatically fail
  // AND any quests that require those quests will also fail if their failure was due to this must requirement
}
```

#### Recursive Must Requirement Behavior

**Primary Behavior:**
- If a quest is marked with `MustRequirement: true`, any quest that lists it as a requirement becomes an "Only Pass" quest relative to it
- If the must-required quest fails, **all quests that require it will auto-fail**, regardless of their own internal state or other fulfilled requirements
- **RECURSIVE**: If Quest B fails due to Quest A (must requirement), and Quest C requires Quest B, then Quest C will also fail due to the original must requirement

**Recursive Fail Cascade Logic:**
- Quests that depend on a failed must-requirement will:
   - Automatically fail
   - Skip their normal fail condition logic
   - Not be counted as "manually failable" in the system
- **Recursive Chain**: If Quest A (must req) → Quest B → Quest C, and Quest A fails:
   1. Quest B auto-fails due to Quest A must requirement
   2. Quest C auto-fails because Quest B failed due to a must requirement
   3. The failure reason for Quest C traces back to the original Quest A

**Failure Reason Tracking:**
- The system tracks the **root cause** of must requirement failures
- All quests in the chain show the original failed must requirement as the cause
- This provides clear understanding of why entire quest chains failed

#### Recursive Must Requirement Examples

**Example 1: Basic Recursive Chain**
```typescript
// Critical Quest
{
  QuestName: "Power Grid"
  MustRequirement: true
  MissName: "Grid Failure"
  MissInfo: "The power grid failed catastrophically."
  failIfFailed: "{{ Generator Overload }}"
}

// Intermediate Quest
{
  QuestName: "Data Center"
  Requirement: ["Power Grid"]
  // No MustRequirement flag
}

// Final Quest
{
  QuestName: "Research Database"
  Requirement: ["Data Center"]
  // No MustRequirement flag
}

// Failure Scenario:
// 1. "Power Grid" fails due to "Generator Overload"
// 2. "Data Center" auto-fails due to "Power Grid" must requirement
// 3. "Research Database" auto-fails because "Data Center" failed due to must requirement
// 4. Both "Data Center" and "Research Database" show failure reason: "failed due to must requirement for Power Grid"
```

**Example 2: Complex Recursive Network**
```typescript
// Infrastructure Quests
QuestA: { 
    QuestName: "Foundation"
    MustRequirement: true 
}
QuestB: { 
    QuestName: "Structure"
    Requirement: ["Foundation"] 
}
QuestC: { 
    QuestName: "Systems"
    Requirement: ["Structure"] 
}
QuestD: { 
    QuestName: "Operations"
    Requirement: ["Systems"] 
}

// Parallel Dependencies
QuestE: { 
    QuestName: "Security"
    Requirement: ["Foundation"] 
}
QuestF: { 
    QuestName: "Monitoring"
    Requirement: ["Security", "Systems"] 
}

// Failure Scenario:
// If "Foundation" fails:
// 1. "Structure" fails (direct must requirement)
// 2. "Systems" fails (Structure failed due to must requirement)
// 3. "Operations" fails (Systems failed due to must requirement)
// 4. "Security" fails (direct must requirement)
// 5. "Monitoring" fails (both dependencies failed due to must requirement)
// Result: Entire network collapses from single critical failure
```

**Example 3: Mixed Must Requirements in Chain**
```typescript
QuestA: { 
    QuestName: "Critical A"
    MustRequirement: true 
}
QuestB: { 
    QuestName: "Critical B"
    Requirement: ["Critical A"]
    MustRequirement: true 
}
QuestC: { 
    QuestName: "Dependent C"
    Requirement: ["Critical B"] 
}
QuestD: { 
    QuestName: "Final D"
    Requirement: ["Dependent C"] 
}

// Failure Scenarios:
// Scenario 1: "Critical A" fails
// - "Critical B" fails due to "Critical A" must requirement
// - "Dependent C" fails due to "Critical A" must requirement (traced through B)
// - "Final D" fails due to "Critical A" must requirement (traced through C)

// Scenario 2: "Critical B" fails independently
// - "Dependent C" fails due to "Critical B" must requirement
// - "Final D" fails due to "Critical B" must requirement (traced through C)
```

#### Must Requirement UI & Messaging

**Visual Indicators:**
- Must requirement quests show a red "Must Requirement" badge
- Requirements list shows must requirements with a red asterisk (*)
- Failed quests due to must requirements show special failure messaging with root cause

**Recursive Failure Messages:**
- Quests that auto-fail due to must requirements show:
   - Generic fail message: "{{ questName }} failed due to a must requirement for {{ rootFailedMustRequirement }}"
   - The root cause is always the original failed must requirement, not the immediate dependency
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
- Circular dependencies in must requirements are detected and prevented

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

4. **Recursive Must Requirement Cascading Phase**
   - Check for failed must requirements in dependency chains
   - Apply cascading failures to dependent quests recursively
   - Set generic failure messages with root cause tracking

5. **Auto-Solve Phase**
   - Process auto-solve quests
   - Inherit states from dependencies
   - Apply auto-solve results

6. **Convergence Phase**
   - Repeat phases 2-5 until no changes occur
   - Ensure all quest states are stable
   - Finalize quest statuses

#### Convergence Example with Recursive Must Requirements

```typescript
// Initial State
QuestA: { 
    SolveStatus: "Solved"
    MustRequirement: true 
}
QuestB: { 
    SolveStatus: "Pending"
    Requirement: ["Quest A"] 
}
QuestC: { 
    SolveStatus: "Pending"
    Requirement: ["Quest B"] 
}
QuestD: { 
    SolveStatus: "Pending"
    Requirement: ["Quest C"] 
}
QuestE: { 
    SolveStatus: "Pending"
    failIfFailed: "{{ Quest A }}" 
}

// Pass 1: Dependency Resolution
QuestB: { isLocked: false }  // Quest A is solved
QuestC: { isLocked: true }   // Quest B is still pending
QuestD: { isLocked: true }   // Quest C is still pending

// Pass 2: User action causes Quest A to fail
QuestA: { SolveStatus: "Failed" }

// Pass 3: Recursive Must Requirement Cascading
QuestB: { 
    SolveStatus: "Failed"
    MissInfo: "Quest B failed due to a must requirement for Quest A" 
}
QuestC: { isLocked: false }  // Quest B resolved (failed)

// Pass 4: Continue Recursive Cascading
QuestC: {
    SolveStatus: "Failed"
    MissInfo: "Quest C failed due to a must requirement for Quest A" 
}
QuestD: { isLocked: false }  // Quest C resolved (failed)

// Pass 5: Final Recursive Cascading
QuestD: { 
    SolveStatus: "Failed"
    MissInfo: "Quest D failed due to a must requirement for Quest A" 
}

// Pass 6: Regular Failure Conditions
QuestE: { SolveStatus: "Failed" }  // Fails due to failIfFailed condition

// Pass 7: No more changes
// Final State: All quests stable with recursive cascading failures applied
// Note: All recursive failures trace back to the original Quest A as root cause
```

## 🔍 Advanced Examples

### Complex Questline with Recursive Must Requirements

```typescript
export const RecursiveMustRequirementExample: Questline[] = [
  {
    questline_name: "Critical Infrastructure Network",
    description: "A questline demonstrating recursive must requirements and cascading failures",
    category: "Main Story",
    timeline: 1,
    quests: [
      {
        QuestName: "Foundation Systems",
        DetailsForSubmission: "Establish the foundational infrastructure for the entire facility.",
        SolveStatus: "Pending",
        MustRequirement: true,
        difficulty: 5,
        MissName: "Foundation Collapse",
        MissInfo: "The foundational systems failed catastrophically, making all dependent infrastructure impossible to maintain.",
        failIfFailed: "{{ Structural Failure }} OR {{ Power Core Meltdown }}",
        QuestDesc: {
          Synopsis: "You successfully established the foundational infrastructure.",
          Trivia: "This foundation supports all subsequent facility development.",
          Relations: "Critical for {{ Primary Infrastructure }}, {{ Secondary Systems }}, and all dependent operations."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Structural Failure",
        DetailsForSubmission: "Hidden quest: Monitor structural integrity.",
        SolveStatus: "Pending",
        Secret: true,
        SecretHint: "Watch for signs of structural weakness in the foundation.",
        difficulty: 4,
        category: "Hidden",
        QuestDesc: {
          Synopsis: "Critical structural damage was detected and addressed.",
          Trivia: "The failure was caused by unexpected geological instability."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Power Core Meltdown",
        DetailsForSubmission: "Hidden quest: Prevent power core overload.",
        SolveStatus: "Pending",
        Secret: true,
        SecretHint: "Monitor power core temperature and radiation levels.",
        difficulty: 5,
        category: "Hidden",
        QuestDesc: {
          Synopsis: "You prevented a catastrophic power core meltdown.",
          Trivia: "The meltdown would have destroyed the entire facility."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Primary Infrastructure",
        DetailsForSubmission: "Build the primary infrastructure layer.",
        SolveStatus: "Pending",
        Requirement: ["Foundation Systems"],
        difficulty: 4,
        QuestDesc: {
          Synopsis: "Primary infrastructure is operational and supporting secondary systems.",
          Relations: "Enables {{ Data Networks }}, {{ Security Grid }}, and {{ Life Support Matrix }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Secondary Systems",
        DetailsForSubmission: "Implement secondary support systems.",
        SolveStatus: "Pending",
        Requirement: ["Foundation Systems"],
        MustRequirement: true,
        difficulty: 3,
        MissName: "Secondary Failure",
        MissInfo: "Secondary systems failed, compromising all dependent operations.",
        failIfFailed: "{{ Backup Generator Failure }}",
        QuestDesc: {
          Synopsis: "Secondary systems are providing redundancy and support.",
          Relations: "Supports {{ Operational Centers }} and {{ Research Facilities }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Data Networks",
        DetailsForSubmission: "Establish comprehensive data networking.",
        SolveStatus: "Pending",
        Requirement: ["Primary Infrastructure"],
        difficulty: 3,
        QuestDesc: {
          Synopsis: "Data networks are connecting all facility systems.",
          Relations: "Enables {{ Central Database }} and {{ Communication Systems }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Security Grid",
        DetailsForSubmission: "Deploy facility-wide security systems.",
        SolveStatus: "Pending",
        Requirement: ["Primary Infrastructure"],
        difficulty: 4,
        QuestDesc: {
          Synopsis: "Security grid is protecting all facility operations.",
          Relations: "Protects {{ Central Database }} and {{ Research Facilities }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Life Support Matrix",
        DetailsForSubmission: "Create redundant life support systems.",
        SolveStatus: "Pending",
        Requirement: ["Primary Infrastructure"],
        difficulty: 2,
        QuestDesc: {
          Synopsis: "Life support matrix is maintaining optimal conditions throughout the facility.",
          Trivia: "The matrix can support up to 2000 personnel with full redundancy."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Operational Centers",
        DetailsForSubmission: "Establish operational command centers.",
        SolveStatus: "Pending",
        Requirement: ["Secondary Systems"],
        difficulty: 3,
        QuestDesc: {
          Synopsis: "Operational centers are coordinating all facility activities.",
          Relations: "Manages {{ Advanced Operations }} and {{ Research Coordination }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Research Facilities",
        DetailsForSubmission: "Build advanced research laboratories.",
        SolveStatus: "Pending",
        Requirement: ["Secondary Systems", "Security Grid"],
        difficulty: 4,
        QuestDesc: {
          Synopsis: "Research facilities are conducting cutting-edge experiments.",
          Relations: "Enables {{ Breakthrough Research }} projects."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Central Database",
        DetailsForSubmission: "Create the central data repository.",
        SolveStatus: "Pending",
        Requirement: ["Data Networks", "Security Grid"],
        difficulty: 3,
        QuestDesc: {
          Synopsis: "Central database is storing and processing all facility data.",
          Relations: "Supports {{ Advanced Analytics }} and {{ Research Coordination }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Advanced Operations",
        DetailsForSubmission: "Launch advanced operational procedures.",
        SolveStatus: "Pending",
        Requirement: ["Operational Centers", "Central Database"],
        difficulty: 4,
        QuestDesc: {
          Synopsis: "Advanced operations are running at peak efficiency.",
          Relations: "Culminates in {{ Facility Mastery }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Research Coordination",
        DetailsForSubmission: "Coordinate all research activities.",
        SolveStatus: "Pending",
        Requirement: ["Research Facilities", "Central Database"],
        difficulty: 3,
        QuestDesc: {
          Synopsis: "Research coordination is maximizing scientific output.",
          Relations: "Contributes to {{ Facility Mastery }}."
        },
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Facility Mastery*",
        DetailsForSubmission: "Automatically achieved when all systems reach peak performance.",
        SolveStatus: "Pending",
        Requirement: ["Advanced Operations", "Research Coordination", "Life Support Matrix"],
        category: "Special",
        QuestDesc: {
          Synopsis: "The facility has achieved complete operational mastery with all systems working in perfect harmony.",
          Trivia: "This represents the pinnacle of infrastructure development and coordination."
        },
        rewards: [
          {
            type: "Achievement",
            name: "Infrastructure Grandmaster",
            description: "Successfully built and coordinated a complete facility infrastructure network."
          }
        ],
        QuestCredit: { name: "Pending", date: "Pending" }
      }
    ]
  }
];

// Recursive Failure Scenario Demonstration:
// If "Foundation Systems" fails due to "Structural Failure" or "Power Core Meltdown":
// 
// IMMEDIATE FAILURES (Direct Dependencies):
// 1. "Primary Infrastructure" auto-fails (depends on Foundation Systems must requirement)
// 2. "Secondary Systems" auto-fails (depends on Foundation Systems must requirement)
// 
// RECURSIVE FAILURES (Dependencies of Failed Quests):
// 3. "Data Networks" auto-fails (depends on Primary Infrastructure, which failed due to must requirement)
// 4. "Security Grid" auto-fails (depends on Primary Infrastructure, which failed due to must requirement)
// 5. "Life Support Matrix" auto-fails (depends on Primary Infrastructure, which failed due to must requirement)
// 6. "Operational Centers" auto-fails (depends on Secondary Systems, which failed due to must requirement)
// 7. "Research Facilities" auto-fails (depends on Secondary Systems, which failed due to must requirement)
// 
// DEEPER RECURSIVE FAILURES (Dependencies of Recursively Failed Quests):
// 8. "Central Database" auto-fails (depends on Data Networks and Security Grid, both failed due to must requirement)
// 9. "Advanced Operations" auto-fails (depends on Operational Centers and Central Database, both failed due to must requirement)
// 10. "Research Coordination" auto-fails (depends on Research Facilities and Central Database, both failed due to must requirement)
// 11. "Facility Mastery" auto-fails (depends on Advanced Operations, Research Coordination, and Life Support Matrix, all failed due to must requirement)
// 
// RESULT: Complete facility collapse from single critical point failure
// ALL FAILURE MESSAGES: "failed due to a must requirement for Foundation Systems" (root cause tracking)
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
        QuestName: "Recursive Must Requirement Logic",
        DetailsForSubmission: "Demonstrates recursive must requirement with boolean logic.",
        SolveStatus: "Pending",
        MustRequirement: true,
        MissName: "Critical Logic Failure",
        MissInfo: "The logical foundation collapsed recursively.",
        failIfFailed: "({{ Foundation A }} AND {{ Foundation B }}) OR {{ Critical Error }}",
        // This quest's failure will recursively cascade to any quest that requires it
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Dependent on Recursive Must Requirement",
        DetailsForSubmission: "This quest depends on the recursive must requirement above.",
        SolveStatus: "Pending",
        Requirement: ["Recursive Must Requirement Logic", "Other Requirement"],
        failIfFailed: "{{ Independent Failure }}",
        // If "Recursive Must Requirement Logic" fails, this auto-fails regardless of "Independent Failure"
        QuestCredit: { name: "Pending", date: "Pending" }
      },
      {
        QuestName: "Deep Recursive Dependency",
        DetailsForSubmission: "This quest depends on the previous dependent quest.",
        SolveStatus: "Pending",
        Requirement: ["Dependent on Recursive Must Requirement"],
        // If "Recursive Must Requirement Logic" fails, this will also fail recursively
        // Failure message will trace back to the original "Recursive Must Requirement Logic"
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
3. **Strategic Must Requirements**: Only use must requirements for truly critical infrastructure or story elements
4. **Balanced Complexity**: Don't overuse complex boolean logic unless necessary
5. **User-Friendly Names**: Use descriptive quest names that indicate their purpose
6. **Complete Documentation**: Always provide synopsis and trivia for solved quests

### Recursive Must Requirement Best Practices

1. **Use Very Sparingly**: Recursive must requirements should be reserved for absolutely critical infrastructure that would realistically cause cascading failures
2. **Clear Failure Conditions**: Must requirement quests should have well-defined failure conditions that make narrative sense
3. **Proper Validation**: Always include MissName and MissInfo for must requirement quests
4. **Consider Recursive Impact**: Think carefully about the entire dependency chain before marking a quest as must requirement
5. **Document Dependency Networks**: Clearly document which quests depend on must requirements and how failures will cascade
6. **Test Thoroughly**: Test recursive failure scenarios to ensure they behave as expected
7. **Avoid Deep Chains**: Limit the depth of recursive must requirement chains to maintain system performance and user comprehension

### Data Organization Best Practices

1. **Logical Grouping**: Group related quests into coherent questlines
2. **Chronological Order**: Use timeline numbers to indicate story progression
3. **Consistent Categories**: Apply categories consistently across similar quest types
4. **Complete Credits**: Always provide credit information for solved quests
5. **Validation**: Test complex logic conditions and recursive scenarios thoroughly before deployment

### Performance Considerations

1. **Avoid Deep Nesting**: Limit boolean logic nesting to maintain readability
2. **Minimize Circular References**: Design quest dependencies to avoid circular logic
3. **Efficient Requirements**: Use the minimum number of requirements necessary
4. **Clear Failure Conditions**: Make failure conditions as simple as possible while meeting design goals
5. **Recursive Must Requirement Impact**: Consider the performance impact of deep recursive cascading failures
6. **Convergence Optimization**: The system uses iterative processing to handle recursive failures efficiently

## 🔍 Validation and Error Handling

The system includes comprehensive validation with detailed error reporting:

### Automatic Validation Checks

- **Unique Identifiers**: Ensures quest names and miss names are unique
- **Schema Compliance**: Validates all required fields are present and correctly typed
- **Dependency Validation**: Checks that all referenced quests exist
- **Logic Validation**: Validates boolean expressions are syntactically correct
- **Credit Validation**: Ensures solved quests have complete credit information
- **Must Requirement Validation**: Ensures must requirement quests have proper failure conditions
- **Circular Dependency Detection**: Prevents infinite loops in quest logic and recursive must requirements
- **Recursive Chain Validation**: Validates that recursive must requirement chains are properly structured

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

// ❌ Circular must requirement dependency
{
  QuestName: "Quest A"
  MustRequirement: true
  Requirement: ["Quest B"]
}
{
  QuestName: "Quest B"
  MustRequirement: true
  Requirement: ["Quest A"]
}
// Error: Circular must requirement dependency detected
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
4. Test complex logic conditions and recursive scenarios thoroughly

### Testing Guidelines

1. **Dependency Testing**: Verify requirement chains work as expected
2. **Logic Testing**: Test all boolean conditions with various quest states
3. **Recursive Must Requirement Testing**: Test cascading failure scenarios thoroughly, including deep chains
4. **Edge Case Testing**: Test unusual combinations of quest states
5. **UI Testing**: Ensure changes display correctly in all views
6. **Mobile Testing**: Verify responsive behavior on mobile devices
7. **Performance Testing**: Test system performance with complex recursive scenarios

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