"use client"

import { useState, useEffect } from "react"
import QuestlineList from "./components/QuestlineList"
import QuestlineView from "./components/QuestlineView"
import QuestView from "./components/QuestView"
import type { Questline, Quest } from "./types"
import Data from "./data/sample-quests.json"
import "./App.css"

function App() {
    const [questlines, setQuestlines] = useState<Questline[]>([])
    const [selectedQuestline, setSelectedQuestline] = useState<Questline | null>(null)
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        try {
            // Process the data to ensure all quests have the required fields
            const processedData = Data.map((questline: any) => {
                return {
                    ...questline,
                    quests: questline.quests.map((quest: any, index: number) => {
                        // Set default values if not provided and ensure correct types
                        return {
                            ...quest,
                            SolveStatus:
                                quest.SolveStatus === "Solved" ? "Solved" : quest.SolveStatus === "Failed" ? "Failed" : "Pending",
                            "Secret?": Boolean(quest["Secret?"]),
                            // Auto-resolve quests with asterisk in name
                            autoResolve: quest.QuestName.includes("*"),
                            // Store the index for auto-resolve logic
                            index,
                        }
                    }),
                } as Questline
            })

            setQuestlines(processedData)
            if (processedData.length > 0) {
                setSelectedQuestline(processedData[0])
            }
            setLoading(false)
        } catch (err) {
            setError("Failed to load quest data")
            setLoading(false)
            console.error(err)
        }
    }, [])

    // Process auto-logic rules
    useEffect(() => {
        if (selectedQuestline) {
            const updatedQuests = [...selectedQuestline.quests]
            let changed = false

            // Process failIfFailed logic
            updatedQuests.forEach((quest, index) => {
                if (quest.failIfFailed && quest.SolveStatus !== "Failed") {
                    const failConditions = quest.failIfFailed.split(",").map((q) => q.trim())
                    const shouldFail = failConditions.some((failQuest) => {
                        const foundQuest = updatedQuests.find((q) => q.QuestName === failQuest)
                        return foundQuest && foundQuest.SolveStatus === "Failed"
                    })

                    // @ts-ignore
                    if (shouldFail && quest.SolveStatus !== "Failed") {
                        updatedQuests[index] = { ...quest, SolveStatus: "Failed" }
                        changed = true
                    }
                }
            })

            // Process auto-resolve logic (quests with asterisk)
            updatedQuests.forEach((quest, index) => {
                if (quest.autoResolve && index > 0) {
                    const previousQuest = updatedQuests[index - 1]
                    if (previousQuest.SolveStatus !== "Pending" && quest.SolveStatus === "Pending") {
                        updatedQuests[index] = {
                            ...quest,
                            SolveStatus: previousQuest.SolveStatus,
                        }
                        changed = true
                    }
                }
            })

            if (changed) {
                setSelectedQuestline({
                    ...selectedQuestline,
                    quests: updatedQuests,
                })
            }
        }
    }, [selectedQuestline])

    const handleQuestSelect = (quest: Quest) => {
        // Check if quest is locked
        if (isQuestLocked(quest, selectedQuestline?.quests || [])) {
            return
        }
        setSelectedQuest(quest)
    }

    const isQuestLocked = (quest: Quest, allQuests: Quest[]) => {
        if (!quest.Requirement) return false

        // Quest is locked if none of the required quests are solved or failed
        return !quest.Requirement.some((reqName) => {
            const requiredQuest = allQuests.find((q) => q.QuestName === reqName)
            return requiredQuest && (requiredQuest.SolveStatus === "Solved" || requiredQuest.SolveStatus === "Failed")
        })
    }

    const handleQuestlineSelect = (questline: Questline) => {
        setSelectedQuestline(questline)
        setSelectedQuest(null)
    }

    const handleQuestStatusChange = (questName: string, newStatus: "Solved" | "Pending" | "Failed") => {
        if (!selectedQuestline) return

        const updatedQuests = selectedQuestline.quests.map((quest) => {
            if (quest.QuestName === questName) {
                return { ...quest, SolveStatus: newStatus }
            }
            return quest
        })

        setSelectedQuestline({
            ...selectedQuestline,
            quests: updatedQuests,
        })

        // Update the selected quest if it's the one being changed
        if (selectedQuest && selectedQuest.QuestName === questName) {
            setSelectedQuest({ ...selectedQuest, SolveStatus: newStatus })
        }
    }

    const handleBackToQuestline = () => {
        setSelectedQuest(null)
    }

    if (loading) {
        return <div className="loading">Loading quest data...</div>
    }

    if (error) {
        return <div className="error">{error}</div>
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Quest Tracker</h1>
            </header>

            <div className="app-content">
                <aside className="sidebar">
                    <QuestlineList
                        questlines={questlines}
                        selectedQuestline={selectedQuestline}
                        onQuestlineSelect={handleQuestlineSelect}
                    />
                </aside>

                <main className="main-content">
                    {selectedQuest ? (
                        <QuestView
                            quest={selectedQuest}
                            allQuests={selectedQuestline?.quests || []}
                            onStatusChange={handleQuestStatusChange}
                            onBack={handleBackToQuestline}
                        />
                    ) : (
                        selectedQuestline && (
                            <QuestlineView
                                questline={selectedQuestline}
                                onQuestSelect={handleQuestSelect}
                                isQuestLocked={isQuestLocked}
                            />
                        )
                    )}
                </main>
            </div>
        </div>
    )
}

export default App
