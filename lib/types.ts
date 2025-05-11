export interface QuestDesc {
    Synopsis: string // A brief overview of the quest once completed
    Trivia?: string // Interesting facts or lore related to the quest
    Relations?: string // Connections to other quests or questlines
}

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

// failIfFailed can now be a string, array of strings, or array with logic operators
export type FailCondition = string

// New QuestCredit interface for tracking submission credits
export interface QuestCredit {
    name: string
    date: string
}

export interface QuestData {
    QuestName: string
    DetailsForSubmission: string
    SolveStatus: "Solved" | "Failed" | "Pending"
    MissName?: string
    MissInfo?: string
    Requirement?: string[]  // Optional field for quest requirements, made of {{ questName }} to link to other quests
    Secret?: boolean
    SecretHint?: string
    failIfFailed?: FailCondition
    QuestDesc?: QuestDesc // Optional field for quest synopsis, trivia, and relations
    isLocked?: boolean
    autoSolve?: boolean
    difficulty?: 1 | 2 | 3 | 4 | 5 // 1-5 scale, 5 being hardest
    category?: "Main" | "Side" | "Hidden" | "Special" | "Daily" | "Weekly"
    timeEstimate?: number // in minutes
    rewards?: QuestReward[]
    relatedQuestlines?: string[] // names of related questlines
    QuestCredit: QuestCredit // Compulsory field for tracking who solved the quest
}

export interface Questline {
    questline_name: string
    quests: QuestData[]
    description?: string
    category?: "Main Story" | "Side Content" | "Special Event" | "Tutorial"
    requiredLevel?: number
    recommendedLevel?: number
    location?: string
    timeline?: number // chronological order in the story (lower = earlier)
}

export interface QuestConnection {
    source: string // quest name
    target: string // quest name
    type: "requires" | "unlocks" | "fails" | "related"
}

// Theme type for light/dark mode
export type Theme = "light" | "dark"
