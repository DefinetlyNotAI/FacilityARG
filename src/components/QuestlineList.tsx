"use client"

import type {Questline} from "../types"

interface QuestlineListProps {
    questlines: Questline[]
    selectedQuestline: Questline | null
    onQuestlineSelect: (questline: Questline) => void
}

const QuestlineList = ({questlines, selectedQuestline, onQuestlineSelect}: QuestlineListProps) => {
    return (
        <div className="questline-list">
            <h2>Questlines</h2>
            <ul>
                {questlines.map((questline) => (
                    <li
                        key={questline.questline_name}
                        className={`questline-item ${selectedQuestline?.questline_name === questline.questline_name ? "selected" : ""}`}
                        onClick={() => onQuestlineSelect(questline)}
                    >
                        {questline.questline_name}
                        <span className="quest-count">
              {questline.quests.filter((q) => q.SolveStatus === "Solved").length} / {questline.quests.length}
            </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default QuestlineList
