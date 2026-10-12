"use client"

import {useEffect, useState} from "react"
import QuestlineList from "@/components/questline-list"
import QuestDetail from "@/components/quest-detail"
import QuestFilter from "@/components/quest-filter"
import QuestStatistics from "@/components/quest-statistics"
import QuestDepGraph from "@/components/quest-dep-graph"
import QuestTimeline from "@/components/quest-timeline"
import {SubmissionInfo} from "@/components/submission-info"
import type {QuestData, Questline} from "@/lib/types"
import {processQuestData} from "@/lib/quest-utils"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {BarChart2, Clock, List, Network, Menu, X} from "lucide-react"
import {Data} from "@/components/quests/all_quests";
import {Button} from "@/components/ui/button"

const processedData = processQuestData(Data)

export default function QuestTracker() {
    const [questData, setQuestData] = useState<Questline[]>([])
    const [filteredQuestData, setFilteredQuestData] = useState<Questline[]>([])
    const [selectedQuestline, setSelectedQuestline] = useState<string | null>(null)
    const [selectedQuest, setSelectedQuest] = useState<QuestData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState({status: [] as string[], search: ""})
    const [activeRightTab, setActiveRightTab] = useState("details")
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        const loadQuestData = async () => {
            try {
                // console.log(processedData)
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
        
        // Close sidebar on mobile when quest is selected
        setIsSidebarOpen(false)
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
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">Quest Tracker</h1>
                <div className="flex items-center space-x-2">
                    <SubmissionInfo/>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2"
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Mobile Overlay / Desktop Fixed */}
                <div className={`
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 
                    fixed md:relative 
                    inset-y-0 left-0 
                    z-50 md:z-auto
                    w-80 md:w-1/3 lg:w-1/4 
                    bg-white dark:bg-gray-800 
                    transition-transform duration-300 ease-in-out
                    md:transition-none
                    border-r border-gray-200 dark:border-gray-700
                    flex flex-col
                `}>
                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Quest Tracker</h1>
                        <SubmissionInfo/>
                    </div>

                    {/* Filter Section */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <QuestFilter onFilterChangeAction={handleFilterChange}/>
                    </div>

                    {/* Quest List */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
                </div>

                {/* Mobile Overlay Background */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                        <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-300 dark:bg-gray-700 h-auto min-h-[60px] md:min-h-[40px]">
                                <TabsTrigger value="details" className="flex items-center text-xs md:text-sm p-3 md:p-2">
                                    <List className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2"/>
                                    <span className="hidden sm:inline">Quest </span>Details
                                </TabsTrigger>
                                <TabsTrigger value="dependencies" className="flex items-center text-xs md:text-sm p-3 md:p-2">
                                    <Network className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2"/>
                                    <span className="hidden sm:inline">Dependencies</span>
                                    <span className="sm:hidden">Deps</span>
                                </TabsTrigger>
                                <TabsTrigger value="timeline" className="flex items-center text-xs md:text-sm p-3 md:p-2">
                                    <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2"/>
                                    Timeline
                                </TabsTrigger>
                                <TabsTrigger value="stats" className="flex items-center text-xs md:text-sm p-3 md:p-2">
                                    <BarChart2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2"/>
                                    <span className="hidden sm:inline">Statistics</span>
                                    <span className="sm:hidden">Stats</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                        <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="w-full">
                            <TabsContent value="details" className="mt-0">
                                {selectedQuest ? (
                                    <QuestDetail 
                                        quest={selectedQuest} 
                                        onQuestLinkClickAction={handleQuestLinkClick}
                                        allQuests={getAllQuests()}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center text-gray-500 p-4">
                                            <h2 className="text-lg md:text-xl mb-2">Select a quest to view details</h2>
                                            <p className="text-sm md:text-base">
                                                {isSidebarOpen ? 
                                                    "Click on any quest from the sidebar to see its information" :
                                                    "Use the menu button to open the quest list"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="dependencies" className="mt-0">
                                <QuestDepGraph
                                    questlines={questData}
                                    selectedQuestline={selectedQuestline}
                                    onQuestSelectAction={handleQuestLinkClick}
                                />
                            </TabsContent>

                            <TabsContent value="timeline" className="mt-0">
                                <QuestTimeline questlines={questData} onQuestSelectAction={handleQuestLinkClick}/>
                            </TabsContent>

                            <TabsContent value="stats" className="mt-0">
                                <QuestStatistics questlines={questData}/>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}