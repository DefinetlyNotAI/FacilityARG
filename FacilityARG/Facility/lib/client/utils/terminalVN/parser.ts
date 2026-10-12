/**
 * Terminal VN Script Parser
 *
 * Script Syntax:
 *
 * # Node Definition
 * @node node_id
 *
 * # Dialogue
 * > Speaker: Text here
 * > Text without speaker
 *
 * # Commands
 * $ set variableName = value
 * $ add variableName 10
 * $ sub variableName 5
 * $ mul variableName 2
 * $ div variableName 4
 * $ log Message to display
 * $ clear
 *
 * # Choices
 * ? Choice prompt
 * - Option 1 -> node_id
 * - Option 2 -> another_node
 * - Option 3 [condition] -> conditional_node
 *
 * # Input
 * ? {variableName} Prompt text
 *
 * # Jump
 * @jump node_id
 *
 * # Conditional Lines
 * [condition] > Text that only shows if condition is true
 */

import type {TerminalVNScript, VNLine, VNNode, VNOption} from '@/types';

export class VNParseError extends Error {
    constructor(message: string, line?: number) {
        super(line !== undefined ? `Line ${line}: ${message}` : message);
        this.name = 'VNParseError';
    }
}

export function parseVNScript(script: string): TerminalVNScript {
    const rawLines = script.split('\n');
    const nodes: Record<string, VNNode> = {};

    let currentNode: VNNode | null = null;
    let currentChoice: VNLine | null = null;
    let lineNumber = 0;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockSpeaker: string | undefined;
    let codeBlockCondition: string | undefined;

    const metadata: any = {};

    for (let i = 0; i < rawLines.length; i++) {
        lineNumber = i + 1;
        const originalLine = rawLines[i];
        const line = originalLine.trim();

        // Handle code blocks
        if (line === '```' || line.startsWith('```')) {
            if (!inCodeBlock) {
                // Starting a code block
                inCodeBlock = true;
                codeBlockContent = [];
                continue;
            } else {
                // Ending a code block - add as dialogue
                inCodeBlock = false;
                if (currentNode) {
                    if (currentChoice) {
                        currentNode.lines.push(currentChoice);
                        currentChoice = null;
                    }
                    // Join code block content with newlines, preserving original formatting
                    const dialogueLine: VNLine = {
                        type: 'dialogue',
                        content: '```\n' + codeBlockContent.join('\n') + '\n```',
                    };
                    if (codeBlockSpeaker) {
                        dialogueLine.speaker = codeBlockSpeaker;
                    }
                    if (codeBlockCondition) {
                        dialogueLine.condition = codeBlockCondition;
                    }
                    currentNode.lines.push(dialogueLine);
                }
                codeBlockContent = [];
                codeBlockSpeaker = undefined;
                codeBlockCondition = undefined;
                continue;
            }
        }

        // If we're in a code block, collect the original line (preserving whitespace)
        if (inCodeBlock) {
            codeBlockContent.push(originalLine);
            continue;
        }

        // Skip empty lines and comments
        if (!line || line.startsWith('//') || line.startsWith('#')) {
            // Close any pending choice block on empty lines
            if (!line && currentChoice && currentNode) {
                currentNode.lines.push(currentChoice);
                currentChoice = null;
            }

            // Check for metadata comments
            if (line.startsWith('# title:')) {
                metadata.title = line.substring(8).trim();
            } else if (line.startsWith('# author:')) {
                metadata.author = line.substring(9).trim();
            } else if (line.startsWith('# version:')) {
                metadata.version = line.substring(10).trim();
            } else if (line.startsWith('# autoclear:')) {
                metadata.autoclear = line.substring(12).trim();
            }
            continue;
        }

        // Node definition
        if (line.startsWith('@node ')) {
            // Close any pending choice block before starting new node
            if (currentChoice && currentNode) {
                currentNode.lines.push(currentChoice);
                currentChoice = null;
            }

            const nodeId = line.substring(6).trim();
            if (!nodeId) {
                throw new VNParseError('Node ID cannot be empty', lineNumber);
            }

            if (currentNode) {
                nodes[currentNode.id] = currentNode;
            }

            currentNode = {
                id: nodeId,
                lines: [],
            };
            continue;
        }

        // Jump directive
        if (line.startsWith('@jump ')) {
            if (!currentNode) {
                throw new VNParseError('Jump directive outside of node', lineNumber);
            }

            const targetNode = line.substring(6).trim();
            if (!targetNode) {
                throw new VNParseError('Jump target cannot be empty', lineNumber);
            }

            currentNode.jump = targetNode;
            continue;
        }

        // Ensure we're in a node
        if (!currentNode) {
            currentNode = {
                id: 'start',
                lines: [],
            };
        }

        // Parse conditional prefix
        let condition: string | undefined;
        let workingLine = line;

        const conditionMatch = line.match(/^\[([^\]]+)]\s*(.+)$/);
        if (conditionMatch) {
            condition = conditionMatch[1].trim();
            workingLine = conditionMatch[2].trim();
        }

        // Dialogue line
        if (workingLine.startsWith('> ')) {
            if (currentChoice) {
                currentNode.lines.push(currentChoice);
                currentChoice = null;
            }

            const content = workingLine.substring(2).trim();
            const speakerMatch = content.match(/^([^:]+):\s*(.+)$/);

            let speaker: string | undefined;
            let dialogueContent: string;

            if (speakerMatch) {
                speaker = speakerMatch[1].trim();
                dialogueContent = speakerMatch[2].trim();
            } else {
                dialogueContent = content;
            }

            // Check if this dialogue line starts a code block
            if (dialogueContent === '```' || dialogueContent.endsWith('```')) {
                // Start collecting code block content
                inCodeBlock = true;
                codeBlockContent = [];
                codeBlockSpeaker = speaker;
                codeBlockCondition = condition;

                // If there's content before ```, include it
                if (dialogueContent !== '```') {
                    const beforeCode = dialogueContent.substring(0, dialogueContent.length - 3).trim();
                    if (beforeCode) {
                        codeBlockContent.push(beforeCode);
                    }
                }

                // Continue to next line to collect code block
                continue;
            }

            currentNode.lines.push({
                type: 'dialogue',
                speaker,
                content: dialogueContent,
                condition,
            });
            continue;
        }

        // Command line
        if (workingLine.startsWith('$ ')) {
            if (currentChoice) {
                currentNode.lines.push(currentChoice);
                currentChoice = null;
            }

            const command = workingLine.substring(2).trim();
            currentNode.lines.push({
                type: 'command',
                content: command,
                condition,
            });
            continue;
        }

        // Choice or Input
        if (workingLine.startsWith('? ')) {
            if (currentChoice) {
                currentNode.lines.push(currentChoice);
            }

            const prompt = workingLine.substring(2).trim();

            // Check if it's an input (has variable placeholder)
            const inputMatch = prompt.match(/^\{(\w+)}\s*(.*)$/);
            if (inputMatch) {
                currentNode.lines.push({
                    type: 'input',
                    content: inputMatch[2].trim() || `Enter value for ${inputMatch[1]}:`,
                    condition,
                });
                currentChoice = null;
            } else {
                currentChoice = {
                    type: 'choice',
                    content: prompt,
                    options: [],
                    condition,
                };
            }
            continue;
        }

        // Choice option
        if (workingLine.startsWith('- ') && currentChoice) {
            const optionText = workingLine.substring(2).trim();

            // Parse option with target and condition
            // Format: - Text [condition] -> target
            const optionMatch = optionText.match(/^(.+?)(?:\s*\[([^\]]+)])?\s*(?:->\s*(.+))?$/);

            if (optionMatch) {
                const option: VNOption = {
                    text: optionMatch[1].trim(),
                };

                if (optionMatch[2]) {
                    option.condition = optionMatch[2].trim();
                }

                if (optionMatch[3]) {
                    option.target = optionMatch[3].trim();
                }

                currentChoice.options!.push(option);
            } else {
                throw new VNParseError('Invalid choice option format', lineNumber);
            }
            continue;
        }

        // Unknown line format
        if (workingLine && !workingLine.startsWith('//')) {
            throw new VNParseError(`Unknown line format: ${workingLine}`, lineNumber);
        }
    }

    // Add final choice if exists
    if (currentChoice && currentNode) {
        currentNode.lines.push(currentChoice);
    }

    // Add final node
    if (currentNode) {
        nodes[currentNode.id] = currentNode;
    }

    // Validate that 'start' node exists
    if (!nodes.start) {
        throw new VNParseError('Script must have a "start" node');
    }

    const parsedScript: TerminalVNScript = {
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        nodes,
    };

    // Validate the script for structural issues
    const validation = validateScript(parsedScript);
    if (!validation.valid) {
        const errorMessages = validation.errors.join('\n');
        throw new VNParseError(`Script validation failed:\n${errorMessages}`);
    }

    return parsedScript;
}

/**
 * Validate a parsed script
 */
export function validateScript(script: TerminalVNScript): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for orphaned jumps
    for (const [nodeId, node] of Object.entries(script.nodes)) {
        if (node.jump && !script.nodes[node.jump]) {
            errors.push(`Node "${nodeId}" jumps to non-existent node "${node.jump}"`);
        }

        // Check choice targets
        for (const line of node.lines) {
            if (line.type === 'choice' && line.options) {
                for (const option of line.options) {
                    if (option.target && !script.nodes[option.target]) {
                        errors.push(`Choice in node "${nodeId}" targets non-existent node "${option.target}"`);
                    }
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
