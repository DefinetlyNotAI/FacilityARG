import {PROTECTED_KEYWORDS, QuestData, Questline} from "@/lib/types";

export function validateUniqueNames(quests: QuestData[]): void {
    const questNames = new Set<string>();
    const missNames = new Set<string>();

    quests.forEach((quest) => {
        if (PROTECTED_KEYWORDS.includes(quest.QuestName)) {
            console.error(`Quest name "${quest.QuestName}" is a protected keyword and cannot be used`);
            throw new Error(`Quest name "${quest.QuestName}" is a protected keyword and cannot be used. System will not start.`);
        }
        if (questNames.has(quest.QuestName)) {
            console.error(`Duplicate quest name found: ${quest.QuestName}`);
            throw new Error(`Duplicate quest name found: ${quest.QuestName}. System will not start.`);
        } else {
            questNames.add(quest.QuestName);
        }

        if (quest.MissName) {
            if (missNames.has(quest.MissName)) {
                console.error(`Duplicate miss name found: ${quest.MissName}`);
                throw new Error(`Duplicate miss name found: ${quest.MissName}. System will not start.`);
            } else {
                missNames.add(quest.MissName);
            }
        }

        validateQuestSchema(quest, quests);
    });

    // Validate circular dependencies
    validateCircularDependencies(quests);
}

function validateQuestSchema(quest: QuestData, quests: QuestData[]): void {
    // Case 1: MissName is set but MissInfo is missing
    if (quest.MissName && !quest.MissInfo) {
        console.warn(`Quest '${quest.QuestName}' has MissName but no MissInfo`);
    }
    // Case 2: failIfFailed or failIfPending is set, but either MissName or MissInfo is missing
    if ((quest.failIfFailed || quest.failIfPending) && (!quest.MissName || !quest.MissInfo)) {
        console.warn(`Quest '${quest.QuestName}' has failIfFailed/failIfPending but is missing MissName or MissInfo`);
    }
    // Case 3: MissInfo is set but MissName is missing
    if (!quest.MissName && quest.MissInfo) {
        console.warn(`Quest '${quest.QuestName}' contains MissInfo but no MissName`);
    }
    // Case 4: Secret is set but SecretHint is missing
    if (quest.Secret && !quest.SecretHint) {
        console.warn(`Quest '${quest.QuestName}' is a secret but has no SecretHint`);
    }
    // Case 5: SecretHint is set but Secret is missing
    if (quest.SecretHint && !quest.Secret) {
        console.warn(`Quest '${quest.QuestName}' contains a secret hint but has no secret tag`);
    }
    // Case 6: Quest is marked as Solved but QuestCredit info is missing
    if ((!quest.QuestCredit?.name || !quest.QuestCredit?.date) && quest.SolveStatus === "Solved") {
        console.warn(`Quest '${quest.QuestName}' is missing QuestCredit info while marked as Solved`);
    }
    // Case 7: Quest is marked as Solved but is also locked (inconsistent state)
    if (quest.SolveStatus === "Solved" && quest.isLocked) {
        console.warn(`Quest '${quest.QuestName}' is marked as Solved but is also locked, which is inconsistent and causes UI issues`);
    }
    // Case 8: Quest is Solved/Failed, has manualLock, and is locked (inconsistent state)
    else if ((quest.SolveStatus === "Solved" || quest.SolveStatus === "Failed") && quest.manualLock && quest.isLocked) {
        console.warn(`Quest '${quest.QuestName}' is marked as Solved/Failed but is also manually locked, which is inconsistent and causes UI issues, \nThe following issue stems from a manual lock on the quest as well as a manual status change. Please check the schema.`);
    }
    // Case 9: MustRequirement is set but the quest itself has no proper fail conditions
    if (quest.MustRequirement && (!quest.MissName || !quest.MissInfo)) {
        console.error(`Quest '${quest.QuestName}' is marked as MustRequirement but is missing MissName or MissInfo. MustRequirement quests must be properly failable - If quest should not be a failable requirement, remove the MustRequirement tag for the quest.`);
        throw new Error(`Quest '${quest.QuestName}' is marked as MustRequirement but is missing MissName or MissInfo. System will not start.`);
    }
    // Case 10: Quest is marked as Solved but has lock requirements that are not solved
    if (quest.SolveStatus === "Solved" && quest.Requirement && quest.Requirement.length > 0) {
        const unsolvedReqs = quest.Requirement.filter((reqName: string) => {
            const reqQuest = quests.find((q: QuestData) => q.QuestName === reqName);
            return reqQuest && reqQuest.SolveStatus !== "Solved";
        });
        if (unsolvedReqs.length > 0) {
            console.error(`Quest '${quest.QuestName}' is marked as Solved but has unsolved requirements: ${unsolvedReqs.join(", ")}, which is inconsistent and causes UI issues. Please check the schema.`);
        }
    }
}

function validateCircularDependencies(quests: QuestData[]): void {
    const questMap = new Map(quests.map(q => [q.QuestName, q]));

    // Check for circular dependencies in regular requirements
    for (const quest of quests) {
        if (hasCircularDependency(quest, questMap, new Set(), 'requirement')) {
            console.error(`Quest '${quest.QuestName}' has circular requirement dependencies`);
        }
    }

    // Check for circular dependencies in MustRequirements (CRITICAL)
    const mustRequirementQuests = quests.filter(q => q.MustRequirement);
    for (const quest of mustRequirementQuests) {
        if (hasCircularDependency(quest, questMap, new Set(), 'mustRequirement')) {
            console.error(`Quest '${quest.QuestName}' has circular MustRequirement dependencies. This will cause infinite cascading failures. System startup should be refused.`);
            throw new Error(`Circular MustRequirement dependency detected in quest '${quest.QuestName}'. System will not start.`);
        }
    }

    // Check for circular dependencies in failure conditions
    for (const quest of quests) {
        if (quest.failIfFailed || quest.failIfPending) {
            const referencedQuests = extractQuestReferences(quest.failIfFailed)
                .concat(extractQuestReferences(quest.failIfPending));

            for (const referencedQuest of referencedQuests) {
                if (referencedQuest === quest.QuestName) {
                    console.error(`Quest '${quest.QuestName}' references itself in failure conditions`);
                }
            }
        }
    }
}

function hasCircularDependency(
    quest: QuestData,
    questMap: Map<string, QuestData>,
    visited: Set<string>,
    type: 'requirement' | 'mustRequirement'
): boolean {
    if (visited.has(quest.QuestName)) {
        return true; // Circular dependency found
    }

    visited.add(quest.QuestName);

    if (quest.Requirement) {
        for (const reqName of quest.Requirement) {
            const reqQuest = questMap.get(reqName);
            if (reqQuest) {
                // For mustRequirement check, only follow the path if the requirement is also a MustRequirement
                if (type === 'mustRequirement' && !reqQuest.MustRequirement) {
                    continue;
                }

                if (hasCircularDependency(reqQuest, questMap, new Set(visited), type)) {
                    return true;
                }
            }
        }
    }

    return false;
}
function extractQuestReferences(condition: string | undefined): string[] {
    if (!condition) return [];

    const matches = condition.match(/\{\{\s*([^}]+)\s*}}/g);
    if (!matches) return [];

    return matches.map(match => match.replace(/\{\{\s*|\s*}}/g, '').trim());
}

export function validateAllQuestReferences(data: Questline[]): void {
    const allQuestsFlat: QuestData[] = data.flatMap(q => q.quests);
    const questNames = new Set(allQuestsFlat.map(q => q.QuestName));

    for (const questline of data) {
        for (const quest of questline.quests) {
            // Check Requirement references
            if (quest.Requirement) {
                for (const req of quest.Requirement) {
                    if (!questNames.has(req)) {
                        throw new Error(`Quest "${quest.QuestName}" in questline "${questline.questline_name}" references missing Requirement quest "${req}".`);
                    }
                }
            }
            // Check failIfFailed and failIfPending references
            for (const condField of ["failIfFailed", "failIfPending"] as const) {
                const cond = quest[condField];
                if (cond) {
                    const matches = cond.match(/\{\{\s*([^}]+)\s*}}/g);
                    if (matches) {
                        for (const match of matches) {
                            const refName = match.replace(/\{\{\s*|\s*}}/g, "");
                            if (!questNames.has(refName)) {
                                throw new Error(`Quest "${quest.QuestName}" ${condField} references missing quest "${refName}" in questline "${questline.questline_name}".`);
                            }
                        }
                    }
                }
            }
        }
    }
}