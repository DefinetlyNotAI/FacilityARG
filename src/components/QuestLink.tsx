import type {Quest} from "../types"

interface QuestLinkProps {
    text: string
    allQuests: Quest[]
}

const QuestLink = ({text, allQuests}: QuestLinkProps) => {
    if (!text) return null

    // Regular expression to find quest references like {{ Quest Name }}
    const regex = /\{\{\s*([^}]+)\s*}}/g

    // Split the text by quest references
    const parts = text.split(regex)

    // Process each part
    const processedParts = parts.map((part, index) => {
        // Even indices are regular text, odd indices are quest names
        if (index % 2 === 0) {
            return <span key={index}>{part}</span>
        } else {
            // This is a quest name
            const questName = part.trim()
            const quest = allQuests.find((q) => q.QuestName === questName)

            if (!quest) {
                return <span key={index}>{questName}</span>
            }

            // Check if the quest is secret and unsolved
            const isSecret = quest["Secret?"] && quest.SolveStatus !== "Solved"

            return (
                <span key={index}
                      className={`quest-link ${quest.SolveStatus.toLowerCase()} ${isSecret ? "secret" : ""}`}>
          {isSecret ? "???" : questName}
        </span>
            )
        }
    })

    return <>{processedParts}</>
}

export default QuestLink
