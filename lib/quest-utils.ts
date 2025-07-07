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
        processQuestsUntilConvergence(Array.from(questMap.values()));

        return {
            ...questline,
            quests: quests.map(q => questMap.get(q.QuestName) || q),
        };
    });
}

function processQuestsUntilConvergence(allQuests: QuestData[]): void {
    let changed: boolean;
    let iterationCount = 0;
    const maxIterations = 200;

    do {
        changed = false;
        iterationCount++;

        if (iterationCount > maxIterations) {
            console.warn("Maximum iterations reached in quest processing. Possible circular dependency or very complex dependency chain.");
            break;
        }

        // Phase 1: Apply MustRequirement cascading failures FIRST (overrides manual locks)
        const mustReqFailures = applyMustRequirementCascading(allQuests);
        if (mustReqFailures > 0) {
            changed = true;
        }

        // Phase 2: Update lock status for all quests (after MustRequirement failures)
        const lockChanges = updateAllQuestLocks(allQuests);
        if (lockChanges > 0) {
            changed = true;
        }

        // Phase 3: Apply regular fail logic for all quests (after locks are updated)
        const regularFailures = applyRegularFailLogic(allQuests);
        if (regularFailures > 0) {
            changed = true;
        }

        // Phase 4: Apply auto-solve logic for all quests
        const autoSolves = applyAutoSolveLogic(allQuests);
        if (autoSolves > 0) {
            changed = true;
        }

    } while (changed);

    // console.log(`Quest processing converged after ${iterationCount} iterations`);
}

function updateAllQuestLocks(allQuests: QuestData[]): number {
    let changes = 0;

    for (const quest of allQuests) {
        // Skip lock updates for failed quests (they should remain accessible for viewing)
        if (quest.SolveStatus === "Failed") {
            if (quest.isLocked) {
                quest.isLocked = false;
                changes++;
            }
            continue;
        }

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
        // Skip if already failed or if it would fail due to MustRequirement (handled separately)
        if (quest.SolveStatus !== "Failed" && !getFailedMustRequirementInChain(quest, allQuests)) {
            if (checkIfQuestShouldFail(quest, allQuests)) {
                quest.SolveStatus = "Failed";
                // Unlock failed quests so they can be viewed
                quest.isLocked = false;
                changes++;
                // console.log(`Quest '${quest.QuestName}' failed due to regular fail conditions`);
            }
        }
    }

    return changes;
}

function applyMustRequirementCascading(allQuests: QuestData[]): number {
    let changes = 0;

    for (const quest of allQuests) {
        if (quest.SolveStatus !== "Failed") {
            const failedMustReq = getFailedMustRequirementInChain(quest, allQuests);
            if (failedMustReq) {
                quest.SolveStatus = "Failed";
                // CRITICAL: MustRequirement failures override manual locks
                quest.isLocked = false;
                changes++;

                // Set generic fail message for MustRequirement failures
                if (!quest.MissName) {
                    quest.MissName = quest.QuestName;
                    quest.MissInfo = `${quest.QuestName} failed due to a must requirement for {{ ${failedMustReq} }}`;
                }

                // console.log(`Quest '${quest.QuestName}' failed due to MustRequirement cascade from '${failedMustReq}' (manual lock overridden)`);
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
                    // console.log(`Quest '${quest.QuestName}' auto-solved`);
                } else if (anyRequirementFailed) {
                    quest.SolveStatus = "Failed";
                    changes++;
                    // console.log(`Quest '${quest.QuestName}' auto-failed`);
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
    const failDueToFailed = shouldFailBasedOnCondition(quest.failIfFailed, questMap, "Failed", false);

    // If the quest itself is locked, do not fail it due to failIfPending (ignore failIfPending logic entirely)
    if (quest.isLocked) {
        return failDueToFailed;
    }

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

    if (onlyIfUnlocked) {
        // Check if ANY referenced quest is locked
        const referencedQuests = tokens.filter(
            t => !PROTECTED_KEYWORDS.includes(t as LogicOperator) && t !== "(" && t !== ")"
        ) as string[];

        for (const questName of referencedQuests) {
            const q = questMap.get(questName);
            if (q?.isLocked) {
                return false; // Don't fail if any relevant quest is locked
            }
        }
    }

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
            // If quest is locked, and we're checking for Pending, treat as not pending for fail logic (do not fail locked quests)
            if (onlyIfUnlocked && quest.isLocked) {
                // Special case: If the quest is both Pending and Locked, treat as not pending (do not fail)
                return false;
            }
            return quest.SolveStatus !== "Solved" && quest.SolveStatus !== "Failed";
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

    // Add logging for when a quest gets failed due to fail condition
    if (result) {
        const questNames = condition.filter(
            t => !PROTECTED_KEYWORDS.includes(t as LogicOperator) && t !== "(" && t !== ")"
        ) as string[];
        console.log(
            `[Quest Fail] Condition met for status "${statusToCheck}"` +
            (questNames.length ? ` on quest(s): ${questNames.join(", ")}` : "") +
            ` | Condition: ${condition.map(String).join(" ")}`
        );
    }

    return result;
}
