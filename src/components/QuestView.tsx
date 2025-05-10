"use client"

import type {Quest} from "../types"
import QuestLink from "./QuestLink"
import {ArrowLeft} from "lucide-react"

interface QuestViewProps {
    quest: Quest
    allQuests: Quest[]
    onStatusChange: (questName: string, newStatus: "Solved" | "Pending" | "Failed") => void
    onBack: () => void
}

const QuestView = ({quest, allQuests, onStatusChange, onBack}: QuestViewProps) => {
    const isSecret = quest["Secret?"] && quest.SolveStatus !== "Solved"

    const handleStatusChange = (newStatus: "Solved" | "Pending" | "Failed") => {
        onStatusChange(quest.QuestName, newStatus)
    }

    return (
        <div className="quest-view">
            <button className="back-button" onClick={onBack}>
                <ArrowLeft size={16}/>
                <span>Back to Questline</span>
            </button>

            <div className="quest-header">
                <h2>{isSecret ? "???" : quest.QuestName.replace("*", "")}</h2>
                <div className="quest-status-controls">
                    <button
                        className={`status-button pending ${quest.SolveStatus === "Pending" ? "active" : ""}`}
                        onClick={() => handleStatusChange("Pending")}
                    >
                        Pending
                    </button>
                    <button
                        className={`status-button solved ${quest.SolveStatus === "Solved" ? "active" : ""}`}
                        onClick={() => handleStatusChange("Solved")}
                    >
                        Solved
                    </button>
                    <button
                        className={`status-button failed ${quest.SolveStatus === "Failed" ? "active" : ""}`}
                        onClick={() => handleStatusChange("Failed")}
                    >
                        Failed
                    </button>
                </div>
            </div>

            <div className="quest-content">
                {quest.SolveStatus === "Solved" && quest.QuestDesc ? (
                    <div className="quest-description">
                        <h3>Synopsis</h3>
                        <p>{quest.QuestDesc.Synopsis}</p>

                        {quest.QuestDesc.Trivia && (
                            <>
                                <h3>Trivia</h3>
                                <p>
                                    <QuestLink text={quest.QuestDesc.Trivia} allQuests={allQuests}/>
                                </p>
                            </>
                        )}

                        {quest.QuestDesc.Relations && (
                            <>
                                <h3>Related Quests</h3>
                                <p>
                                    <QuestLink text={quest.QuestDesc.Relations} allQuests={allQuests}/>
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="quest-submission">
                        {isSecret ? (
                            <div className="secret-hint">
                                <h3>Secret Quest</h3>
                                <p>{quest.SecretHint}</p>
                            </div>
                        ) : (
                            <>
                                <h3>Details for Submission</h3>
                                <p>
                                    <QuestLink text={quest.DetailsForSubmission || "No details provided."}
                                               allQuests={allQuests}/>
                                </p>
                            </>
                        )}
                    </div>
                )}

                {quest.Requirement && quest.Requirement.length > 0 && (
                    <div className="quest-requirements">
                        <h3>Requirements</h3>
                        <ul>
                            {quest.Requirement.map((reqName) => (
                                <li key={reqName}>
                                    <QuestLink text={`{{ ${reqName} }}`} allQuests={allQuests}/>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {quest.failIfFailed && (
                    <div className="quest-fail-conditions">
                        <h3>Fails If Failed</h3>
                        <ul>
                            {quest.failIfFailed.split(",").map((failQuest) => (
                                <li key={failQuest.trim()}>
                                    <QuestLink text={`{{ ${failQuest.trim()} }}`} allQuests={allQuests}/>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {quest.MissName && quest.MissInfo && (
                    <div className="quest-miss-info">
                        <h3>Miss Information</h3>
                        <p>
                            <strong>{quest.MissName}</strong>: <QuestLink text={quest.MissInfo} allQuests={allQuests}/>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default QuestView
