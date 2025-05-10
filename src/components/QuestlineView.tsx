"use client"

import type {Quest, Questline} from "../types"
import QuestStatus from "./QuestStatus"

interface QuestlineViewProps {
    questline: Questline
    onQuestSelect: (quest: Quest) => void
    isQuestLocked: (quest: Quest, allQuests: Quest[]) => boolean
}

const QuestlineView = ({questline, onQuestSelect, isQuestLocked}: QuestlineViewProps) => {
    return (
        <div className="questline-view">
            <h2>{questline.questline_name}</h2>

            <div className="quests-container">
                {questline.quests.map((quest) => {
                    const isSecret = quest["Secret?"] && quest.SolveStatus !== "Solved"
                    const isLocked = isQuestLocked(quest, questline.quests)

                    return (
                        <div
                            key={quest.QuestName}
                            className={`quest-item ${quest.SolveStatus.toLowerCase()} ${isLocked ? "locked" : ""} ${quest.autoResolve ? "auto-resolve" : ""}`}
                            onClick={() => onQuestSelect(quest)}
                        >
                            <QuestStatus quest={quest} allQuests={questline.quests}/>

                            <div className="quest-name">
                                {isSecret ?
                                    <span className="secret-quest">???</span> : quest.QuestName.replace("*", "")}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default QuestlineView
