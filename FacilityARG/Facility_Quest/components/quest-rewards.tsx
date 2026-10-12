"use client"

import type {QuestData} from "@/lib/types"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Award, BookOpen, Coins, Package, Sparkles, Users} from "lucide-react"

interface QuestRewardsProps {
    quest: QuestData
}

export default function QuestRewards({quest}: QuestRewardsProps) {
    if (!quest.rewards || quest.rewards.length === 0) {
        return null
    }

    const getRewardIcon = (type: string, isFailed: boolean) => {
        if (isFailed) {
            return <span className="font-bold mr-2">❌</span>;
        }
        switch (type) {
            case "Item":
                return <Package className="h-4 w-4 mr-2"/>;
            case "Experience":
                return <BookOpen className="h-4 w-4 mr-2"/>;
            case "Currency":
                return <Coins className="h-4 w-4 mr-2"/>;
            case "Reputation":
                return <Users className="h-4 w-4 mr-2"/>;
            case "Skill":
                return <Sparkles className="h-4 w-4 mr-2"/>;
            case "Achievement":
                return <Award className="h-4 w-4 mr-2"/>;
            default:
                return <Package className="h-4 w-4 mr-2"/>;
        }
    };
    const getRewardColor = (type: string) => {
        switch (type) {
            case "Item":
                return "bg-blue-600"
            case "Experience":
                return "bg-green-600"
            case "Currency":
                return "bg-yellow-600"
            case "Reputation":
                return "bg-purple-600"
            case "Skill":
                return "bg-pink-600"
            case "Achievement":
                return "bg-orange-600"
            default:
                return "bg-gray-600"
        }
    }

    return (
        <Card className="bg-gray-800 border-gray-700 text-white mt-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-500"/>
                    Quest Rewards
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quest.rewards.map((reward, index) => {
                        const isFailed = quest.SolveStatus === "Failed";
                        return (
                            <div
                                key={index}
                                className={`bg-gray-700 rounded-lg p-3 ${isFailed ? "opacity-50" : ""}`}
                            >
                                <div className="flex items-center mb-2">
                                    {getRewardIcon(reward.type, isFailed)}
                                    <span
                                        className={`font-medium ${isFailed ? "line-through text-red-600" : ""}`}
                                    >
          {reward.name}
        </span>
                                    <Badge
                                        className={`ml-auto ${
                                            isFailed ? "bg-red-600" : getRewardColor(reward.type)
                                        }`}
                                    >
                                        {reward.type}
                                    </Badge>
                                </div>
                                {reward.amount && !isFailed && (
                                    <div className="text-sm text-gray-300 mb-1">Amount: {reward.amount}</div>
                                )}
                                {reward.description && !isFailed && (
                                    <div className="text-sm text-gray-400">
                                        {quest.SolveStatus === "Pending"
                                            ? {
                                            Item: "Complete the quest to discover this item.",
                                            Experience: "Complete the quest to gain this experience.",
                                            Currency: "Complete the quest to earn this currency.",
                                            Reputation: "Complete the quest to build this reputation.",
                                            Skill: "Complete the quest to unlock this skill.",
                                            Achievement: "Complete the quest to achieve this milestone.",
                                        }[reward.type] || "Complete the quest to know more about this."
                                            : reward.description}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
