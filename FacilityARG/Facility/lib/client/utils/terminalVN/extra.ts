/**
 * Terminal VN Engine - Utility Functions
 * Helper functions for working with VN scripts and the engine
 */

import type {TerminalVNScript} from '@/types/terminalVN';

/**
 * Extract all unique variable names used in a script
 */
export function extractVariables(script: TerminalVNScript): string[] {
    const variables = new Set<string>();
    const varPattern = /\{(\w+)}/g;
    const setPattern = /set\s+(\w+)/g;

    for (const node of Object.values(script.nodes)) {
        for (const line of node.lines) {
            // Extract from interpolations
            const matches = line.content.matchAll(varPattern);
            for (const match of matches) {
                variables.add(match[1]);
            }

            // Extract from set commands
            if (line.type === 'command' && line.content.startsWith('set')) {
                const setMatches = line.content.matchAll(setPattern);
                for (const match of setMatches) {
                    variables.add(match[1]);
                }
            }
        }
    }

    return Array.from(variables).sort();
}

/**
 * Generate a flowchart/graph representation of the script
 */
function generateFlowchart(script: TerminalVNScript): {
    nodes: Array<{ id: string; label: string }>;
    edges: Array<{ from: string; to: string; label?: string }>;
} {
    const nodes: Array<{ id: string; label: string }> = [];
    const edges: Array<{ from: string; to: string; label?: string }> = [];

    for (const [nodeId, node] of Object.entries(script.nodes)) {
        nodes.push({
            id: nodeId,
            label: nodeId.replace(/_/g, ' ').toUpperCase(),
        });

        // Add edges from jumps
        if (node.jump) {
            edges.push({
                from: nodeId,
                to: node.jump,
            });
        }

        // Add edges from choices
        for (const line of node.lines) {
            if (line.type === 'choice' && line.options) {
                for (const option of line.options) {
                    if (option.target) {
                        edges.push({
                            from: nodeId,
                            to: option.target,
                            label: option.text,
                        });
                    }
                }
            }
        }
    }

    return {nodes, edges};
}

/**
 * Count statistics about a script
 */
export function getScriptStats(script: TerminalVNScript): {
    nodeCount: number;
    dialogueCount: number;
    choiceCount: number;
    commandCount: number;
    inputCount: number;
    variableCount: number;
    branchCount: number;
} {
    let dialogueCount = 0;
    let choiceCount = 0;
    let commandCount = 0;
    let inputCount = 0;

    const flowchart = generateFlowchart(script);

    for (const node of Object.values(script.nodes)) {
        for (const line of node.lines) {
            switch (line.type) {
                case 'dialogue':
                    dialogueCount++;
                    break;
                case 'choice':
                    choiceCount++;
                    break;
                case 'command':
                    commandCount++;
                    break;
                case 'input':
                    inputCount++;
                    break;
            }
        }
    }

    return {
        nodeCount: Object.keys(script.nodes).length,
        dialogueCount,
        choiceCount,
        commandCount,
        inputCount,
        variableCount: extractVariables(script).length,
        branchCount: flowchart.edges.length,
    };
}

/**
 * Find all paths from start to a target node
 */
export function findPaths(
    script: TerminalVNScript,
    targetNode: string
): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    function dfs(currentNode: string, path: string[]) {
        if (currentNode === targetNode) {
            paths.push([...path]);
            return;
        }

        if (visited.has(currentNode)) {
            return; // Prevent infinite loops
        }

        visited.add(currentNode);
        const node = script.nodes[currentNode];

        if (!node) {
            visited.delete(currentNode);
            return;
        }

        // Check jump
        if (node.jump) {
            dfs(node.jump, [...path, node.jump]);
        }

        // Check choices
        for (const line of node.lines) {
            if (line.type === 'choice' && line.options) {
                for (const option of line.options) {
                    if (option.target) {
                        dfs(option.target, [...path, option.target]);
                    }
                }
            }
        }

        visited.delete(currentNode);
    }

    dfs('start', ['start']);
    return paths;
}

/**
 * Check if a node is reachable from start
 */
function isNodeReachable(
    script: TerminalVNScript,
    targetNode: string
): boolean {
    const visited = new Set<string>();

    function dfs(currentNode: string): boolean {
        if (currentNode === targetNode) {
            return true;
        }

        if (visited.has(currentNode)) {
            return false;
        }

        visited.add(currentNode);
        const node = script.nodes[currentNode];

        if (!node) {
            return false;
        }

        // Check jump
        if (node.jump && dfs(node.jump)) {
            return true;
        }

        // Check choices
        for (const line of node.lines) {
            if (line.type === 'choice' && line.options) {
                for (const option of line.options) {
                    if (option.target && dfs(option.target)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    return dfs('start');
}

/**
 * Find unreachable nodes
 */
export function findUnreachableNodes(script: TerminalVNScript): string[] {
    const unreachable: string[] = [];

    for (const nodeId of Object.keys(script.nodes)) {
        if (nodeId !== 'start' && !isNodeReachable(script, nodeId)) {
            unreachable.push(nodeId);
        }
    }

    return unreachable;
}

/**
 * Interpolate variables in a string
 */
export function interpolateVariables(
    text: string,
    variables: Record<string, any>
): string {
    return text.replace(/\{(\w+)}/g, (match, varName) => {
        const value = variables[varName];
        return value !== undefined ? String(value) : match;
    });
}

/**
 * Serialize script to JSON
 */
export function serializeScript(script: TerminalVNScript): string {
    return JSON.stringify(script, null, 2);
}

/**
 * Deserialize script from JSON
 */
export function deserializeScript(json: string): TerminalVNScript {
    return JSON.parse(json);
}

/**
 * Export script to downloadable file
 */
export function downloadScript(
    script: TerminalVNScript,
    filename: string = 'script.json'
): void {
    const json = serializeScript(script);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Validate variable types
 */
export function validateVariableTypes(
    variables: Record<string, any>,
    schema: Record<string, string>
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [varName, expectedType] of Object.entries(schema)) {
        const actualValue = variables[varName];
        const actualType = typeof actualValue;

        if (actualType !== expectedType) {
            errors.push(
                `Variable "${varName}" expected type "${expectedType}" but got "${actualType}"`
            );
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
