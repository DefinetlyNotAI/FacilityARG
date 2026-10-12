// h0m3.tsx
// NOTE: Some text still exists in the JSX which are the dynamically changing parts from /home - For your sake don't change
export const h0m3 = {
    binaryCorruptText: "01001100 01100001 01110011 01110100 00100000 01110100 01101001 01101101 01100101 00100000 01110100 01101000 01101111 01110101 00100000 01101000 01100101 01110011 01101001 01110100 01100001 01110100 01100101 01100100 00101100 00100000 01101001 01110100 00100000 01100110 01101111 01110101 01101110 01100100 00100000 01110100 01101000 01101001 01101110 01100101",
    // 66:66 in hex
    hexCorruptText: "36363A3636",
    ttsMessages: [
        "RUN FROM HERE.",
        "STOP WHAT YOU ARE DOING.",
        "ESCAPE.",
        "THIS IS NOT SAFE.",
        "TURN BACK NOW.",
        "YOU ARE BEING WATCHED."
    ],
    ttsMessageID: (sessionID: string): string => `Y0U SHOULD NOT BE HERE ${sessionID}`,
    glitchMessages: [
        '█████ ERROR █████',
        'MEMORY LEAK DETECTED',
        'STACK OVERFLOW',
        'SEGMENTATION FAULT',
        'KERNEL PANIC',
        'SYSTEM CORRUPTED',
        'REALITY.EXE HAS STOPPED WORKING'
    ],
    corruptionConsoleMessages: [
        (level: number) => console.error(`CORRUPTION LEVEL: ${level}`),
        (level: number) => console.error(`SYSTEM INTEGRITY: COMPROMISED - ID${level}`),
        (level: number) => console.error(`THE TREE GROWS THROUGH THE CODE - now ${level} times`)
    ],
    buttons: {
        reset: "RESET",
        why: "なぜ • لماذا • Pourquoi • Warum"
    }
}
