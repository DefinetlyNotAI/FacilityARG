"use client"

import {useEffect, useState} from "react"
import QuestlineList from "@/components/questline-list"
import QuestDetail from "@/components/quest-detail"
import QuestFilter from "@/components/quest-filter"
import QuestStatistics from "@/components/quest-statistics"
import QuestDependencyGraph from "@/components/quest-dependency-graph"
import QuestTimeline from "@/components/quest-timeline"
// import { ThemeToggle } from "@/components/theme-toggle"
import {SubmissionInfo} from "@/components/submission-info"
import type {QuestData, Questline} from "@/lib/types"
import {processQuestData} from "@/lib/quest-utils"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {BarChart2, Clock, List, Network} from "lucide-react"
import {Data} from "@/app/Quests";

export default function QuestTracker() {
    const [questData, setQuestData] = useState<Questline[]>([])
    const [filteredQuestData, setFilteredQuestData] = useState<Questline[]>([])
    const [selectedQuestline, setSelectedQuestline] = useState<string | null>(null)
    const [selectedQuest, setSelectedQuest] = useState<QuestData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState({status: [] as string[], search: ""})
    const [activeRightTab, setActiveRightTab] = useState("details")

    useEffect(() => {
        // In a real app, this would fetch from an API endpoint
        const loadQuestData = async () => {
            try {
                const processedData = processQuestData(Data)
                setQuestData(processedData)
                setFilteredQuestData(processedData)

                if (processedData.length > 0) {
                    setSelectedQuestline(processedData[0].questline_name)
                }

                setIsLoading(false)
            } catch (error) {
                console.error("Failed to load quest data:", error)
                setIsLoading(false)
            }
        }

        loadQuestData().catch((error) => {
            console.error("Error loading quest data:", error);
        });
    }, [])

    // Apply filters whenever questData or filters change
    useEffect(() => {
        if (questData.length === 0) return

        let filtered = [...questData]

        // Apply status filters
        if (filters.status.length > 0) {
            filtered = filtered
                .map((questline) => ({
                    ...questline,
                    quests: questline.quests.filter((quest) => filters.status.includes(quest.SolveStatus)),
                }))
                .filter((questline) => questline.quests.length > 0)
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered
                .map((questline) => {
                    // Check if questline name matches
                    const questlineMatches = questline.questline_name.toLowerCase().includes(searchLower)

                    // Filter quests that match the search
                    const matchingQuests = questline.quests.filter(
                        (quest) =>
                            quest.QuestName.toLowerCase().includes(searchLower) ||
                            (quest.DetailsForSubmission && quest.DetailsForSubmission.toLowerCase().includes(searchLower)) ||
                            (quest.QuestDesc?.Synopsis && quest.QuestDesc.Synopsis.toLowerCase().includes(searchLower)),
                    )

                    // If questline name matches, include all quests
                    if (questlineMatches) {
                        return questline
                    }

                    // Otherwise only include matching quests
                    return {
                        ...questline,
                        quests: matchingQuests,
                    }
                })
                .filter((questline) => questline.quests.length > 0)
        }

        setFilteredQuestData(filtered)

        // If the selected questline is filtered out, select the first available one
        if (selectedQuestline && !filtered.some((q) => q.questline_name === selectedQuestline)) {
            if (filtered.length > 0) {
                setSelectedQuestline(filtered[0].questline_name)
                setSelectedQuest(null)
            }
        }

        // If the selected quest is filtered out, deselect it
        if (selectedQuest) {
            const questlineWithSelectedQuest = filtered.find((q) => q.questline_name === selectedQuestline)
            if (
                !questlineWithSelectedQuest ||
                !questlineWithSelectedQuest.quests.some((q) => q.QuestName === selectedQuest.QuestName)
            ) {
                setSelectedQuest(null)
            }
        }
    }, [questData, filters, selectedQuestline, selectedQuest])

    const handleQuestSelect = (quest: QuestData) => {
        // Find which questline this quest belongs to
        const questlineForQuest = questData.find((ql) => ql.quests.some((q) => q.QuestName === quest.QuestName))

        // If we found the questline, and it's not already selected, select it
        if (questlineForQuest && selectedQuestline !== questlineForQuest.questline_name) {
            setSelectedQuestline(questlineForQuest.questline_name)
        }

        // Then select the quest
        setSelectedQuest(quest)
        setActiveRightTab("details")
    }

    const handleQuestlineSelect = (questlineName: string) => {
        setSelectedQuestline(questlineName)
        setSelectedQuest(null)
    }

    // Updated to search across all questlines for the quest
    const handleQuestLinkClick = (questName: string) => {
        // Search for the quest across all questlines
        for (const questline of questData) {
            const quest = questline.quests.find((q) => q.QuestName === questName)
            if (quest) {
                // If found, select the questline and then the quest
                setSelectedQuestline(questline.questline_name)
                setSelectedQuest(quest)
                setActiveRightTab("details")
                return
            }
        }
    }

    // Get all quests from all questlines for link processing
    const getAllQuests = (): QuestData[] => {
        return questData.flatMap((questline) => questline.quests)
    }

    // Handle filter changes
    const handleFilterChange = (newFilters: { status: string[]; search: string }) => {
        setFilters(newFilters)
    }

    if (isLoading) {
        return (
            <div
                className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 p-4 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Quest Tracker</h1>
                    <div className="flex items-center space-x-2">
                        {/* <ThemeToggle /> */}
                        <SubmissionInfo/>
                    </div>
                </div>

                <div className="mb-4">
                    <QuestFilter onFilterChangeAction={handleFilterChange}/>
                </div>

                {filteredQuestData.length > 0 ? (
                    <QuestlineList
                        questlines={filteredQuestData}
                        selectedQuestline={selectedQuestline}
                        onQuestlineSelectAction={handleQuestlineSelect}
                        onQuestSelectAction={handleQuestSelect}
                        selectedQuest={selectedQuest}
                    />
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p>No quests match your filters</p>
                    </div>
                )}
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4 p-4 overflow-y-auto h-full custom-scrollbar">
                <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-300 dark:bg-gray-700 mb-4">
                        <TabsTrigger value="details" className="flex items-center">
                            <List className="h-4 w-4 mr-2"/>
                            Quest Details
                        </TabsTrigger>
                        <TabsTrigger value="dependencies" className="flex items-center">
                            <Network className="h-4 w-4 mr-2"/>
                            Dependencies
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex items-center">
                            <Clock className="h-4 w-4 mr-2"/>
                            Timeline
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="flex items-center">
                            <BarChart2 className="h-4 w-4 mr-2"/>
                            Statistics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        {selectedQuest ? (
                            <QuestDetail quest={selectedQuest} onQuestLinkClickAction={handleQuestLinkClick}
                                         allQuests={getAllQuests()}/>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <h2 className="text-xl mb-2">Select a quest to view details</h2>
                                    <p>Click on any quest from the sidebar to see its information</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="dependencies">
                        <QuestDependencyGraph
                            questlines={questData}
                            selectedQuestline={selectedQuestline}
                            onQuestSelectAction={handleQuestLinkClick}
                        />
                    </TabsContent>

                    <TabsContent value="timeline">
                        <QuestTimeline questlines={questData} onQuestSelectAction={handleQuestLinkClick}/>
                    </TabsContent>

                    <TabsContent value="stats">
                        <QuestStatistics questlines={questData}/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
