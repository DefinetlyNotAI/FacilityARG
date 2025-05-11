"use client"

import type {QuestData} from "@/lib/types"
import {AlertCircle, CheckCircle, Circle, HelpCircle, Lock, XCircle} from "lucide-react"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"

interface QuestItemProps {
    quest: QuestData
    isSelected: boolean
    onClickAction: () => void
}

export default function QuestItem({quest, isSelected, onClickAction}: QuestItemProps) {
    const getQuestStatusIcon = () => {
        if (quest.SolveStatus === "Failed") {
            return <XCircle className="h-5 w-5 text-red-500"/>
        }

        if (quest.isLocked) {
            return <Lock className="h-5 w-5 text-gray-500"/>
        }

        switch (quest.SolveStatus) {
            case "Solved":
                return <CheckCircle className="h-5 w-5 text-green-500"/>
            case "Pending":
                if (quest.autoSolve) {
                    return <Circle className="h-5 w-5 text-purple-500"/>
                }
                return <Circle className="h-5 w-5 text-white"/>
            default:
                return <Circle className="h-5 w-5 text-white"/>
        }
    }

    const getQuestName = () => {
        // Show MissName for failed quests if available
        if (quest.SolveStatus === "Failed" && quest.MissName) {
            return quest.MissName
        }

        // Show ??? for secret quests that are pending, but show the real name if solved or failed
        if (quest.Secret && quest.SolveStatus === "Pending") {
            return "???"
        }

        // Remove * from displayed name for auto-solve quests
        return quest.QuestName.replace("*", "") + (quest.autoSolve ? " *" : "")
    }

    return (
        <li>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onClickAction()
                }}
                className={`w-full flex items-center p-2 rounded-md text-left quest-item ${isSelected ? "selected" : ""} ${
                    quest.SolveStatus === "Failed" ? "text-red-400 line-through" : quest.isLocked ? "text-gray-500" : "text-white"
                }`}
            >
                <span className="mr-2">{getQuestStatusIcon()}</span>
                <span className="flex-1">{getQuestName()}</span>

                {quest.MissName && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                <span>
                  <AlertCircle className="h-4 w-4 text-red-500 ml-2"/>
                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs text-sm">{quest.MissInfo}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {quest.isLocked && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                <span>
                  <Lock className="h-4 w-4 text-gray-500 ml-2"/>
                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="max-w-xs">
                                    <p className="text-sm font-medium">Requirements:</p>
                                    <ul className="text-xs list-disc pl-4 mt-1">
                                        {quest.Requirement?.map((req) => (
                                            <li key={req}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {quest.Secret && quest.SolveStatus === "Pending" && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                <span>
                  <HelpCircle className="h-4 w-4 text-purple-400 ml-2"/>
                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs text-sm">Secret Quest</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </button>
        </li>
    )
}
