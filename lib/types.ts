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
}

// Boolean logic operators for failIfFailed conditions
export type LogicOperator = "AND" | "OR" | "XOR" | "NAND" | "NOR"

// Protected keywords that can't be used as quest names
export const PROTECTED_KEYWORDS: string[] = ["AND", "OR", "XOR", "NAND", "NOR", "*", " ", "}}", "{{", "{{}}", "{}", "{", "}"]

// New QuestCredit interface for tracking submission credits
export interface QuestCredit {
    name: string
    date: string
}

export interface QuestData {
    // Name of the quest, must be unique and not contain protected keywords
    QuestName: string
    // Details for quest submission, hidden is Secret is true
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
    // Optional field for quest synopsis, trivia, and relations
    QuestDesc?: QuestDesc
    // DON'T SET MANUALLY - Optional field for quest lock status, use manualLock instead
    isLocked?: boolean
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
}

export interface QuestConnection {
    source: string
    target: string
    type: "requires" | "unlocks" | "fails" | "related"
}
