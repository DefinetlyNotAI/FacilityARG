"use client"

import {BarChart2, Percent, PieChart} from "lucide-react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import type {Questline} from "@/lib/types"

interface QuestStatisticsProps {
    questlines: Questline[]
}

export default function QuestStatistics({questlines}: QuestStatisticsProps) {
    // Calculate overall statistics
    const totalQuests = questlines.reduce((acc, questline) => acc + questline.quests.length, 0)
    const solvedQuests = questlines.reduce(
        (acc, questline) => acc + questline.quests.filter((q) => q.SolveStatus === "Solved").length,
        0,
    )
    const failedQuests = questlines.reduce(
        (acc, questline) => acc + questline.quests.filter((q) => q.SolveStatus === "Failed").length,
        0,
    )
    const pendingQuests = totalQuests - solvedQuests - failedQuests

    const completionPercentage = totalQuests > 0 ? Math.round((solvedQuests / totalQuests) * 100) : 0

    // Calculate questline with most progress
    const questlineProgress = questlines.map((questline) => {
        const total = questline.quests.length
        const solved = questline.quests.filter((q) => q.SolveStatus === "Solved").length
        const failed = questline.quests.filter((q) => q.SolveStatus === "Failed").length
        const completed = solved + failed
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
        const solvedPercent = total > 0 ? (solved / total) * 100 : 0
        const failedPercent = total > 0 ? (failed / total) * 100 : 0
        return {
            name: questline.questline_name,
            percentage,
            solved,
            failed,
            total,
            solvedPercent,
            failedPercent,
        }
    })

    const mostProgressQuestline = [...questlineProgress].sort((a, b) => b.percentage - a.percentage)[0]

    // Count secret quests
    const secretQuests = questlines.reduce((acc, questline) => acc + questline.quests.filter((q) => q.Secret).length, 0)

    // Count missable quests
    const missableQuests = questlines.reduce(
        (acc, questline) => acc + questline.quests.filter((q) => q.MissName).length,
        0,
    )

    return (
        <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-purple-400"/>
                        Quest Completion
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg">
                            <div className="text-3xl font-bold text-green-500">{solvedQuests}</div>
                            <div className="text-sm text-gray-400">Solved</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg">
                            <div className="text-3xl font-bold text-red-500">{failedQuests}</div>
                            <div className="text-sm text-gray-400">Failed</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg">
                            <div className="text-3xl font-bold text-gray-300">{pendingQuests}</div>
                            <div className="text-sm text-gray-400">Pending</div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center">
                        <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden flex">
                            <div className="bg-green-500 h-4" style={{width: `${totalQuests > 0 ? (solvedQuests / totalQuests) * 100 : 0}%`}}></div>
                            <div className="bg-red-500 h-4" style={{width: `${totalQuests > 0 ? (failedQuests / totalQuests) * 100 : 0}%`}}></div>
                        </div>
                        <div className="ml-3 text-lg font-bold text-purple-400">{completionPercentage}%</div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center">
                            <BarChart2 className="h-5 w-5 mr-2 text-purple-400"/>
                            Questline Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {questlineProgress.map((ql) => {
                                const pendingPercent = 100 - ql.solvedPercent - ql.failedPercent
                                return (
                                    <div key={ql.name}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="text-sm font-medium text-gray-300">{ql.name}</div>
                                            <div className="text-xs text-gray-400">
                                                {ql.solved + ql.failed}/{ql.total}
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden flex">
                                            <div className="bg-green-500 h-2"
                                                 style={{width: `${ql.solvedPercent}%`}}></div>
                                            <div className="bg-red-500 h-2"
                                                 style={{width: `${ql.failedPercent}%`}}></div>
                                            <div className="bg-gray-500 h-2"
                                                 style={{width: `${pendingPercent}%`}}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center">
                            <Percent className="h-5 w-5 mr-2 text-purple-400"/>
                            Quest Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-700 rounded-lg">
                                <div className="text-sm text-gray-400">Total Quests</div>
                                <div className="text-2xl font-bold text-white">{totalQuests}</div>
                            </div>
                            <div className="p-3 bg-gray-700 rounded-lg">
                                <div className="text-sm text-gray-400">Secret Quests</div>
                                <div className="text-2xl font-bold text-purple-400">{secretQuests}</div>
                            </div>
                            <div className="p-3 bg-gray-700 rounded-lg">
                                <div className="text-sm text-gray-400">Missable Quests</div>
                                <div className="text-2xl font-bold text-red-400">{missableQuests}</div>
                            </div>
                            <div className="p-3 bg-gray-700 rounded-lg">
                                <div className="text-sm text-gray-400">Questlines</div>
                                <div className="text-2xl font-bold text-blue-400">{questlines.length}</div>
                            </div>
                        </div>

                        {mostProgressQuestline && (
                            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                                <div className="text-sm text-gray-400">Most Progress</div>
                                <div className="text-lg font-medium text-white">{mostProgressQuestline.name}</div>
                                <div className="text-sm text-purple-400">
                                    {mostProgressQuestline.percentage}% Complete
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
