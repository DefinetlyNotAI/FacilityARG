"use client"

import type React from "react"
import {useState} from "react"
import {Filter, Search} from "lucide-react"
import {Badge} from "@/components/ui/badge"

interface QuestFilterProps {
    onFilterChangeAction: (filters: { status: string[]; search: string }) => void
}

export default function QuestFilter({onFilterChangeAction}: QuestFilterProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilters, setStatusFilters] = useState<string[]>([])
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const statuses = ["Pending", "Solved", "Failed"]

    const toggleStatus = (status: string) => {
        setStatusFilters((prev) => {
            const newFilters = prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]

            onFilterChangeAction({status: newFilters, search: searchTerm})
            return newFilters
        })
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
        onFilterChangeAction({status: statusFilters, search: value})
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Solved":
                return "bg-green-600"
            case "Failed":
                return "bg-red-600"
            case "Pending":
                return "bg-gray-600"
            default:
                return "bg-gray-600"
        }
    }

    return (
        <div className="mb-4 space-y-2">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-white"
                >
                    <Filter className="h-5 w-5"/>
                </button>
            </div>

            {isFilterOpen && (
                <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Filter by status:</p>
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((status) => (
                            <Badge
                                key={status}
                                className={`cursor-pointer ${statusFilters.includes(status) ? getStatusColor(status) : "bg-gray-700"}`}
                                onClick={() => toggleStatus(status)}
                            >
                                {status}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
