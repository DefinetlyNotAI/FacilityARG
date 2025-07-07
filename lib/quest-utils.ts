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

        // Process all quests until convergence
        processQuestsUntilConvergence(Array.from(questMap.values()), questMap);

        return {
            ...questline,
            quests: quests.map(q => questMap.get(q.QuestName) || q),
        };
    });
}

function processQuestsUntilConvergence(allQuests: QuestData[], questMap: Map<string, QuestData>): void {
    let changed: boolean;
    let iterationCount = 0;
    const maxIterations = 200; // Increased for complex dependency chains

    do {
        changed = false;
        iterationCount++;

        if (iterationCount > maxIterations) {
            console.warn("Maximum iterations reached in quest processing. Possible circular dependency or very complex dependency chain.");
            break;
        }

        // Phase 1: Update lock status for all quests
        const lockChanges = updateAllQuestLocks(allQuests);
        if (lockChanges > 0) {
            changed = true;
            console.log(`Iteration ${iterationCount}: Updated ${lockChanges} quest locks`);
        }

        // Phase 2: Apply regular fail logic for all quests
        const regularFailures = applyRegularFailLogic(allQuests);
        if (regularFailures > 0) {
            changed = true;
            console.log(`Iteration ${iterationCount}: Applied ${regularFailures} regular failures`);
        }

        // Phase 3: Apply MustRequirement cascading failures for all quests
        const mustReqFailures = applyMustRequirementCascading(allQuests);
        if (mustReqFailures > 0) {
            changed = true;
            console.log(`Iteration ${iterationCount}: Applied ${mustReqFailures} MustRequirement cascading failures`);
        }

        // Phase 4: Apply auto-solve logic for all quests
        const autoSolves = applyAutoSolveLogic(allQuests);
        if (autoSolves > 0) {
            changed = true;
            console.log(`Iteration ${iterationCount}: Applied ${autoSolves} auto-solves`);
        }

    } while (changed);

    console.log(`Quest processing converged after ${iterationCount} iterations`);
}

function updateAllQuestLocks(allQuests: QuestData[]): number {
    let changes = 0;
    
    for (const quest of allQuests) {
        if (!quest.manualLock) {
            const newLock = checkIfQuestIsLocked(quest, allQuests);
            if (quest.isLocked !== newLock) {
                quest.isLocked = newLock;
                changes++;
            }
        }
    }
    
    return changes;
}

function applyRegularFailLogic(allQuests: QuestData[]): number {
    let changes = 0;
    
    for (const quest of allQuests) {
        if (quest.SolveStatus !== "Failed" && !quest.manualLock) {
            if (checkIfQuestShouldFail(quest, allQuests)) {
                quest.SolveStatus = "Failed";
                changes++;
                console.log(`Quest '${quest.QuestName}' failed due to regular fail conditions`);
            }
        }
    }
    
    return changes;
}

function applyMustRequirementCascading(allQuests: QuestData[]): number {
    let changes = 0;
    
    for (const quest of allQuests) {
        if (quest.SolveStatus !== "Failed" && !quest.manualLock) {
            const failedMustReq = getFailedMustRequirementInChain(quest, allQuests);
            if (failedMustReq) {
                quest.SolveStatus = "Failed";
                changes++;
                
                // Set generic fail message for MustRequirement failures
                if (!quest.MissName) {
                    quest.MissName = quest.QuestName;
                    quest.MissInfo = `${quest.QuestName} failed due to a must requirement for {{ ${failedMustReq} }}`;
                }
                
                console.log(`Quest '${quest.QuestName}' failed due to MustRequirement cascade from '${failedMustReq}'`);
            }
        }
    }
    
    return changes;
}

function applyAutoSolveLogic(allQuests: QuestData[]): number {
    let changes = 0;
    
    for (const quest of allQuests) {
        if (quest.autoSolve && quest.SolveStatus === "Pending" && !quest.isLocked) {
            // Auto-solve logic: inherit status from requirements
            if (quest.Requirement && quest.Requirement.length > 0) {
                const allRequirementsSolved = quest.Requirement.every(reqName => {
                    const reqQuest = allQuests.find(q => q.QuestName === reqName);
                    return reqQuest && reqQuest.SolveStatus === "Solved";
                });
                
                const anyRequirementFailed = quest.Requirement.some(reqName => {
                    const reqQuest = allQuests.find(q => q.QuestName === reqName);
                    return reqQuest && reqQuest.SolveStatus === "Failed";
                });
                
                if (allRequirementsSolved) {
                    quest.SolveStatus = "Solved";
                    changes++;
                    console.log(`Quest '${quest.QuestName}' auto-solved`);
                } else if (anyRequirementFailed) {
                    quest.SolveStatus = "Failed";
                    changes++;
                    console.log(`Quest '${quest.QuestName}' auto-failed`);
                }
            }
        }
    }
    
    return changes;
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

    // Check each requirement
    for (const requiredQuestName of quest.Requirement) {
        const requiredQuest = allQuests.find(q => q.QuestName === requiredQuestName);
        if (!requiredQuest) continue;

        // Case 1: Direct MustRequirement failure
        if (requiredQuest.MustRequirement && requiredQuest.SolveStatus === "Failed") {
            return requiredQuestName;
        }

        // Case 2: Requirement failed due to a MustRequirement (recursive)
        if (requiredQuest.SolveStatus === "Failed") {
            // Check if this quest's failure was due to a MustRequirement
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
    // Prevent infinite loops
    if (visited.has(quest.QuestName)) {
        return null;
    }
    visited.add(quest.QuestName);

    // If this quest itself is a failed MustRequirement, return it
    if (quest.MustRequirement && quest.SolveStatus === "Failed") {
        return quest.QuestName;
    }

    // If this quest failed and has requirements, check if any requirement is a failed MustRequirement
    if (quest.SolveStatus === "Failed" && quest.Requirement?.length) {
        for (const requiredQuestName of quest.Requirement) {
            const requiredQuest = allQuests.find(q => q.QuestName === requiredQuestName);
            if (!requiredQuest) continue;

            // Direct check: Is this requirement a failed MustRequirement?
            if (requiredQuest.MustRequirement && requiredQuest.SolveStatus === "Failed") {
                return requiredQuestName;
            }

            // Recursive check: Did this requirement fail due to a MustRequirement?
            if (requiredQuest.SolveStatus === "Failed") {
                const root = findRootFailedMustRequirement(requiredQuest, allQuests, new Set(visited));
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