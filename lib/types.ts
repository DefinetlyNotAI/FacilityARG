export interface QuestDesc {
    // A brief overview of the quest once completed
    Synopsis: string
    // Interesting facts or lore related to the quest
    Trivia?: string
    // Connections to other quests or questlines
    Relations?: string
}

// QuestReward interface for defining rewards for quests
export interface QuestReward {
    type: "Item" | "Experience" | "Currency" | "Reputation" | "Skill" | "Achievement"
    name: string
    amount?: number
    description?: string
    rarity?: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic"
    tradeable?: boolean
}

// Boolean logic operators for failIfFailed conditions
export type LogicOperator = "AND" | "OR" | "XOR" | "NAND" | "NOR"

// Protected keywords that can't be used as quest names
export const PROTECTED_KEYWORDS: string[] = ["AND", "OR", "XOR", "NAND", "NOR", "*", " ", "}}", "{{", "{{}}", "{}", "{", "}"]

// New QuestCredit interface for tracking submission credits
export interface QuestCredit {
    name: string
    date: string
    submissionMethod?: "Email" | "Discord" | "Website" | "Auto"
    verificationStatus?: "Pending" | "Verified" | "Rejected"
}

// New QuestSettings interface for advanced quest configuration
export interface QuestSettings {
    // Visibility settings
    hideFromList?: boolean
    showInTimeline?: boolean
    displayPriority?: number // Higher numbers appear first
    
    // Completion settings
    allowPartialCredit?: boolean
    maxAttempts?: number
    cooldownPeriod?: number // in hours
    
    // Collaboration settings
    requiresTeam?: boolean
    maxTeamSize?: number
    minTeamSize?: number
    
    // Seasonal/Event settings
    seasonalQuest?: boolean
    eventQuest?: boolean
    limitedTime?: boolean
    expirationDate?: string
    
    // Progression settings
    prerequisiteLevel?: number
    unlocksLevel?: number
    experienceMultiplier?: number
}

// New QuestSpecialty interface for quest categorization
export interface QuestSpecialty {
    type: "Combat" | "Puzzle" | "Social" | "Technical" | "Creative" | "Research" | "Exploration" | "Stealth" | "Speed" | "Endurance"
    level: 1 | 2 | 3 | 4 | 5 // Specialty intensity
    description?: string
}

// New QuestTags interface for flexible tagging
export interface QuestTags {
    gameplay?: ("Solo" | "Multiplayer" | "Cooperative" | "Competitive" | "PvP" | "PvE")[]
    themes?: ("Horror" | "Mystery" | "Adventure" | "Comedy" | "Drama" | "Sci-Fi" | "Fantasy" | "Historical")[]
    mechanics?: ("Steganography" | "Cryptography" | "Social Engineering" | "Code Breaking" | "Pattern Recognition" | "Logic Puzzles")[]
    difficulty?: ("Beginner" | "Intermediate" | "Advanced" | "Expert" | "Master")[]
    content?: ("Text" | "Audio" | "Video" | "Image" | "Interactive" | "AR" | "VR")[]
    platform?: ("Web" | "Mobile" | "Desktop" | "Discord" | "Email" | "Physical")[]
}

// New QuestMetrics interface for tracking quest performance
export interface QuestMetrics {
    attemptCount?: number
    successRate?: number
    averageCompletionTime?: number // in minutes
    popularityScore?: number
    difficultyRating?: number // Community-rated difficulty
    lastAttempted?: string
    firstCompleted?: string
}

export interface QuestData {
    // Name of the quest, must be unique and not contain protected keywords
    QuestName: string
    // Details for quest submission
    DetailsForSubmission: string
    // Status of the quest
    SolveStatus: "Solved" | "Failed" | "Pending"
    // Optional field if a quest is failable, must be unique, this is the name that will be shown if the quest is failed
    MissName?: string
    // Required (if MissName is set) - field for quest failure information
    MissInfo?: string
    // Optional field for quest requirements, made of {{ questName }} to link to other quests, either a quest needs to be solved or failed to unlock the requirements
    Requirement?: string[]
    // Optional field for quest secrecy, if true, the quest name will be hidden
    Secret?: boolean
    // Required (if Secret set to true) - field for quest hints
    SecretHint?: string
    // If any of these quests are failed, fail this quest - Field with a query based string that uses bool logic and {{ questName }} format
    failIfFailed?: string
    // If any of these quests are pending, fail this quest - Field with a query based string that uses bool logic and {{ questName }} format
    failIfPending?: string
    // If true, any quest that requires this quest will auto-fail if this quest fails with generic fail messages
    MustRequirement?: boolean
    // Optional field for quest synopsis, trivia, and relations
    QuestDesc?: QuestDesc
    // DON'T SET MANUALLY - Optional field for quest lock status, use manualLock instead
    isLocked?: boolean
    // Date locked, when the date finishes, the quest will be unlocked - until then it will be time-locked
    // Strict formatting, must be in "hh:mm:ss dd/mm/yyyy" format and is a 24-hour time, can use single digit hours and minutes, but must be in the correct format
    timeLock?: string
    // DON'T SET MANUALLY - Optional field for auto-solving the quest
    autoSolve?: boolean
    // Optional field if user wants to manually lock the quest, useful and recommended for quests that use failIfPending if the quest has requirements that are manual
    manualLock?: boolean
    // 1-5 scale, 5 being hardest
    difficulty?: 1 | 2 | 3 | 4 | 5
    // Category of the quest
    category?: "Main" | "Side" | "Hidden" | "Special" | "Daily" | "Weekly"
    // In minutes, the estimated time to complete the quest
    timeEstimate?: number
    // Optional field for quest rewards: type, name, amount, and description
    rewards?: QuestReward[]
    // List of Names for related questlines, if any, DON'T USE {{ questName }} FORMAT
    relatedQuestlines?: string[]
    // Compulsory field for tracking who solved the quest, Becomes compulsory if Status is set to Solved
    QuestCredit: QuestCredit
    
    // New enhanced features
    settings?: QuestSettings
    specialties?: QuestSpecialty[]
    tags?: QuestTags
    metrics?: QuestMetrics
    
    // Enhanced quest properties
    questType?: "Main" | "Side" | "Hidden" | "Bonus" | "Event" | "Daily" | "Weekly" | "Monthly" | "Seasonal"
    priority?: "Low" | "Normal" | "High" | "Critical" | "Emergency"
    complexity?: "Simple" | "Moderate" | "Complex" | "Very Complex" | "Extreme"
    
    // Accessibility and inclusion
    accessibilityFeatures?: ("ScreenReader" | "ColorBlind" | "MotorImpaired" | "HearingImpaired" | "CognitiveSupport")[]
    contentWarnings?: ("Violence" | "Horror" | "Flashing" | "Loud" | "Disturbing" | "Adult")[]
    
    // Progression and unlocks
    unlocksQuests?: string[] // Quests that become available after completing this one
    grantsAbilities?: string[] // Special abilities or tools unlocked
    
    // Community features
    allowHints?: boolean
    communityRating?: number // 1-5 stars
    communityComments?: boolean
    
    // Technical metadata
    version?: string
    lastUpdated?: string
    createdBy?: string
    maintainedBy?: string[]
}

export interface Questline {
    // Name of the questline, must be unique and not contain protected keywords
    questline_name: string
    // List of quests in the questline
    quests: QuestData[]
    // Optional field for questline description
    description?: string
    // Optional field for questline category
    category?: "Main Story" | "Side Content" | "Special Event" | "Tutorial"
    // Optional field for questline required level - This is not implemented logically yet
    requiredLevel?: number
    // Optional field for recommended level for the questline - This is not implemented logically yet
    recommendedLevel?: number
    // Optional field for questline location
    location?: string
    // Chronological order in the story (lower = earlier)
    timeline?: number
    
    // New questline features
    settings?: {
        allowParallelCompletion?: boolean
        enforceOrder?: boolean
        showProgress?: boolean
        unlockMode?: "Sequential" | "Branching" | "Open" | "Gated"
    }
    
    // Questline metadata
    estimatedDuration?: number // in hours
    playerCount?: {
        min?: number
        max?: number
        recommended?: number
    }
    
    // Questline specialties and themes
    primaryTheme?: "Mystery" | "Horror" | "Adventure" | "Puzzle" | "Social" | "Technical" | "Creative"
    secondaryThemes?: string[]
    targetAudience?: ("Beginner" | "Intermediate" | "Advanced" | "Expert")[]
    
    // Questline rewards and progression
    completionRewards?: QuestReward[]
    milestoneRewards?: { [percentage: number]: QuestReward[] }
    
    // Community and social features
    allowDiscussion?: boolean
    hasLeaderboard?: boolean
    competitiveMode?: boolean
}

export interface QuestConnection {
    source: string
    target: string
    type: "requires" | "unlocks" | "fails" | "related"
    strength?: "Weak" | "Moderate" | "Strong" | "Critical" // Connection importance
    bidirectional?: boolean
}
