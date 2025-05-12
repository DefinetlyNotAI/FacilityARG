import {useEffect, useRef, useState} from "react"
import type {QuestConnection, Questline} from "@/lib/types"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"

interface QuestDependencyGraphProps {
    questlines: Questline[]
    selectedQuestline: string | null
    onQuestSelectAction: (questName: string) => void
}

export default function QuestDependencyGraph({
                                                 questlines,
                                                 selectedQuestline,
                                                 onQuestSelectAction,
                                             }: QuestDependencyGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [offset, setOffset] = useState({x: 0, y: 0})
    const isDraggingRef = useRef(false)
    const startDragPos = useRef({x: 0, y: 0})

    const parseConditions = (conditionStr: string) => {
        const conditionMatches = conditionStr.match(/\{\{\s*([^}]+)\s*}/g)
        return conditionMatches ? conditionMatches.map(match => match.replace(/\{\{\s*|\s*}}/g, "").trim()) : []
    }

    const getQuestConnections = (): QuestConnection[] => {
        const connections: QuestConnection[] = []
        const currentQuestline = questlines.find((ql) => ql.questline_name === selectedQuestline)
        if (!currentQuestline) return connections

        currentQuestline.quests.forEach((quest) => {
            if (quest.Requirement) {
                quest.Requirement.forEach((reqName) => {
                    connections.push({source: reqName, target: quest.QuestName, type: "requires"})
                })
            }

            if (quest.failIfFailed) {
                const failConditions = Array.isArray(quest.failIfFailed)
                    ? quest.failIfFailed.map(name => name.trim())
                    : parseConditions(quest.failIfFailed)
                failConditions.forEach((failName) => {
                    connections.push({source: failName, target: quest.QuestName, type: "fails"})
                })
            }

            if (quest.QuestDesc?.Relations) {
                const relations = parseConditions(quest.QuestDesc.Relations)
                relations.forEach((relation) => {
                    connections.push({source: quest.QuestName, target: relation, type: "related"})
                })
            }
        })

        return connections
    }

    useEffect(() => {
        if (!canvasRef.current || !selectedQuestline) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const handleMouseDown = (e: MouseEvent) => {
            isDraggingRef.current = true
            startDragPos.current = {x: e.clientX, y: e.clientY}
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return

            const dx = e.clientX - startDragPos.current.x
            const dy = e.clientY - startDragPos.current.y

            setOffset((prev) => ({
                x: prev.x + dx,
                y: prev.y + dy,
            }))

            startDragPos.current = {x: e.clientX, y: e.clientY}
        }

        const handleMouseUp = () => {
            isDraggingRef.current = false
        }

        canvas.addEventListener("mousedown", handleMouseDown)
        canvas.addEventListener("mousemove", handleMouseMove)
        canvas.addEventListener("mouseup", handleMouseUp)

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown)
            canvas.removeEventListener("mousemove", handleMouseMove)
            canvas.removeEventListener("mouseup", handleMouseUp)
        }
    }, [])

    useEffect(() => {
        if (!canvasRef.current || !selectedQuestline) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const currentQuestline = questlines.find((ql) => ql.questline_name === selectedQuestline)
        if (!currentQuestline) return

        const quests = currentQuestline.quests
        const connections = getQuestConnections()

        const nodePositions: Record<string, { x: number; y: number }> = {}
        const nodeRadius = 20
        const nodeSpacing = 150
        const startX = 100
        const startY = 100

        const levels: string[][] = []
        const processed = new Set<string>()

        const firstLevel = quests.filter((q) => !q.Requirement || q.Requirement.length === 0).map((q) => q.QuestName)
        levels.push(firstLevel)
        firstLevel.forEach((name) => processed.add(name))

        let remainingQuests = quests.filter((q) => !processed.has(q.QuestName))
        while (remainingQuests.length > 0) {
            const nextLevel: string[] = []
            remainingQuests.forEach((quest) => {
                if (quest.Requirement && quest.Requirement.every((req) => processed.has(req))) {
                    nextLevel.push(quest.QuestName)
                    processed.add(quest.QuestName)
                }
            })

            if (nextLevel.length === 0 && remainingQuests.length > 0) {
                nextLevel.push(remainingQuests[0].QuestName)
                processed.add(remainingQuests[0].QuestName)
            }

            levels.push(nextLevel)
            remainingQuests = quests.filter((q) => !processed.has(q.QuestName))
        }

        levels.forEach((level, levelIndex) => {
            const levelWidth = level.length * nodeSpacing
            const levelStartX = startX + (canvas.width - levelWidth) / 2

            level.forEach((questName, index) => {
                nodePositions[questName] = {
                    x: levelStartX + index * nodeSpacing + offset.x,
                    y: startY + levelIndex * nodeSpacing + offset.y,
                }
            })
        })

        connections.forEach((connection) => {
            const sourcePos = nodePositions[connection.source]
            const targetPos = nodePositions[connection.target]
            if (!sourcePos || !targetPos) return

            ctx.beginPath()
            ctx.moveTo(sourcePos.x, sourcePos.y)
            ctx.lineTo(targetPos.x, targetPos.y)

            switch (connection.type) {
                case "requires":
                    ctx.strokeStyle = "#6366f1"
                    ctx.lineWidth = 2
                    ctx.setLineDash([])
                    break
                case "fails":
                    ctx.strokeStyle = "#ef4444"
                    ctx.lineWidth = 2
                    ctx.setLineDash([5, 3])
                    break
                case "related":
                    ctx.strokeStyle = "#8b5cf6"
                    ctx.lineWidth = 1
                    ctx.setLineDash([2, 2])
                    break
                default:
                    ctx.strokeStyle = "#6b7280"
                    ctx.lineWidth = 1
                    ctx.setLineDash([])
            }

            ctx.stroke()
            ctx.setLineDash([])

            const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x)
            const arrowSize = 8
            ctx.beginPath()
            ctx.moveTo(
                targetPos.x - arrowSize * Math.cos(angle) + arrowSize * Math.sin(angle),
                targetPos.y - arrowSize * Math.sin(angle) - arrowSize * Math.cos(angle),
            )
            ctx.lineTo(targetPos.x - arrowSize * Math.cos(angle), targetPos.y - arrowSize * Math.sin(angle))
            ctx.lineTo(
                targetPos.x - arrowSize * Math.cos(angle) - arrowSize * Math.sin(angle),
                targetPos.y - arrowSize * Math.sin(angle) + arrowSize * Math.cos(angle),
            )
            ctx.fillStyle = ctx.strokeStyle
            ctx.fill()
        })

        quests.forEach((quest) => {
            const pos = nodePositions[quest.QuestName]
            if (!pos) return

            ctx.beginPath()
            ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2)

            switch (quest.SolveStatus) {
                case "Solved":
                    ctx.fillStyle = "#22c55e"
                    break
                case "Failed":
                    ctx.fillStyle = "#ef4444"
                    break
                case "Pending":
                    ctx.fillStyle = quest.isLocked ? "#6b7280" : "#f59e0b"
                    break
                default:
                    ctx.fillStyle = "#6b7280"
            }

            ctx.fill()
            ctx.strokeStyle = "#1f2937"
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.fillStyle = "#ffffff"
            ctx.font = "10px sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const displayName =
                quest.Secret && quest.SolveStatus === "Pending"
                    ? "???"
                    : quest.QuestName.length > 15
                        ? quest.QuestName.substring(0, 12) + "..."
                        : quest.QuestName

            ctx.fillText(displayName, pos.x, pos.y)
        })

        // 🔑 Draw Legend (top-left corner)
        const drawLegend = () => {
            const keyX = 10
            const keyY = 10
            const spacing = 25 // Increased spacing to avoid overlap
            const radius = 8

            const items = [
                {label: "Solved", color: "#22c55e"},
                {label: "Failed", color: "#ef4444"},
                {label: "Pending", color: "#f59e0b"},
                {label: "Locked", color: "#6b7280"},
                {label: "Required Quest Relation", color: "#6366f1", line: true},
                {label: "Can be failed", color: "#ef4444", dashed: true, line: true},
                {label: "Optional Quest Relation", color: "#8b5cf6", dotted: true, line: true},
            ]

            items.forEach((item, index) => {
                const y = keyY + index * spacing + 5
                if (item.line) {
                    ctx.strokeStyle = item.color
                    ctx.lineWidth = 2
                    ctx.setLineDash(item.dashed ? [5, 3] : item.dotted ? [2, 2] : [])
                    ctx.beginPath()
                    ctx.moveTo(keyX, y)
                    ctx.lineTo(keyX + 20, y)
                    ctx.stroke()
                    ctx.setLineDash([])
                } else {
                    ctx.fillStyle = item.color
                    ctx.beginPath()
                    ctx.arc(keyX + radius, y, radius, 0, Math.PI * 2)
                    ctx.fill()
                }

                ctx.fillStyle = "#ffffff"
                ctx.font = "12px sans-serif" // Adjusted font size for readability
                ctx.textAlign = "left"
                ctx.textBaseline = "middle"
                ctx.fillText(item.label, keyX + 30, y)
            })
        }

        drawLegend()

        const handleCanvasClick = (e: MouseEvent) => {
            if (isDraggingRef.current) return // Ignore click if dragging

            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            for (const [questName, pos] of Object.entries(nodePositions)) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
                if (distance <= nodeRadius) {
                    onQuestSelectAction(questName)
                    break
                }
            }
        }

        canvas.addEventListener("click", handleCanvasClick)
        return () => {
            canvas.removeEventListener("click", handleCanvasClick)
        }
    }, [selectedQuestline, questlines, offset])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quest Dependency Graph</CardTitle>
                <div
                    className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold py-1 px-3 rounded-full">
                    Beta
                </div>
            </CardHeader>
            <CardContent>
                <canvas
                    ref={canvasRef}
                    className="w-full h-96 border-2 border-gray-700"
                />
            </CardContent>
        </Card>
    )
}
