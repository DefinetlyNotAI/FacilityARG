export interface Quest {
    QuestName: string
    DetailsForSubmission?: string
    QuestDesc?: {
        Synopsis: string
        Trivia?: string
        Relations?: string
    }
    SolveStatus: "Solved" | "Pending" | "Failed"
    "Secret?"?: boolean
    SecretHint?: string
    Requirement?: string[]
    MissName?: string
    MissInfo?: string
    failIfFailed?: string
    autoResolve?: boolean
    index?: number
}

export interface Questline {
    questline_name: string
    quests: Quest[]
}
