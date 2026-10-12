"use client"

import type {Questline} from "@/lib/types"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"

interface QuestTimelineProps {
    questlines: Questline[]
    onQuestSelectAction: (questName: string) => void
}

export default function QuestTimeline({questlines, onQuestSelectAction}: QuestTimelineProps) {
    // Sort questlines by timeline property (chronological order)
    const sortedQuestlines = [...questlines].sort((a, b) => {
        const timelineA = a.timeline || 999
        const timelineB = b.timeline || 999
        return timelineA - timelineB
    })

    // Get category color
    const getCategoryColor = (category?: string) => {
        switch (category) {
            case "Main Story":
                return "bg-blue-600"
            case "Side Content":
                return "bg-green-600"
            case "Special Event":
                return "bg-purple-600"
            case "Tutorial":
                return "bg-yellow-600"
            default:
                return "bg-gray-600"
        }
    }

    // Get quest status color
    const getQuestStatusColor = (status: string) => {
        switch (status) {
            case "Solved":
                return "bg-green-600"
            case "Failed":
                return "bg-red-600"
            case "Pending":
                return "bg-gray-600"
            default:
                return "bg-gray-600"
        }
    }

    return (
        <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
                <CardTitle className="text-xl">Quest Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-600"/>

                    <div className="space-y-8">
                        {sortedQuestlines.map((questline) => (
                            <div key={questline.questline_name} className="relative pl-10">
                                {/* Timeline dot */}
                                <div className="absolute left-4 top-4 w-4 h-4 -ml-2 rounded-full bg-purple-500"/>

                                <div className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-medium">{questline.questline_name}</h3>
                                        {questline.category && (
                                            <Badge
                                                className={getCategoryColor(questline.category)}>{questline.category}</Badge>
                                        )}
                                    </div>

                                    {questline.description &&
                                        <p className="text-gray-400 mb-3">{questline.description}</p>}

                                    {questline.location && (
                                        <div className="text-sm text-gray-400 mb-1">
                                            <span
                                                className="font-medium text-gray-300">Location:</span> {questline.location}
                                        </div>
                                    )}

                                    {(questline.requiredLevel || questline.recommendedLevel) && (
                                        <div className="text-sm text-gray-400 mb-3">
                                            {questline.requiredLevel && (
                                                <span className="mr-3">
                          <span className="font-medium text-gray-300">Required Level:</span> {questline.requiredLevel}
                        </span>
                                            )}
                                            {questline.recommendedLevel && (
                                                <span>
                          <span className="font-medium text-gray-300">Recommended Level:</span>{" "}
                                                    {questline.recommendedLevel}
                        </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-3">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Quests:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {questline.quests.map((quest) => (
                                                <button
                                                    key={quest.QuestName}
                                                    onClick={() => onQuestSelectAction(quest.QuestName)}
                                                    className="flex items-center text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
                                                >
                                                    <div
                                                        className={`w-3 h-3 rounded-full mr-2 ${getQuestStatusColor(quest.SolveStatus)}`}/>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium">
                                                            {quest.Secret && quest.SolveStatus === "Pending"
                                                                ? "???"
                                                                : quest.QuestName.replace("*", "")}
                                                            {quest.autoSolve &&
                                                                <span className="text-purple-400 ml-1">*</span>}
                                                        </div>
                                                        {quest.category && <div
                                                            className="text-xs text-gray-400">{quest.category}</div>}
                                                    </div>
                                                    {quest.difficulty && (
                                                        <div className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-700">
                                                            {Array(quest.difficulty).fill("★").join("")}
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
