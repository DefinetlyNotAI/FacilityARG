import {LogicOperator, PROTECTED_KEYWORDS, QuestData, Questline} from "./types";

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
        }));

        // First pass: initialize global questMap entries with autosolve and isLocked
        for (const quest of quests) {
            const globalQuest = questMap.get(quest.QuestName);
            if (globalQuest) {
                globalQuest.autoSolve = quest.autoSolve;
                globalQuest.isLocked = checkIfQuestIsLocked(globalQuest, Array.from(questMap.values()));
            }
        }

        let changed: boolean;
        do {
            changed = false;

            // Update lock status in each iteration
            for (const quest of quests) {
                const globalQuest = questMap.get(quest.QuestName);
                if (globalQuest) {
                    const newLock = checkIfQuestIsLocked(globalQuest, Array.from(questMap.values()));
                    if (globalQuest.isLocked !== newLock) {
                        changed = true;
                        globalQuest.isLocked = newLock;
                    }
                }
            }

            // Apply fail logic
            for (const quest of quests) {
                const globalQuest = questMap.get(quest.QuestName);
                if (globalQuest && globalQuest.SolveStatus !== "Failed") {
                    if (checkIfQuestShouldFail(globalQuest, Array.from(questMap.values()))) {
                        changed = true;
                        globalQuest.SolveStatus = "Failed";
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


function validateUniqueNames(quests: QuestData[]): void {
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
}

function validateQuestSchema(quest: QuestData): void {
    if (quest.MissName && !quest.MissInfo) {
        console.error(`Quest ${quest.QuestName} has MissName but no MissInfo`);
    }
    if (!quest.MissName && quest.MissInfo) {
        console.warn(`Quest ${quest.QuestName} contains MissInfo but no MissName`);
    }
    if (quest.Secret && !quest.SecretHint) {
        console.error(`Quest ${quest.QuestName} is a secret but has no SecretHint`);
    }
    if (quest.SecretHint && !quest.Secret) {
        console.warn(`Quest ${quest.QuestName} contains a secret hint but has no secret tag`);
    }
    if (quest.failIfFailed && (!quest.MissName || !quest.MissInfo)) {
        console.error(`Quest ${quest.QuestName} has failIfFailed but is missing MissName or MissInfo`);
    }
    if ((!quest.QuestCredit?.name || !quest.QuestCredit?.date) && quest.SolveStatus === "Solved") {
        console.error(`Quest ${quest.QuestName} is missing QuestCredit info while marked as Solved`);
    }
}

function checkIfQuestIsLocked(quest: QuestData, allQuests: QuestData[]): boolean {
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
    if (!quest.failIfFailed) return false;

    const raw = quest.failIfFailed;
    const fragments = raw.split(/(AND|OR|XOR|NAND|NOR|\(|\))/g).map((s) => s.trim()).filter(Boolean);
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

    return evaluateFailCondition(tokens, allQuests);
}

function evaluateFailCondition(condition: (string | LogicOperator | "(" | ")")[], allQuests: QuestData[]): boolean {
    let pos = 0;
    const resolveStatus = (questName: string): boolean => {
        const quest = allQuests.find((q) => q.QuestName === questName);
        if (!quest) {
            console.error(`Quest "${questName}" not found in allQuests.`);
            throw new Error(`Quest "${questName}" is undefined.`);
        }
        return quest?.SolveStatus === "Failed";
    };

    const topLevelOperators = new Set<LogicOperator>();
    let depth = 0;
    for (let i = 0; i < condition.length; i++) {
        const token = condition[i];
        if (token === "(") {
            depth++;
        } else if (token === ")") {
            depth--;
        } else if (depth === 0 && PROTECTED_KEYWORDS.includes(token as LogicOperator)) {
            topLevelOperators.add(token as LogicOperator);
        }
    }
    if (topLevelOperators.size > 1) {
        console.warn(`Warning: Multiple different logic operators used without parentheses: ${Array.from(topLevelOperators).join(", ")}`);
    }

    function parseExpression(): boolean {
        let value = parseTerm();
        while (pos < condition.length && (condition[pos] === "OR" || condition[pos] === "NOR" || condition[pos] === "XOR")) {
            const op = condition[pos++] as LogicOperator;
            const right = parseTerm();
            switch (op) {
                case "OR":
                    value = value || right;
                    break;
                case "NOR":
                    value = !(value || right);
                    break;
                case "XOR":
                    value = value !== right;
                    break;
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
                case "AND":
                    value = value && right;
                    break;
                case "NAND":
                    value = !(value && right);
                    break;
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
