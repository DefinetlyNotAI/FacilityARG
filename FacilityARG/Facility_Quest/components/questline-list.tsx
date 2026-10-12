"use client"

import type React from "react"
import {useEffect, useState} from "react"

import type {QuestData, Questline} from "@/lib/types"
import QuestItem from "./quest-item"
import {CheckCircle, ChevronDown, ChevronRight} from "lucide-react"

interface QuestlineListProps {
    questlines: Questline[]
    selectedQuestline: string | null
    selectedQuest: QuestData | null
    onQuestlineSelectAction: (questlineName: string) => void
    onQuestSelectAction: (quest: QuestData) => void
}

export default function QuestlineList({
                                          questlines,
                                          selectedQuestline,
                                          selectedQuest,
                                          onQuestlineSelectAction,
                                          onQuestSelectAction,
                                      }: QuestlineListProps) {
    const [expandedQuestlines, setExpandedQuestlines] = useState<Record<string, boolean>>(
        questlines.reduce(
            (acc, questline) => {
                acc[questline.questline_name] = true
                return acc
            },
            {} as Record<string, boolean>,
        ),
    )

    useEffect(() => {
        if (questlines.length > 0) {
            setExpandedQuestlines((prev) => {
                const newState = {...prev}

                // Ensure all questlines have an expanded state
                questlines.forEach((questline) => {
                    // If questline doesn't have a state yet, default to expanded
                    if (newState[questline.questline_name] === undefined) {
                        newState[questline.questline_name] = true
                    }
                })

                return newState
            })
        }
    }, [questlines])

    const toggleQuestline = (questlineName: string, event: React.MouseEvent) => {
        // Stop propagation to prevent the event from bubbling up
        event.stopPropagation()

        setExpandedQuestlines((prev) => ({
            ...prev,
            [questlineName]: !prev[questlineName],
        }))

        // Only update the selected questline if it's not already selected
        if (selectedQuestline !== questlineName) {
            onQuestlineSelectAction(questlineName)
        }
    }

    // Calculate completion percentage for each questline
    const getQuestlineProgress = (questline: Questline) => {
        const totalQuests = questline.quests.length
        if (totalQuests === 0) return 0

        const solvedQuests = questline.quests.filter((q) => q.SolveStatus === "Solved").length
        return Math.round((solvedQuests / totalQuests) * 100)
    }

    return (
        <div className="space-y-4">
            {questlines.map((questline) => {
                const progress = getQuestlineProgress(questline)

                return (
                    <div key={questline.questline_name} className="border border-gray-700 rounded-lg overflow-hidden">
                        <button
                            onClick={(e) => toggleQuestline(questline.questline_name, e)}
                            className={`w-full flex items-center justify-between p-3 text-left font-medium ${
                                selectedQuestline === questline.questline_name
                                    ? "bg-gray-700 text-purple-400"
                                    : "bg-gray-800 hover:bg-gray-700"
                            }`}
                        >
                            <div className="flex items-center">
                                <span>{questline.questline_name}</span>
                                {progress === 100 && <CheckCircle className="h-4 w-4 text-green-500 ml-2"/>}
                            </div>
                            <div className="flex items-center">
                                <div className="mr-2 text-sm text-gray-400">{progress}%</div>
                                {expandedQuestlines[questline.questline_name] ? (
                                    <ChevronDown className="h-5 w-5"/>
                                ) : (
                                    <ChevronRight className="h-5 w-5"/>
                                )}
                            </div>
                        </button>

                        {expandedQuestlines[questline.questline_name] && (
                            <div className="p-2 bg-gray-900 rounded-b-lg">
                                <div className="w-full bg-gray-800 h-1 rounded-full mb-2 overflow-hidden">
                                    <div className="bg-purple-500 h-1" style={{width: `${progress}%`}}></div>
                                </div>
                                <ul className="space-y-1">
                                    {questline.quests.map((quest) => (
                                        <QuestItem
                                            key={quest.QuestName}
                                            quest={quest}
                                            isSelected={selectedQuest?.QuestName === quest.QuestName}
                                            onClickAction={() => onQuestSelectAction(quest)}
                                        />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
