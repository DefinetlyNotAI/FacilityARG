import type {Quest} from "../types"
import {CheckCircle, Lock, XCircle} from "lucide-react"

interface QuestStatusProps {
    quest: Quest
    allQuests: Quest[]
}

const QuestStatus = ({quest, allQuests}: QuestStatusProps) => {
    const isLocked =
        quest.Requirement &&
        !quest.Requirement.some((reqName) => {
            const requiredQuest = allQuests.find((q) => q.QuestName === reqName)
            return requiredQuest && (requiredQuest.SolveStatus === "Solved" || requiredQuest.SolveStatus === "Failed")
        })

    if (isLocked) {
        return (
            <div className="quest-status locked" title={`Requires: ${quest.Requirement?.join(", ")}`}>
                <Lock size={16}/>
            </div>
        )
    }

    switch (quest.SolveStatus) {
        case "Solved":
            return (
                <div className="quest-status solved">
                    <CheckCircle size={16}/>
                </div>
            )
        case "Failed":
            return (
                <div className="quest-status failed" title={quest.MissInfo || "Failed"}>
                    <XCircle size={16}/>
                </div>
            )
        default:
            return (
                <div className={`quest-status pending ${quest.autoResolve ? "auto-resolve" : ""}`}>
                    {quest.autoResolve && <span className="auto-resolve-indicator">*</span>}
                </div>
            )
    }
}

export default QuestStatus
