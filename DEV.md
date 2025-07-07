# Developer Documentation

## Project Overview

The Quest Tracker is a sophisticated web application for managing complex ARG (Alternate Reality Game) questlines with advanced dependency resolution, boolean logic conditions, and recursive failure cascading.

## System Flow

```
1. Data Loading (all_quests.tsx)
   ↓
2. Quest Processing (quest-utils.ts)
   ↓
3. Validation (validator.ts)
   ↓
4. UI Rendering (React Components)
   ↓
5. User Interaction & State Updates
```

## File Structure & Responsibilities

### Core Application Files

#### `app/page.tsx` - Main Application Component
**Purpose**: Root component that orchestrates the entire application
**Key Features**:
- State management for quest data, filters, and UI state
- Mobile-responsive sidebar handling
- Tab navigation between different views
- Quest selection and filtering logic

**Modifiable Elements**:
- `activeRightTab` state - Change default tab
- Filter logic in `useEffect` for custom filtering behavior
- Mobile breakpoint handling
- Tab configuration and layout

#### `app/layout.tsx` - Application Layout
**Purpose**: Defines the overall application structure and metadata
**Key Features**:
- Theme provider integration
- Global metadata configuration
- Font loading (Inter)

**Modifiable Elements**:
- Application title and description
- Font family selection
- Global CSS imports

#### `app/globals.css` - Global Styles
**Purpose**: Contains all global styles, theme variables, and custom CSS
**Key Features**:
- Dark/light theme CSS variables
- Custom scrollbar styling
- Quest status color classes
- Mobile-specific improvements

**Modifiable Elements**:
- Color scheme variables (`:root` and `.dark`)
- Quest status colors (`.quest-status-*`)
- Mobile breakpoints and responsive behavior
- Custom scrollbar appearance

### Data Processing & Logic

#### `lib/quest-utils.ts` - Core Quest Processing Engine
**Purpose**: The heart of the quest system - processes all quest logic and dependencies
**Key Features**:
- Multi-phase quest processing with convergence detection
- MustRequirement recursive cascading failure logic
- Boolean logic evaluation for failure conditions
- Auto-solve quest handling
- Lock status management

**Processing Phases**:
1. **MustRequirement Cascading** (Phase 1 - Highest Priority)
    - Overrides manual locks
    - Recursive failure propagation
2. **Lock Status Updates** (Phase 2)
    - Requirement-based locking
    - Manual lock respect (except for MustRequirement overrides)
3. **Regular Failure Logic** (Phase 3)
    - `failIfFailed` and `failIfPending` evaluation
4. **Auto-Solve Logic** (Phase 4)
    - Automatic quest resolution based on requirements

**Modifiable Elements**:
- `maxIterations` - Increase for more complex dependency chains
- Processing phase order - Reorder phases for different priority logic
- Convergence detection logic
- Debug logging verbosity

**Key Functions**:
- `processQuestData()` - Main entry point
- `getFailedMustRequirementInChain()` - MustRequirement detection
- `evaluateFailCondition()` - Boolean logic parser

#### `lib/validator.ts` - Data Validation & Safety
**Purpose**: Ensures data integrity and prevents system-breaking configurations
**Key Features**:
- Circular dependency detection (regular and MustRequirement)
- Schema validation for required fields
- Self-reference detection in failure conditions
- Critical error handling for MustRequirement circles

**Validation Types**:
- **Regular Circular Dependencies**: Logged as errors
- **MustRequirement Circular Dependencies**: Throws critical error, prevents startup
- **Schema Compliance**: Validates required fields and relationships
- **Self-References**: Detects quests referencing themselves

**Modifiable Elements**:
- Validation strictness levels
- Error vs warning classification
- Custom validation rules
- Circular dependency detection depth

#### `lib/types.ts` - Type Definitions
**Purpose**: Defines all TypeScript interfaces and types for the quest system
**Key Interfaces**:
- `QuestData` - Individual quest structure
- `Questline` - Collection of related quests
- `QuestReward` - Reward system structure
- `QuestCredit` - Submission tracking
- `LogicOperator` - Boolean logic operators

**Modifiable Elements**:
- Add new quest properties
- Extend reward types
- Add new quest categories
- Modify validation constraints

### UI Components

#### `components/quest-detail.tsx` - Quest Information Display
**Purpose**: Displays comprehensive quest information with dynamic content based on quest state
**Key Features**:
- Markdown support with quest linking (`{{ QuestName }}` format)
- State-based content rendering (Failed > Locked > Solved > Secret > Default)
- MustRequirement failure detection and messaging
- Reward display with failure state handling

**Modifiable Elements**:
- Markdown rendering logic (`processText` function)
- Quest state priority order in `renderQuestContent()`
- Badge colors and styling
- Failure message formatting

#### `components/quest-filter.tsx` - Search & Filter Interface
**Purpose**: Provides search and filtering capabilities for quests
**Key Features**:
- Real-time search across quest names and descriptions
- Status-based filtering (Pending, Solved, Failed)
- Collapsible filter interface

**Modifiable Elements**:
- Search fields (add new searchable properties)
- Filter categories
- UI layout and styling

#### `components/quest-statistics.tsx` - Progress Analytics
**Purpose**: Displays comprehensive statistics and progress tracking
**Key Features**:
- Overall completion percentages
- Per-questline progress visualization
- Quest type counting (secret, missable, etc.)
- Most progressed questline identification

**Modifiable Elements**:
- Statistic calculations
- Chart types and visualizations
- Progress bar styling
- Additional metrics

#### `components/quest-dep-graph.tsx` - Visual Dependency Network
**Purpose**: Interactive graph visualization of quest relationships
**Key Features**:
- Canvas-based rendering with touch/mouse support
- Automatic layout with level-based positioning
- External quest dependency visualization
- Connection type differentiation (requires, fails, related)

**Modifiable Elements**:
- Node positioning algorithms
- Visual styling (colors, sizes, shapes)
- Interaction behaviors
- Layout algorithms

#### `components/quest-timeline.tsx` - Chronological Quest View
**Purpose**: Displays quests in chronological story order
**Key Features**:
- Timeline-based questline ordering
- Quest metadata display
- Category-based styling

**Modifiable Elements**:
- Timeline layout and styling
- Quest grouping logic
- Metadata display format

#### `components/questline-list.tsx` - Quest Navigation
**Purpose**: Main navigation interface for browsing quests
**Key Features**:
- Collapsible questline sections
- Progress indicators
- Quest status icons
- Mobile-optimized touch targets

**Modifiable Elements**:
- Expansion/collapse behavior
- Progress calculation methods
- Icon and status display
- Mobile responsiveness

### Quest Data Files

#### `components/quests/all_quests.tsx` - Data Aggregation
**Purpose**: Central export point for all quest data
**Modifiable Elements**:
- Add new questline imports
- Reorder questlines for different processing priority

#### Individual Questline Files (`prologue.tsx`, `facility.tsx`, etc.)
**Purpose**: Define individual questlines with their quests
**Structure**:
```typescript
export const QuestlineName: Questline[] = [
  {
    questline_name: "Name",
    description: "Description",
    category: "Category",
    timeline: 1,
    quests: [
      // Quest definitions
    ]
  }
];
```

**Modifiable Elements**:
- Quest definitions and properties
- Questline metadata
- Dependency relationships
- Failure conditions

## System Architecture Deep Dive

### Quest Processing Engine

The quest processing system uses a **convergence-based iterative approach** to handle complex dependencies:

1. **Initialization**: Load all quests into a global map for cross-questline access
2. **Iterative Processing**: Run processing phases until no changes occur
3. **Phase-Based Logic**: Each phase handles specific aspects of quest logic
4. **Convergence Detection**: Stop when system reaches stable state

### MustRequirement Recursive Cascading

**Priority**: Highest - overrides all other logic including manual locks

**Behavior**:
- When a MustRequirement quest fails, ALL dependent quests fail recursively
- Failure propagates through entire dependency chains
- Root cause tracking maintains reference to original failed MustRequirement
- Manual locks are overridden to allow viewing of failed quests

**Example Flow**:
```
QuestA (MustRequirement) → QuestB → QuestC → QuestD
If QuestA fails:
1. QuestB fails due to QuestA MustRequirement
2. QuestC fails due to QuestA MustRequirement (traced through QuestB)
3. QuestD fails due to QuestA MustRequirement (traced through QuestC)
```

### Boolean Logic System

Supports complex failure conditions using standard boolean operators:
- `AND`, `OR`, `XOR`, `NAND`, `NOR`
- Parentheses for grouping
- Quest references in `{{ QuestName }}` format

**Example**: `(({{ A }} AND {{ B }}) OR {{ C }}) AND {{ D }}`

### Auto-Solve System

Quests marked with `*` automatically inherit status from requirements:
- Solves when all requirements are solved
- Fails when any requirement fails
- Respects lock status and other failure conditions

## Development Guidelines

### Adding New Features

1. **New Quest Properties**: Add to `QuestData` interface in `types.ts`
2. **New Processing Logic**: Add to appropriate phase in `quest-utils.ts`
3. **New Validation**: Add to `validator.ts`
4. **UI Updates**: Update relevant components to display new features

### Performance Considerations

1. **Iteration Limits**: Monitor convergence iterations for complex questlines
2. **Circular Dependencies**: Validation prevents infinite loops
3. **Memory Usage**: Large questlines may require optimization
4. **UI Responsiveness**: Complex graphs may need virtualization

### Testing Complex Logic

1. **MustRequirement Chains**: Test deep recursive failures
2. **Boolean Logic**: Test complex failure conditions
3. **Cross-Questline Dependencies**: Test requirements across questlines
4. **Edge Cases**: Test circular dependencies, self-references, missing quests

### Common Modification Patterns

#### Adding a New Quest Status
1. Update `QuestStatus` type in `types.ts`
2. Add processing logic in `quest-utils.ts`
3. Update UI components to handle new status
4. Add validation rules if needed

#### Creating Custom Failure Logic
1. Add new failure condition fields to `QuestData`
2. Implement evaluation logic in `quest-utils.ts`
3. Update boolean logic parser if needed
4. Add validation for new conditions

#### Extending the Dependency System
1. Add new dependency types to interfaces
2. Implement processing logic in appropriate phase
3. Update graph visualization if needed
4. Add validation for new dependency types

## Debugging & Troubleshooting

### Common Issues

1. **Quests Not Failing**: Check MustRequirement cascading and boolean logic
2. **Infinite Loops**: Check for circular dependencies in validation
3. **Performance Issues**: Monitor iteration count and convergence
4. **UI Not Updating**: Check state management and React re-rendering

### Debug Tools

1. **Console Logging**: Detailed logging in quest processing phases
2. **Validation Errors**: Comprehensive error reporting in validator

### Validation Error Types

- **Schema Errors**: Missing required fields, invalid types
- **Circular Dependencies**: Regular and MustRequirement circles
- **Reference Errors**: Non-existent quest references
- **Logic Errors**: Invalid boolean expressions

This documentation provides a comprehensive guide for understanding and modifying the Quest Tracker system. 
Each file has specific responsibilities and modification points to enable safe and effective development.