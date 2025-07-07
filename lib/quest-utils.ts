import {LogicOperator, PROTECTED_KEYWORDS, QuestData, Questline} from "./types";
import {validateUniqueNames} from "@/lib/validator";

export function processQuestData(data: Questline[]): Questline[] {
    const allQuestsFlat: QuestData[] = data.flatMap(q => q.quests);
    const questMap: Map<string, QuestData> = new Map(
        allQuestsFlat.map((q) => [q.QuestName, { ...q }])
    );

    return data.map((questline) => {
        validateUniqueNames(questline.quests);

        let quests = questline.quests.map((quest) => ({
            ...quest,
            autoSolve: quest.QuestName.includes("*"),
            manualLock: quest.manualLock ?? (quest.isLocked === true),
        }));

        // First pass: initialize global questMap entries
        for (const quest of quests) {
            const globalQuest = questMap.get(quest.QuestName);
            if (globalQuest) {
                globalQuest.autoSolve = quest.autoSolve;
                globalQuest.manualLock = quest.manualLock ?? false;
                globalQuest.isLocked = globalQuest.manualLock || checkIfQuestIsLocked(globalQuest, Array.from(questMap.values()));
            }
        }

        let changed: boolean;
        let iterationCount = 0;
        const maxIterations = 100; // Prevent infinite loops

        do {
            changed = false;
            iterationCount++;

            if (iterationCount > maxIterations) {
                console.warn("Maximum iterations reached in quest processing. Possible circular dependency.");
                break;
            }

            // Update lock status
            for (const quest of quests) {
                const globalQuest = questMap.get(quest.QuestName);
                if (globalQuest && !globalQuest.manualLock) {
                    const newLock = checkIfQuestIsLocked(globalQuest, Array.from(questMap.values()));
                    if (globalQuest.isLocked !== newLock) {
                        changed = true;
                        globalQuest.isLocked = newLock;
                    }
                }
            }

            // Apply regular fail logic first
            for (const quest of quests) {
                const globalQuest = questMap.get(quest.QuestName);
                if (globalQuest && globalQuest.SolveStatus !== "Failed" && !globalQuest.manualLock) {
                    if (checkIfQuestShouldFail(globalQuest, Array.from(questMap.values()))) {
                        changed = true;
                        globalQuest.SolveStatus = "Failed";
                    }
                }
            }

            // Apply MustRequirement cascading failures
            for (const quest of quests) {
                const globalQuest = questMap.get(quest.QuestName);
                if (globalQuest && globalQuest.SolveStatus !== "Failed" && !globalQuest.manualLock) {
                    const failedMustReq = getFailedMustRequirementInChain(globalQuest, Array.from(questMap.values()));
                    if (failedMustReq) {
                        changed = true;
                        globalQuest.SolveStatus = "Failed";
                        // Set generic fail message for MustRequirement failures
                        if (!globalQuest.MissName) {
                            globalQuest.MissName = `${globalQuest.QuestName}`;
                            globalQuest.MissInfo = `${globalQuest.QuestName} failed due to a must requirement for {{ ${failedMustReq} }}`;
                        }
                    }
                }
            }

        } while (changed);

        return {
            ...questline,
            quests: quests.map(q => questMap.get(q.QuestName) || q),
        };
    });
}

function checkIfQuestIsLocked(quest: QuestData & { manualLock?: boolean }, allQuests: QuestData[]): boolean {
    if (quest.manualLock) return true;
    if (!quest.Requirement || quest.Requirement.length === 0) return false;

    for (const required of quest.Requirement) {
        const reqQuest = allQuests.find((q) => q.QuestName === required);
        if (reqQuest && reqQuest.SolveStatus !== "Solved" && reqQuest.SolveStatus !== "Failed") {
            return true;
        }
    }
    return false;
}

function checkIfQuestShouldFail(quest: QuestData, allQuests: QuestData[]): boolean {
    const questMap = new Map(allQuests.map(q => [q.QuestName, q]));
    const failDueToFailed = shouldFailBasedOnCondition(quest.failIfFailed, questMap, "Failed");
    const failDueToPending = shouldFailBasedOnCondition(quest.failIfPending, questMap, "Pending", true);
    return failDueToFailed || failDueToPending;
}

function getFailedMustRequirementInChain(quest: QuestData, allQuests: QuestData[]): string | null {
    if (!quest.Requirement || quest.Requirement.length === 0) return null;

    // Check direct requirements first
    for (const requiredQuestName of quest.Requirement) {
        const requiredQuest = allQuests.find(q => q.QuestName === requiredQuestName);
        if (!requiredQuest) continue;

        // Direct check: Is this requirement a failed MustRequirement?
        if (requiredQuest.MustRequirement && requiredQuest.SolveStatus === "Failed") {
            return requiredQuestName;
        }
    }

    // Then check for recursive must requirement failures
    for (const requiredQuestName of quest.Requirement) {
        const requiredQuest = allQuests.find(q => q.QuestName === requiredQuestName);
        if (!requiredQuest) continue;

        // If the required quest failed due to a must requirement, this quest should also fail
        if (requiredQuest.SolveStatus === "Failed") {
            const rootMustReq = findRootFailedMustRequirement(requiredQuest, allQuests, new Set());
            if (rootMustReq) {
                return rootMustReq;
            }
        }
    }

    return null;
}

function findRootFailedMustRequirement(
    quest: QuestData,
    allQuests: QuestData[],
    visited: Set<string>
): string | null {
    // Prevent infinite loops in circular dependencies
    if (visited.has(quest.QuestName)) {
        return null;
    }
    visited.add(quest.QuestName);

    // If this quest itself is a failed must requirement, return it
    if (quest.MustRequirement && quest.SolveStatus === "Failed") {
        return quest.QuestName;
    }

    // If this quest failed due to a must requirement, find the root cause
    if (quest.SolveStatus === "Failed" && quest.Requirement?.length) {
        for (const requiredQuestName of quest.Requirement) {
            const requiredQuest = allQuests.find(q => q.QuestName === requiredQuestName);
            if (!requiredQuest) continue;

            // Check if this requirement is a failed must requirement
            if (requiredQuest.MustRequirement && requiredQuest.SolveStatus === "Failed") {
                return requiredQuestName;
            }

            // Recursively check if this requirement failed due to a must requirement
            if (requiredQuest.SolveStatus === "Failed") {
                const root = findRootFailedMustRequirement(requiredQuest, allQuests, visited);
                if (root) return root;
            }
        }
    }

    return null;
}

function shouldFailBasedOnCondition(
    conditionRaw: string | undefined,
    questMap: Map<string, QuestData>,
    statusToCheck: "Failed" | "Pending",
    onlyIfUnlocked = false
): boolean {
    if (!conditionRaw) return false;

    const fragments = conditionRaw
        .split(/(AND|OR|XOR|NAND|NOR|\(|\))/g)
        .map((s) => s.trim())
        .filter(Boolean);

    const tokens: (string | LogicOperator | "(" | ")")[] = [];
    fragments.forEach((frag) => {
        if (PROTECTED_KEYWORDS.includes(frag as LogicOperator)) {
            tokens.push(frag as LogicOperator);
        } else if (frag === "(" || frag === ")") {
            tokens.push(frag);
        } else {
            const match = frag.match(/\{\{\s*([^}]+)\s*}}/);
            if (match) {
                const questName = match[1].trim();
                tokens.push(questName);
            }
        }
    });

    return evaluateFailCondition(tokens, questMap, statusToCheck, onlyIfUnlocked);
}

function evaluateFailCondition(
    condition: (string | LogicOperator | "(" | ")")[],
    questMap: Map<string, QuestData>,
    statusToCheck: "Failed" | "Pending",
    onlyIfUnlocked: boolean
): boolean {
    let pos = 0;

    const resolveStatus = (questName: string): boolean => {
        const quest = questMap.get(questName);
        if (!quest) {
            console.error(`Quest "${questName}" not found in questMap.`);
            throw new Error(`Quest "${questName}" is undefined.`);
        }

        if (statusToCheck === "Pending") {
            return quest.SolveStatus !== "Solved" &&
                quest.SolveStatus !== "Failed" &&
                (!onlyIfUnlocked || quest.isLocked === false);
        }

        return quest.SolveStatus === statusToCheck;
    };

    function parseExpression(): boolean {
        let value = parseTerm();
        while (pos < condition.length && (condition[pos] === "OR" || condition[pos] === "NOR" || condition[pos] === "XOR")) {
            const op = condition[pos++] as LogicOperator;
            const right = parseTerm();
            switch (op) {
                case "OR": value = value || right; break;
                case "NOR": value = !(value || right); break;
                case "XOR": value = value !== right; break;
            }
        }
        return value;
    }

    function parseTerm(): boolean {
        let value = parseFactor();
        while (pos < condition.length && (condition[pos] === "AND" || condition[pos] === "NAND")) {
            const op = condition[pos++] as LogicOperator;
            const right = parseFactor();
            switch (op) {
                case "AND": value = value && right; break;
                case "NAND": value = !(value && right); break;
            }
        }
        return value;
    }

    function parseFactor(): boolean {
        const token = condition[pos++];
        if (token === "(") {
            const val = parseExpression();
            if (condition[pos++] !== ")") {
                throw new Error("Mismatched parentheses");
            }
            return val;
        } else if (!PROTECTED_KEYWORDS.includes(token as LogicOperator)) {
            return resolveStatus(token);
        } else {
            throw new Error("Unexpected token in expression: " + token);
        }
    }

    const result = parseExpression();
    if (pos < condition.length) {
        throw new Error("Unexpected token at end of expression");
    }
    return result;
}