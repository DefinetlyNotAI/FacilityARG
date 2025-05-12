"use client"

import type {QuestData} from "@/lib/types"
import {AlertCircle, Award, BarChart2, CheckCircle, Circle, Clock, Lock, XCircle} from "lucide-react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import QuestRewards from "./quest-rewards"
import React from "react"

interface QuestDetailProps {
    quest: QuestData
    onQuestLinkClickAction: (questName: string) => void
    allQuests?: QuestData[]
}

export default function QuestDetail({quest, onQuestLinkClickAction, allQuests = []}: QuestDetailProps) {
    const getStatusBadge = () => {
        switch (quest.SolveStatus) {
            case "Solved":
                return <Badge className="bg-green-600">Solved</Badge>
            case "Failed":
                return <Badge className="bg-red-600">Failed</Badge>
            case "Pending":
                return <Badge className="bg-gray-600">Pending</Badge>
            default:
                return <Badge className="bg-gray-600">Pending</Badge>
        }
    }

    const getCategoryBadge = () => {
        if (!quest.category) return null

        const categoryColors: Record<string, string> = {
            Main: "bg-blue-600",
            Side: "bg-green-600",
            Hidden: "bg-purple-600",
            Special: "bg-yellow-600",
            Daily: "bg-orange-600",
            Weekly: "bg-pink-600",
        }

        return <Badge className={categoryColors[quest.category] || "bg-gray-600"}>{quest.category}</Badge>
    }

    // Updated to show real name for failed secret quests
    const processText = (text: string) => {
        if (!text) return text

        // Replace {{ QuestName }} with clickable links
        const regex = /\{\{\s*([^}]+)\s*}}/g
        return text.split(regex).map((part, index) => {
            // Even indices are regular text, odd indices are quest names
            if (index % 2 === 0) {
                return part
            } else {
                const questName = part.trim()
                const linkedQuest = allQuests.find((q) => q.QuestName === questName)

                // Only show ??? for secret quests that are pending
                const isSecretAndPending = linkedQuest && linkedQuest.Secret && linkedQuest.SolveStatus === "Pending"

                // Display ??? for secret pending quests, otherwise show the quest name
                const displayName = isSecretAndPending ? "???" : questName

                return (
                    <button
                        key={index}
                        onClick={() => onQuestLinkClickAction(questName)}
                        className="text-purple-400 hover:underline font-medium"
                    >
                        {displayName}
                    </button>
                )
            }
        })
    }

    const renderFailCondition = (condition: string) => {
        const parts = condition
            .replace(/\s+/g, ' ')  // Remove extra spaces
            .split(/(\{\{\s*[^}]+\s*}}|\s*AND\s*|\s*OR\s*|\s*XOR\s*|\s*\(\s*|\s*\)\s*)/g)  // Split by quest or operator
            .filter(Boolean);  // Remove empty parts

        const renderPart = (part: string, index: number) => {
            const questMatch = part.match(/\{\{\s*([^}]+)\s*}}/);

            if (questMatch) {
                const questName = questMatch[1].trim();
                const linkedQuest = allQuests.find((q) => q.QuestName === questName);
                const isSecretAndPending = linkedQuest?.Secret && linkedQuest.SolveStatus === "Pending";
                const displayName = isSecretAndPending ? "???" : questName;

                return (
                    <button
                        key={index}
                        onClick={() => onQuestLinkClickAction(questName)}
                        className="text-purple-400 hover:underline font-medium"
                    >
                        {displayName}
                    </button>
                );
            }

            if (["AND", "OR", "XOR", "NAND", "NOR"].includes(part.trim())) {
                return (
                    <span
                        key={index}
                        className="px-1 py-0.5 mx-1 text-gray-300 font-mono"
                    >
                    {part}
                </span>
                );
            }

            if (part.trim() === '(' || part.trim() === ')') {
                return (
                    <span
                        key={index}
                        className="px-1 py-0.5 mx-1 text-gray-300 font-mono"
                    >
                    {part}
                </span>
                );
            }

            return null;
        };

        return (
            <div className="fail-condition">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && ' '} {/* Add space between parts */}
                        {renderPart(part, index)}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // Render quest credit information (only shown for solved quests)
    const renderQuestCredit = () => {
        if (quest.SolveStatus !== "Solved") return null

        return (
            <div className="quest-credit">
                <div className="flex items-center mb-2">
                    <Award className="h-4 w-4 mr-2 text-yellow-500"/>
                    <h3 className="quest-credit-title">Quest Credit</h3>
                </div>
                <div className="quest-credit-info">
                    <p>
                        <span className="font-medium">Solved by:</span> {quest.QuestCredit.name}
                    </p>
                    <p>
                        <span className="font-medium">Date:</span> {quest.QuestCredit.date}
                    </p>
                </div>
            </div>
        )
    }

    // Made the renderQuestContent function to prioritize failed status over locked status
    const renderQuestContent = () => {
        if (quest.SolveStatus === "Failed") {
            return (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-red-500">
                        <XCircle className="h-5 w-5"/>
                        <h3 className="text-lg font-medium">Quest Failed</h3>
                    </div>

                    {quest.MissInfo && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Failure Reason</h3>
                            <p className="text-gray-400">{processText(quest.MissInfo)}</p>
                        </div>
                    )}
                </div>
            )
        }

        if (quest.isLocked) {
            return (
                <div className="text-center p-6">
                    <Lock className="h-12 w-12 text-gray-500 mx-auto mb-4"/>
                    <h3 className="text-xl font-medium text-gray-400 mb-2">Quest Locked</h3>
                    <p className="text-gray-500 mb-4">Complete the following quests to unlock:</p>
                    <ul className="text-gray-400 space-y-1">
                        {quest.Requirement?.map((req) => {
                            const requiredQuest = allQuests.find((q) => q.QuestName === req)
                            const isSecretAndPending =
                                requiredQuest && requiredQuest.Secret && requiredQuest.SolveStatus === "Pending"
                            const displayName = isSecretAndPending ? "???" : req

                            return (
                                <li key={req}>
                                    <button onClick={() => onQuestLinkClickAction(req)}
                                            className="text-purple-400 hover:underline">
                                        {displayName}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )
        }

        if (quest.SolveStatus === "Solved") {
            return (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">Synopsis</h3>
                        <p className="text-gray-400">{processText(quest.QuestDesc?.Synopsis || "")}</p>
                    </div>

                    {quest.QuestDesc?.Trivia && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Trivia</h3>
                            <p className="text-gray-400 italic">{processText(quest.QuestDesc.Trivia)}</p>
                        </div>
                    )}

                    {quest.QuestDesc?.Relations && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Related Quests</h3>
                            <p className="text-gray-400">{processText(quest.QuestDesc.Relations)}</p>
                        </div>
                    )}

                    {renderQuestCredit()}
                </div>
            )
        }

        // Pending status
        if (quest.Secret && quest.SolveStatus === "Pending") {
            return (
                <div>
                    <h3 className="text-lg font-medium text-purple-400 mb-2">Secret Quest</h3>
                    <p className="text-gray-400">{processText(quest.SecretHint || "")}</p>
                </div>
            )
        }

        return (
            <div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Quest Details</h3>
                <p className="text-gray-400">{processText(quest.DetailsForSubmission || "")}</p>
            </div>
        )
    }

    return (
        <Card className="bg-white border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {quest.SolveStatus === "Solved" && <CheckCircle className="h-5 w-5 text-green-500"/>}
                        {quest.SolveStatus === "Failed" && <XCircle className="h-5 w-5 text-red-500"/>}
                        {quest.SolveStatus === "Pending" && quest.autoSolve &&
                            <Circle className="h-5 w-5 text-purple-500"/>}
                        {quest.SolveStatus === "Pending" && !quest.autoSolve && (
                            <Circle className="h-5 w-5 dark:text-white light:text-gray-900"/>
                        )}
                        {quest.isLocked && quest.SolveStatus !== "Failed" && <Lock className="h-5 w-5 text-gray-500"/>}
                    </div>
                    <div className="flex space-x-2">
                        {getCategoryBadge()}
                        {getStatusBadge()}
                    </div>
                </div>
                <CardTitle className={`text-2xl ${quest.SolveStatus === "Failed" ? "line-through text-red-400" : ""}`}>
                    {quest.SolveStatus === "Failed" && quest.MissName
                        ? quest.MissName
                        : quest.Secret && quest.SolveStatus === "Pending"
                            ? "???"
                            : quest.QuestName.replace("*", "")}
                    {quest.autoSolve && <span className="text-purple-400 ml-1">*</span>}
                </CardTitle>

                {quest.MissName && quest.SolveStatus !== "Failed" && (
                    <CardDescription className="flex items-center text-red-400">
                        <AlertCircle className="h-4 w-4 mr-1"/>
                        Missable Quest
                    </CardDescription>
                )}

                {/* Quest metadata */}
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                    {quest.difficulty && (
                        <div className="flex items-center">
                            <BarChart2 className="h-4 w-4 mr-1 text-yellow-500"/>
                            <span>Difficulty: </span>
                            <span className="ml-1 text-yellow-500">{Array(quest.difficulty).fill("★").join("")}</span>
                        </div>
                    )}

                    {quest.timeEstimate && (
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-blue-400"/>
                            <span>Estimated Time: {quest.timeEstimate} min</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <Separator className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200"/>

            <CardContent className="pt-6">{renderQuestContent()}</CardContent>

            {/* Quest rewards */}
            {quest.rewards && quest.rewards.length > 0 && <QuestRewards quest={quest}/>}

            {((quest.Requirement?.length ?? 0) > 0 || quest.MissInfo || quest.failIfFailed) && (
                <>
                    <Separator className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200"/>
                    <CardFooter className="flex flex-col items-start pt-6">
                        {(quest.Requirement?.length ?? 0) > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-300 mb-1">Requirements</h3>
                                <div className="flex flex-wrap gap-2">
                                    {quest.Requirement?.map((req) => {
                                        const requiredQuest = allQuests.find((q) => q.QuestName === req)
                                        const isSecretAndPending =
                                            requiredQuest && requiredQuest.Secret && requiredQuest.SolveStatus === "Pending"
                                        const displayName = isSecretAndPending ? "???" : req
                                        return (
                                            <Badge
                                                key={req}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                                onClick={() => onQuestLinkClickAction(req)}
                                            >
                                                {displayName}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {quest.MissInfo && quest.SolveStatus !== "Solved" && (
                            <div>
                                <h3 className="text-sm font-medium text-red-400 mb-1">Failure Condition</h3>
                                <p className="text-sm text-gray-400">{processText(quest.MissInfo)}</p>
                            </div>
                        )}

                        {quest.failIfFailed && quest.SolveStatus !== "Solved" && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-red-400 mb-1">Auto-Fail Condition</h3>
                                <div className="text-sm text-gray-400 flex flex-wrap items-center">
                                    {renderFailCondition(quest.failIfFailed)}
                                </div>
                            </div>
                        )}

                        {quest.relatedQuestlines && quest.relatedQuestlines.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-300 mb-1">Related Questlines</h3>
                                <div className="flex flex-wrap gap-2">
                                    {quest.relatedQuestlines.map((questlineName) => (
                                        <Badge key={questlineName} className="bg-purple-600">
                                            {questlineName}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardFooter>
                </>
            )}
        </Card>
    )
}
