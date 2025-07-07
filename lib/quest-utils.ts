// fixme Major issue with the cascading logic for MustRequirement failures where many quests arent failed when they should be.

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
                globalQuest.manualLock = quest.manualLock ?? false; // default to false
                globalQuest.isLocked = globalQuest.manualLock || checkIfQuestIsLocked(globalQuest, Array.from(questMap.values()));
            }
        }

        let changed: boolean;
        do {
            changed = false;

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

            // Apply fail logic (including MustRequirement cascading)
            for (const quest of quests) {
                const globalQuest = questMap.get(quest.QuestName);
                if (globalQuest && globalQuest.SolveStatus !== "Failed" && !globalQuest.manualLock) {
                    // Check regular fail conditions
                    if (checkIfQuestShouldFail(globalQuest, Array.from(questMap.values()))) {
                        changed = true;
                        globalQuest.SolveStatus = "Failed";
                    }
                    // Check MustRequirement cascading failures (RECURSIVE)
                    else if (checkIfQuestShouldFailDueToMustRequirement(globalQuest, Array.from(questMap.values()))) {
                        changed = true;
                        globalQuest.SolveStatus = "Failed";
                        // Set generic fail message for MustRequirement failures
                        const failedMustReq = getFailedMustRequirement(globalQuest, Array.from(questMap.values()));
                        if (failedMustReq && !globalQuest.MissName) {
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

function checkIfQuestShouldFailDueToMustRequirement(quest: QuestData, allQuests: QuestData[]): boolean {
    if (!quest.Requirement || quest.Requirement.length === 0) return false;

    // RECURSIVE: Check if any requirement in the dependency chain has a failed MustRequirement
    return hasFailedMustRequirementInChain(quest, allQuests, new Set());
}

function hasFailedMustRequirementInChain(
    quest: QuestData,
    allQuests: QuestData[],
    visited: Set<string>
): boolean {
    // Prevent infinite loops in circular dependencies
    if (visited.has(quest.QuestName)) {
        return false;
    }
    visited.add(quest.QuestName);

    if (!quest.Requirement?.length) {
        return false;
    }

    for (const requiredQuestName of quest.Requirement) {
        const requiredQuest = allQuests.find(q => q.QuestName === requiredQuestName);
        if (!requiredQuest) {
            continue;
        }

        // Direct check: Is this requirement a failed MustRequirement?
        if (requiredQuest.MustRequirement && requiredQuest.SolveStatus === "Failed") {
            return true;
        }

        // Recursive check: Does this requirement have a failed MustRequirement in its chain?
        if (hasFailedMustRequirementInChain(requiredQuest, allQuests, visited)) {
            return true;
        }
    }
    return false;
}

function findRootFailedMustRequirement(
    quest: QuestData,
    allQuests: QuestData[],
    visited: Set<string>
): string | null {
    if (visited.has(quest.QuestName)) {
        return null;
    }
    visited.add(quest.QuestName);

    if (!quest.Requirement?.length) {
        return null;
    }

    for (const requiredQuestName of quest.Requirement) {
        const requiredQuest = allQuests.find(q => q.QuestName === requiredQuestName);
        if (!requiredQuest) {
            continue;
        }

        if (requiredQuest.MustRequirement && requiredQuest.SolveStatus === "Failed") {
            return requiredQuestName;
        }

        const root = findRootFailedMustRequirement(requiredQuest, allQuests, visited);
        if (root) return root;
    }
    return null;
}

function getFailedMustRequirement(quest: QuestData, allQuests: QuestData[]): string | null {
    if (!quest.Requirement || quest.Requirement.length === 0) return null;

    // Find the root failed MustRequirement in the chain
    return findRootFailedMustRequirement(quest, allQuests, new Set());
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
