"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { processQuestData, getQuestDebugInfo } from "@/lib/quest-utils"
import { Data } from "@/components/quests/all_quests"
import type { QuestData, Questline } from "@/lib/types"

interface NodeData {
    id: string
    x: number
    y: number
    quest: QuestData
    debugInfo: any
}

interface EdgeData {
    from: string
    to: string
    type: 'requirement' | 'failIfFailed' | 'failIfPending'
}

export default function DebugPage() {
    const [questData, setQuestData] = useState<Questline[]>([])
    const [allQuests, setAllQuests] = useState<QuestData[]>([])
    const [selectedQuest, setSelectedQuest] = useState<QuestData | null>(null)
    const [debugInfo, setDebugInfo] = useState<any>(null)
    const [nodes, setNodes] = useState<NodeData[]>([])
    const [edges, setEdges] = useState<EdgeData[]>([])
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const processedData = processQuestData(Data)
        setQuestData(processedData)
        
        const flatQuests = processedData.flatMap(ql => ql.quests)
        setAllQuests(flatQuests)
        
        // Generate nodes and edges for visualization
        generateNodesAndEdges(flatQuests)
    }, [])

    const generateNodesAndEdges = (quests: QuestData[]) => {
        const nodeMap = new Map<string, NodeData>()
        const edgeList: EdgeData[] = []
        
        // Create nodes in a circular layout
        const centerX = 400
        const centerY = 300
        const radius = 250
        
        quests.forEach((quest, index) => {
            const angle = (index / quests.length) * 2 * Math.PI
            const x = centerX + Math.cos(angle) * radius
            const y = centerY + Math.sin(angle) * radius
            
            nodeMap.set(quest.QuestName, {
                id: quest.QuestName,
                x,
                y,
                quest,
                debugInfo: getQuestDebugInfo(quests, quest.QuestName)
            })
        })
        
        // Create edges
        quests.forEach(quest => {
            // Requirement edges
            if (quest.Requirement) {
                quest.Requirement.forEach(req => {
                    if (nodeMap.has(req)) {
                        edgeList.push({
                            from: req,
                            to: quest.QuestName,
                            type: 'requirement'
                        })
                    }
                })
            }
            
            // Failure condition edges
            if (quest.failIfFailed) {
                const matches = quest.failIfFailed.match(/\{\{\s*([^}]+)\s*}}/g)
                if (matches) {
                    matches.forEach(match => {
                        const questName = match.replace(/\{\{\s*|\s*}}/g, '').trim()
                        if (nodeMap.has(questName)) {
                            edgeList.push({
                                from: questName,
                                to: quest.QuestName,
                                type: 'failIfFailed'
                            })
                        }
                    })
                }
            }
            
            if (quest.failIfPending) {
                const matches = quest.failIfPending.match(/\{\{\s*([^}]+)\s*}}/g)
                if (matches) {
                    matches.forEach(match => {
                        const questName = match.replace(/\{\{\s*|\s*}}/g, '').trim()
                        if (nodeMap.has(questName)) {
                            edgeList.push({
                                from: questName,
                                to: quest.QuestName,
                                type: 'failIfPending'
                            })
                        }
                    })
                }
            }
        })
        
        setNodes(Array.from(nodeMap.values()))
        setEdges(edgeList)
    }

    const handleQuestSelect = (quest: QuestData) => {
        setSelectedQuest(quest)
        const info = getQuestDebugInfo(allQuests, quest.QuestName)
        setDebugInfo(info)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Solved": return "#22c55e"
            case "Failed": return "#ef4444"
            case "Pending": return "#f59e0b"
            default: return "#6b7280"
        }
    }

    const getEdgeColor = (type: string) => {
        switch (type) {
            case "requirement": return "#6366f1"
            case "failIfFailed": return "#ef4444"
            case "failIfPending": return "#f59e0b"
            default: return "#6b7280"
        }
    }

    useEffect(() => {
        if (!canvasRef.current || nodes.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = 800
        canvas.height = 600
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw edges
        edges.forEach(edge => {
            const fromNode = nodes.find(n => n.id === edge.from)
            const toNode = nodes.find(n => n.id === edge.to)
            
            if (fromNode && toNode) {
                ctx.beginPath()
                ctx.moveTo(fromNode.x + viewOffset.x, fromNode.y + viewOffset.y)
                ctx.lineTo(toNode.x + viewOffset.x, toNode.y + viewOffset.y)
                ctx.strokeStyle = getEdgeColor(edge.type)
                ctx.lineWidth = edge.type === 'requirement' ? 2 : 1
                ctx.setLineDash(edge.type === 'requirement' ? [] : [5, 5])
                ctx.stroke()
                ctx.setLineDash([])
                
                // Draw arrow
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)
                const arrowSize = 8
                ctx.beginPath()
                ctx.moveTo(
                    toNode.x + viewOffset.x - arrowSize * Math.cos(angle - Math.PI / 6),
                    toNode.y + viewOffset.y - arrowSize * Math.sin(angle - Math.PI / 6)
                )
                ctx.lineTo(toNode.x + viewOffset.x, toNode.y + viewOffset.y)
                ctx.lineTo(
                    toNode.x + viewOffset.x - arrowSize * Math.cos(angle + Math.PI / 6),
                    toNode.y + viewOffset.y - arrowSize * Math.sin(angle + Math.PI / 6)
                )
                ctx.fillStyle = getEdgeColor(edge.type)
                ctx.fill()
            }
        })

        // Draw nodes
        nodes.forEach(node => {
            const x = node.x + viewOffset.x
            const y = node.y + viewOffset.y
            
            // Node circle
            ctx.beginPath()
            ctx.arc(x, y, 20, 0, Math.PI * 2)
            ctx.fillStyle = getStatusColor(node.quest.SolveStatus)
            ctx.fill()
            ctx.strokeStyle = selectedQuest?.QuestName === node.quest.QuestName ? "#8b5cf6" : "#1f2937"
            ctx.lineWidth = selectedQuest?.QuestName === node.quest.QuestName ? 3 : 1
            ctx.stroke()
            
            // Node label
            ctx.fillStyle = "#ffffff"
            ctx.font = "10px sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            const displayName = node.quest.QuestName.length > 8 
                ? node.quest.QuestName.substring(0, 6) + "..." 
                : node.quest.QuestName
            ctx.fillText(displayName, x, y)
        })

        // Handle click events
        const handleCanvasClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            const clickX = e.clientX - rect.left - viewOffset.x
            const clickY = e.clientY - rect.top - viewOffset.y
            
            for (const node of nodes) {
                const distance = Math.sqrt((clickX - node.x) ** 2 + (clickY - node.y) ** 2)
                if (distance <= 20) {
                    handleQuestSelect(node.quest)
                    break
                }
            }
        }

        // Handle drag events
        const handleMouseDown = (e: MouseEvent) => {
            setIsDragging(true)
            setDragOffset({ x: e.clientX, y: e.clientY })
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return
            
            const dx = e.clientX - dragOffset.x
            const dy = e.clientY - dragOffset.y
            
            setViewOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
            setDragOffset({ x: e.clientX, y: e.clientY })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        canvas.addEventListener("click", handleCanvasClick)
        canvas.addEventListener("mousedown", handleMouseDown)
        canvas.addEventListener("mousemove", handleMouseMove)
        canvas.addEventListener("mouseup", handleMouseUp)

        return () => {
            canvas.removeEventListener("click", handleCanvasClick)
            canvas.removeEventListener("mousedown", handleMouseDown)
            canvas.removeEventListener("mousemove", handleMouseMove)
            canvas.removeEventListener("mouseup", handleMouseUp)
        }
    }, [nodes, edges, selectedQuest, viewOffset, isDragging, dragOffset])

    const resetView = () => {
        setViewOffset({ x: 0, y: 0 })
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        Quest Debug Network
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Interactive visualization of all quest dependencies and debug information
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Network Graph */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Quest Network Graph</CardTitle>
                                    <Button onClick={resetView} variant="outline" size="sm">
                                        Reset View
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>Solved</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span>Failed</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <span>Pending</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-0.5 bg-blue-500"></div>
                                        <span>Requirement</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-0.5 bg-red-500 border-dashed"></div>
                                        <span>Fail Condition</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <canvas
                                    ref={canvasRef}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded cursor-move"
                                    style={{ height: "600px" }}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Click nodes to view debug info. Drag to pan the view.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Debug Info Panel */}
                    <div>
                        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle>Quest Debug Info</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedQuest && debugInfo ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">
                                                {selectedQuest.QuestName}
                                            </h3>
                                            <div className="flex gap-2 mb-3">
                                                <Badge className={`${
                                                    debugInfo.staticStatus === "Solved" ? "bg-green-600" :
                                                    debugInfo.staticStatus === "Failed" ? "bg-red-600" : "bg-gray-600"
                                                }`}>
                                                    Static: {debugInfo.staticStatus}
                                                </Badge>
                                                <Badge className={`${
                                                    debugInfo.dynamicStatus === "Solved" ? "bg-green-600" :
                                                    debugInfo.dynamicStatus === "Failed" ? "bg-red-600" : "bg-gray-600"
                                                }`}>
                                                    Dynamic: {debugInfo.dynamicStatus}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Dynamic Reason</h4>
                                            <p className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                {debugInfo.dynamicReason}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="font-medium">Locked:</span> {debugInfo.isLocked ? "Yes" : "No"}
                                            </div>
                                            <div>
                                                <span className="font-medium">Manual Lock:</span> {debugInfo.manualLock ? "Yes" : "No"}
                                            </div>
                                            <div>
                                                <span className="font-medium">Auto Solve:</span> {debugInfo.autoSolve ? "Yes" : "No"}
                                            </div>
                                            <div>
                                                <span className="font-medium">Must Req:</span> {debugInfo.mustRequirement ? "Yes" : "No"}
                                            </div>
                                        </div>

                                        {debugInfo.requirements.length > 0 && (
                                            <div>
                                                <h4 className="font-medium mb-2">Requirements</h4>
                                                <div className="space-y-1">
                                                    {debugInfo.requirements.map((req: string) => (
                                                        <div key={req} className="text-xs bg-blue-100 dark:bg-blue-900 p-1 rounded">
                                                            {req}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {debugInfo.failedMustRequirement && (
                                            <div>
                                                <h4 className="font-medium mb-2">Failed Must Requirement</h4>
                                                <div className="text-xs bg-red-100 dark:bg-red-900 p-2 rounded">
                                                    {debugInfo.failedMustRequirement}
                                                </div>
                                            </div>
                                        )}

                                        {(debugInfo.failConditions.failIfFailed || debugInfo.failConditions.failIfPending) && (
                                            <div>
                                                <h4 className="font-medium mb-2">Fail Conditions</h4>
                                                {debugInfo.failConditions.failIfFailed && (
                                                    <div className="text-xs bg-red-100 dark:bg-red-900 p-1 rounded mb-1">
                                                        <strong>If Failed:</strong> {debugInfo.failConditions.failIfFailed}
                                                    </div>
                                                )}
                                                {debugInfo.failConditions.failIfPending && (
                                                    <div className="text-xs bg-yellow-100 dark:bg-yellow-900 p-1 rounded">
                                                        <strong>If Pending:</strong> {debugInfo.failConditions.failIfPending}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        Click on a quest node to view debug information
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}