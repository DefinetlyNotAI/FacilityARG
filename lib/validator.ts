import {PROTECTED_KEYWORDS, QuestData} from "@/lib/types";

export function validateUniqueNames(quests: QuestData[]): void {
    const questNames = new Set<string>();
    const missNames = new Set<string>();

    quests.forEach((quest) => {
        if (PROTECTED_KEYWORDS.includes(quest.QuestName)) {
            console.error(`Quest name "${quest.QuestName}" is a protected keyword and cannot be used`);
        }
        if (questNames.has(quest.QuestName)) {
            console.error(`Duplicate quest name found: ${quest.QuestName}`);
        } else {
            questNames.add(quest.QuestName);
        }

        if (quest.MissName) {
            if (missNames.has(quest.MissName)) {
                console.error(`Duplicate miss name found: ${quest.MissName}`);
            } else {
                missNames.add(quest.MissName);
            }
        }

        validateQuestSchema(quest);
    });

    // Validate circular dependencies
    validateCircularDependencies(quests);
}

function validateQuestSchema(quest: QuestData): void {
    // Case 1: MissName is set but MissInfo is missing
    if (quest.MissName && !quest.MissInfo) {
        console.error(`Quest '${quest.QuestName}' has MissName but no MissInfo`);
    }
    // Case 2: failIfFailed or failIfPending is set, but either MissName or MissInfo is missing
    if ((quest.failIfFailed || quest.failIfPending) && (!quest.MissName || !quest.MissInfo)) {
        console.error(`Quest '${quest.QuestName}' has failIfFailed/failIfPending but is missing MissName or MissInfo`);
    }
    // Case 3: MissInfo is set but MissName is missing
    if (!quest.MissName && quest.MissInfo) {
        console.warn(`Quest '${quest.QuestName}' contains MissInfo but no MissName`);
    }
    // Case 4: Secret is set but SecretHint is missing
    if (quest.Secret && !quest.SecretHint) {
        console.error(`Quest '${quest.QuestName}' is a secret but has no SecretHint`);
    }
    // Case 5: SecretHint is set but Secret is missing
    if (quest.SecretHint && !quest.Secret) {
        console.warn(`Quest '${quest.QuestName}' contains a secret hint but has no secret tag`);
    }
    // Case 6: Quest is marked as Solved but QuestCredit info is missing
    if ((!quest.QuestCredit?.name || !quest.QuestCredit?.date) && quest.SolveStatus === "Solved") {
        console.error(`Quest '${quest.QuestName}' is missing QuestCredit info while marked as Solved`);
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
    }
}

function validateCircularDependencies(quests: QuestData[]): void {
    const questMap = new Map(quests.map(q => [q.QuestName, q]));
    
    // Check for circular dependencies in regular requirements
    for (const quest of quests) {
        if (hasCircularDependency(quest, questMap, new Set(), 'requirement')) {
            console.error(`CIRCULAR DEPENDENCY DETECTED: Quest '${quest.QuestName}' has circular requirement dependencies`);
        }
    }
    
    // Check for circular dependencies in MustRequirements (CRITICAL)
    const mustRequirementQuests = quests.filter(q => q.MustRequirement);
    for (const quest of mustRequirementQuests) {
        if (hasCircularDependency(quest, questMap, new Set(), 'mustRequirement')) {
            console.error(`CRITICAL: CIRCULAR MUST REQUIREMENT DETECTED: Quest '${quest.QuestName}' has circular MustRequirement dependencies. This will cause infinite cascading failures. System startup should be refused.`);
            throw new Error(`CRITICAL: Circular MustRequirement dependency detected in quest '${quest.QuestName}'. System cannot start safely.`);
        }
    }
    
    // Check for circular dependencies in failure conditions
    for (const quest of quests) {
        if (quest.failIfFailed || quest.failIfPending) {
            const referencedQuests = extractQuestReferences(quest.failIfFailed) 
                .concat(extractQuestReferences(quest.failIfPending));
            
            for (const referencedQuest of referencedQuests) {
                if (referencedQuest === quest.QuestName) {
                    console.error(`SELF-REFERENCE DETECTED: Quest '${quest.QuestName}' references itself in failure conditions`);
                }
                
                if (hasCircularFailureDependency(quest.QuestName, referencedQuest, questMap, new Set())) {
                    console.error(`CIRCULAR FAILURE DEPENDENCY DETECTED: Quest '${quest.QuestName}' has circular failure dependencies with '${referencedQuest}'`);
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

function hasCircularFailureDependency(
    questName: string,
    targetQuest: string,
    questMap: Map<string, QuestData>,
    visited: Set<string>
): boolean {
    if (visited.has(targetQuest)) {
        return false; // Already checked this path
    }
    
    visited.add(targetQuest);
    
    const quest = questMap.get(targetQuest);
    if (!quest) return false;
    
    // Check if this quest's failure conditions reference the original quest
    const referencedQuests = extractQuestReferences(quest.failIfFailed)
        .concat(extractQuestReferences(quest.failIfPending));
    
    if (referencedQuests.includes(questName)) {
        return true; // Circular dependency found
    }
    
    // Recursively check referenced quests
    for (const referencedQuest of referencedQuests) {
        if (hasCircularFailureDependency(questName, referencedQuest, questMap, new Set(visited))) {
            return true;
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