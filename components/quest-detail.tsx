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
    // Function to get the status badge
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

    // Function to get the category badge
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

    // Function to get the MustRequirement badge
    const getMustRequirementBadge = () => {
        if (!quest.MustRequirement) return null
        return <Badge className="bg-red-700 text-white">Must Requirement</Badge>
    }

    // Function to process text and replace quest names with links, and format markdown basics
    const processText = (text: string) => {
        if (!text) return text;

        const regex = /\{\{\s*([^}]+)\s*}}/g;
        return text.split(regex).map((part, index) => {
            if (index % 2 === 0) {
                const segments: React.ReactNode[] = [];
                const lines = part.split('\n');

                lines.forEach((line, lineIndex) => {
                    // Updated to support: **bold**, *italic*, __underline__, ~~strikethrough~~
                    const markdownRegex =
                        /(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|~~[^~]+~~)/g;
                    const pieces = line.split(markdownRegex);

                    pieces.forEach((piece, pieceIndex) => {
                        const key = `${index}-${lineIndex}-${pieceIndex}`;

                        if (piece.startsWith('**') && piece.endsWith('**')) {
                            segments.push(
                                <strong key={key} className="font-bold">
                                    {piece.slice(2, -2)}
                                </strong>
                            );
                        } else if (piece.startsWith('*') && piece.endsWith('*')) {
                            segments.push(
                                <em key={key} className="italic">
                                    {piece.slice(1, -1)}
                                </em>
                            );
                        } else if (piece.startsWith('__') && piece.endsWith('__')) {
                            segments.push(
                                <span key={key} className="underline">
                                {piece.slice(2, -2)}
                            </span>
                            );
                        } else if (piece.startsWith('~~') && piece.endsWith('~~')) {
                            segments.push(
                                <span key={key} className="line-through">
                                {piece.slice(2, -2)}
                            </span>
                            );
                        } else {
                            segments.push(<span key={key}>{piece}</span>);
                        }
                    });

                    if (lineIndex < lines.length - 1) {
                        segments.push(<br key={`${index}-br-${lineIndex}`} />);
                    }
                });

                return <React.Fragment key={index}>{segments}</React.Fragment>;
            } else {
                const questName = part.trim();
                const linkedQuest = allQuests.find((q) => q.QuestName === questName);
                const isSecretAndPending =
                    linkedQuest && linkedQuest.Secret && linkedQuest.SolveStatus === 'Pending';
                const displayName = isSecretAndPending ? '???' : questName;

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
        });
    };

    // Function to render the fail condition with quest links
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

    // Check if this quest failed due to a MustRequirement
    const getFailedMustRequirement = (): string | null => {
        if (!quest.Requirement || quest.SolveStatus !== "Failed") return null;
        
        for (const reqName of quest.Requirement) {
            const reqQuest = allQuests.find(q => q.QuestName === reqName);
            if (reqQuest && reqQuest.MustRequirement && reqQuest.SolveStatus === "Failed") {
                return reqName;
            }
        }
        return null;
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
        // Control the rendering of quest content based on its status
        // Priority: Failed > Locked[Dynamic > Manual] > Solved > Pending > Default

        // If the quest is failed, show failure UI
        if (quest.SolveStatus === "Failed") {
            const failedMustReq = getFailedMustRequirement();
            
            return (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-red-500">
                        <XCircle className="h-5 w-5"/>
                        <h3 className="text-lg font-medium">Quest Failed</h3>
                    </div>

                    {failedMustReq ? (
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Must Requirement Failure</h3>
                            <p className="text-gray-400">
                                This quest failed because the must requirement{" "}
                                <button
                                    onClick={() => onQuestLinkClickAction(failedMustReq)}
                                    className="text-purple-400 hover:underline font-medium"
                                >
                                    {failedMustReq}
                                </button>
                                {" "}failed. Must requirements create cascading failures when they fail.
                            </p>
                        </div>
                    ) : quest.MissInfo && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Failure Reason</h3>
                            <p className="text-gray-400">{processText(quest.MissInfo)}</p>
                        </div>
                    )}
                </div>
            );
        }

        // If the quest is locked, show lock UI | Both manual and dynamic locks logic
        else if (quest.isLocked) {
            // Check if any requirements are unmet
            const unmetRequirements = quest.Requirement?.some(req => {
                const requiredQuest = allQuests.find(q => q.QuestName === req);
                return !requiredQuest || requiredQuest.SolveStatus !== "Solved";
            });

            // Always show secret hint and submission details if they exist
            const submissionDetails = (
                <>
                    {quest.Secret && quest.SecretHint && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-purple-400 mb-2">Secret Quest</h3>
                            <p className="text-gray-400">{processText(quest.SecretHint)}</p>
                        </div>
                    )}
                    {quest.DetailsForSubmission && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Submission Details</h3>
                            <p className="text-gray-400">{processText(quest.DetailsForSubmission)}</p>
                        </div>
                    )}
                </>
            );

            if (unmetRequirements) {
                // Show dynamic lock UI (requirements not met)
                return (
                    <div className="text-center p-6">
                        <Lock className="h-12 w-12 text-gray-500 mx-auto mb-4"/>
                        <h3 className="text-xl font-medium text-gray-400 mb-2">Quest Locked</h3>
                        <p className="text-gray-500 mb-4">Complete the following quests to unlock:</p>
                        <ul className="text-gray-400 space-y-1">
                            {quest.Requirement?.map((req) => {
                                const requiredQuest = allQuests.find((q) => q.QuestName === req);
                                const isSecretAndPending =
                                    requiredQuest && requiredQuest.Secret && requiredQuest.SolveStatus === "Pending";
                                const displayName = isSecretAndPending ? "???" : req;
                                const isMustReq = requiredQuest?.MustRequirement;

                                return (
                                    <li key={req} className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onQuestLinkClickAction(req)}
                                            className="text-purple-400 hover:underline"
                                        >
                                            {displayName}
                                        </button>
                                        {isMustReq && (
                                            <Badge className="bg-red-700 text-white text-xs">Must</Badge>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                        {submissionDetails}
                    </div>
                );
            } else if (quest.manualLock) {
                // All requirements are met, but manually locked
                return (
                    <div className="text-center p-6">
                        <Lock className="h-12 w-12 text-gray-500 mx-auto mb-4"/>
                        <h3 className="text-xl font-medium text-gray-400 mb-2">This quest has been manually locked</h3>
                        <p className="text-gray-500 mb-4">All requirements are done — the quest will unlock manually later.</p>
                        {submissionDetails}
                    </div>
                );
            }
        }

        // If the quest is solved, show synopsis, trivia, relations, and credit
        else if (quest.SolveStatus === "Solved") {
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
            );
        }

        // If the quest is secret and pending, show secret hint and submission details
        else if (quest.Secret && quest.SolveStatus === "Pending") {
            return (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-purple-400 mb-2">Secret Quest</h3>
                        <p className="text-gray-400">{processText(quest.SecretHint || "")}</p>
                    </div>

                    {quest.DetailsForSubmission && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Submission Details</h3>
                            <p className="text-gray-400">{processText(quest.DetailsForSubmission)}</p>
                        </div>
                    )}
                </div>
            );
        }

        // Default: show submission details
        return (
            <div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Submission Details</h3>
                <p className="text-gray-400">{processText(quest.DetailsForSubmission || "")}</p>
            </div>
        );
    };

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
                        {getMustRequirementBadge()}
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

                {quest.MustRequirement && (
                    <CardDescription className="flex items-center text-red-400">
                        <AlertCircle className="h-4 w-4 mr-1"/>
                        Must Requirement - Failure cascades to dependent quests
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
                                        const isMustReq = requiredQuest?.MustRequirement
                                        
                                        return (
                                            <div key={req} className="flex items-center gap-1">
                                                <Badge
                                                    variant="outline"
                                                    className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 ${
                                                        isMustReq ? 'border-red-500 dark:border-red-400' : ''
                                                    }`}
                                                    onClick={() => onQuestLinkClickAction(req)}
                                                >
                                                    {displayName}
                                                    {isMustReq && <span className="ml-1 text-red-500">*</span>}
                                                </Badge>
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    * Must Requirements - If these fail, this quest automatically fails
                                </p>
                            </div>
                        )}

                        {quest.MissInfo && quest.SolveStatus !== "Solved" && (
                            <div>
                                <h3 className="text-sm font-medium text-red-400 mb-1">Failure Condition</h3>
                                <p className="text-sm text-gray-400">{processText(quest.MissInfo)}</p>
                            </div>
                        )}

                        {(quest.failIfFailed || quest.failIfPending) && quest.SolveStatus !== "Solved" && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-red-400 mb-1">Auto-Fail Condition</h3>
                                <div className="text-sm text-gray-400 flex flex-col gap-1">
                                    {quest.failIfFailed && (
                                        <div className="flex items-start gap-1">
                                            <span className="text-red-400 whitespace-nowrap">On Failure of:</span>
                                            <div className="flex flex-wrap">{renderFailCondition(quest.failIfFailed)}</div>
                                        </div>
                                    )}
                                    {quest.failIfPending && (
                                        <div className="flex items-start gap-1">
                                            <span className="text-yellow-300 whitespace-nowrap">On Pending of:</span>
                                            <div className="flex flex-wrap">{renderFailCondition(quest.failIfPending)}</div>
                                        </div>
                                    )}
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