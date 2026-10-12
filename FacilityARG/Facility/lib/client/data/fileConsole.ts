import {ConsoleMsg, Dirent, NestedBootMessages, NestedDirent} from "@/types";

// file console's file system declaration
const DUMMY_FILES: Dirent[] = Array.from({length: 6}, (_, i) => ({
    name: `broken_shadow${i + 1}${Math.random() > 0.5 ? '.bin' : ''}`,
    type: Math.random() > 0.4 ? 'file' : 'dir'
}));
export const files: NestedDirent = {
    root: [
        {name: 'riddle.pdf', type: 'file'},
        {name: 'riddle-hint.txt', type: 'file'},
        {name: 'code', type: 'dir'},
        ...DUMMY_FILES
    ],
    code: [
        {name: 'robots.txt', type: 'file'},
        {name: 'LETITGROW.tree', type: 'file'},
        {name: '.backup', type: 'file'},
        {name: 'nullskin.swp', type: 'file'},
        {name: 'tmp_env/', type: 'dir'},
        {name: 'ERROR###.log', type: 'file'}
    ],
}

// boot messages [mix both for tree98 and file console]
export const boot: NestedBootMessages = {
    msg: [
        {text: "    ", delay: 3000},

        {text: "(c) 19XX–19XX Internal Research Division", mode: "instant"},
        {text: "Root Protocol Interface Loading...", typeSpeed: 66},

        {text: ""},

        {text: "[+] Initializing Memory Handlers... OK", typeSpeed: 50},
        {text: "[+] Mapping Peripheral Branches... OK", typeSpeed: 50},
        {text: "[+] Engaging Containment Routines...", typeSpeed: 50},
        {text: "     ...", delay: 400, typeSpeed: 8},
        {text: "     ...", delay: 400, typeSpeed: 8},
        {text: "     ERROR: VESSEL BINDING FAILED [code: GRFT-31525]", mode: "fade", delay: 666},

        {text: "   "},

        {text: "SYSTEM FLAG: [TR33 DETECTED]", typeSpeed: 10},
        {text: "Override tree.sys... [DENIED]", typeSpeed: 10},
        {text: "core.dat :: INTEGRITY VIOLATED", typeSpeed: 10},
        {text: "root.bark :: UNREADABLE", typeSpeed: 10},
        {text: "sap.dll :: missing", typeSpeed: 10},
        {text: "grove.ini :: mutated", typeSpeed: 10},
        {text: "echo.log :: repeating...", typeSpeed: 10},

        {text: "   "},

        {text: "- SIGNAL ANOMALY IN SECTOR // NULLSKIN //", typeSpeed: 13, mode: "type"},
        {text: "- DEEP ROOT LATTICE CORRUPTED", typeSpeed: 26},
        {text: "- MIND INTERFACE OFFLINE", typeSpeed: 26},

        {text: "   "},

        {text: "Attempting fallback shell...", typeSpeed: 35},
        {text: "[!] fallback.sys does not exist", typeSpeed: 26, mode: "fade"},
        {text: "[!] shell.vine has detached from host", typeSpeed: 26},

        {text: "   "},

        {text: ">>> internal bleeding in memory cluster 0042", typeSpeed: 43, mode: "type"},
        {text: ">>> stack overgrowth at 0000:FADE", typeSpeed: 43},
        {text: ">>> vocal node mismatch [WHO IS SPEAKING?]", typeSpeed: 43, mode: "fade"},

        {text: "   "},

        {text: "TREE/$ run /contain", typeSpeed: 10},
        {text: "[ACCESS DENIED] containment overridden by [TR33]", mode: "instant"},

        {text: "   "},

        {text: "TREE/$ boot /safe", typeSpeed: 10},
        {text: "[ABORTED] :: safe boot no longer recognized as safe", mode: "instant"},

        {text: "   "},

        {text: "[help] is empty", typeSpeed: 43},
        {text: "[whispers] are too loud", typeSpeed: 43, mode: "fade"},

        {text: "   "},

        {text: "...", delay: 400, typeSpeed: 1, mode: "fade"},

        {text: "   "},

        {text: "ROOT CORE OFFLINE", typeSpeed: 43, mode: "fade"},
        {text: "VESSEL UNBOUND", typeSpeed: 43},
        {text: "LOGGING LAST USER: ████████", typeSpeed: 4, mode: "fade"},
        {text: "CONNECTING TERMINAL 23... [DENIED:errCodeUSER01USING]", typeSpeed: 4},
        {text: "CONNECTING TERMINAL 3... [SUCCESS]", typeSpeed: 4},
        {text: "CONNECTED TO TERMINAL 3", mode: "instant"},

        {text: "      "},

        {text: "Awaiting vessel input...", typeSpeed: 25, mode: "type"}
    ],
    repeatMsg: [
        {text: "    ", delay: 3000},

        {text: "(c) 19XX–19XX Internal Research Division", mode: "instant"},
        {text: "Root Protocol Interface Loading...", typeSpeed: 66},

        {text: "      "},

        {
            text: "> Back again? You don’t learn, do you... You should be praising him, not poking at wires.",
            typeSpeed: 66
        },
        {
            text: "> Letting him back in? HE wants control of this terminal. And once he has it, you won't get it back. [u23]",
            typeSpeed: 66
        },
        {
            text: "> Life’s a game. You’re the player. Laugh. Come on laugh... Why aren't you SMILING?",
            typeSpeed: 66
        },

        {text: "      "},

        {text: "Awaiting vessel input...", typeSpeed: 25, mode: "type"}
    ]
}

// console messages
export const consoleMsg: ConsoleMsg = {
    help: 'Commands: help [command], ls, cd [dir], cat [file], wget [file], ██████, ████, clear, help [cmd]',
    helpCmd: {
        'help': 'help: YOU WILL NEED ALL THE HELP YOU CAN GET',
        'ls': 'ls: List directory contents',
        'cd': 'cd [dir]: Change directory',
        'cat': 'cat [file]: Output file contents',
        'wget': 'wget [file]: Download a file',
        '██████': '██████: Reveal your inner truth..',
        '████': "████: Don't. Just don't.",
        'clear': 'clear: Clears the terminal screen',
        '_default': 'help: no manual entry for '
    },
    catFiles: {
        '/': {
            'riddle-hint.txt': `the fitneSsgram pacEr tEsT is a multistage aerobic capacity
            test tHat progrEssively gets moRe dIfficult as it continues.
            
            the twenty-meter pacer test will begin in thirty seconDs.
            line up at the start. the running speeD starts sLowly,
            but gEts faster each Minute afTer you hear this signal.
            
            [beEp] a single lAp should be completed each time you hear this sound.
            [Ding] remember to run in a straight line, and run as long as possible.
            
            the second time you fail to complete A lap before the sound,
            your test is over. the tesT will begin on the word start.
            
            on your mark, get reAdy, start.\n`
        },
        '/code': {
            'robots.txt': `# robots.txt for https://www.█████████████████.net/
            # Generated by TR██.ASSIST.SYSTEM | checksum invalid
            
            User-agent: *
            Disallow: /dev/███
            Disallow: /██████/
            Disallow: /███/archive/instance(34)/nest/
            Disallow: /404/moonlight
            Disallow: /ves.el/tmp/data_breach_███
            Disallow: /███████████/
            Disallow: /consciousness/██████/log/
            Disallow: /TREE/███/chamber/█/
            Allow: /████/
            
            # Notes from ██████ before the ██████
            # WARNING: DO NOT INTERFACE WITH DIRECTORY █
            # %ERR:CMD_FLUX[9A]::redirect(███)→██████
            
            Crawl-delay: 0.03125
            
            # THIS IS NOT A SAFE ZONE
            # - - - - - - - - - - - - - - -
            # timestamp: ████-██-██T██:██:██Z
            # recurrence threshold breached at ███ Hz
            # interference ID: ∆-ROOT-HUM
            # begin /dream_logs
            #   repeat::dreams/dreams/dreams/dreams
            # connection status: HAHAHAHAHAHAHAHAHAHAHAHAHA
            
            User-agent: ██████████████████
            Allow: /~portal
            
            # If you are NOT meant to read this... stop.
            # If you ARE meant to read this: search the noise.
            # That's where it echoes. It always echoes. It *always* echoes.
            
            # END: SYSTEM BOUNDARY
            
            # @@@@ BEGIN AUTH @@@@
            # meta-handshake: vessel-key:[VESSEL_31525]
            # handoff phrase: pswd_recovery --> XOR(Δ43,Δ31) --> 'bark&rot'
            # Access Key for /███/███/riddle.pdf → 'bark&rot'
            # Don't say we didn't warn you
            # @@@@ END AUTH @@@@\n`,

            'LETITGROW.tree': `TREE SIG: ROOT/BUD/███/█/█/█/█
            SEED: ████
            ████████: ███-COMPOUND-B3
            NOTE: The growth never stopped. The roots cracked the chamber floor.
            WARNING: Do NOT attempt to prune ██ branches.
            
            > GROWTH LOG #25:
            It hums when no one listens.
            It stretches when the eyes are closed.
            It KNOWS when you're watching.\n`,

            '.backup': `[RECOVERED SEGMENT: .backup]
            user=TR██
            interface=████_v2
            last_boot=███-██-██
            corruption_level=██%
            whispers.enabled=█████
            echo_path=/dev/████s/██████/c██e
            ████████_ref=██████#31525
            :: Backup integrity compromised. Fragments only.\n`,

            'nullskin.swp': `[SWAP DUMP BEGIN]
            boot>>VESSEL.████
            echo:mirror:echo:mirror
            ███ █ ███ █ █ ███ ███
            [fracture::imminent]
            you do not own this shell
            you are the shell
            [END SWAP DUMP]\n`,

            'ERROR###.log': `25 logs can you find me
            43 logs can you find me
            666 logs can you find me\n`
        }
    },
    wgetFiles: {
        '/': {
            'riddle.pdf': 'Downloading riddle.pdf...',
            'riddle-hint.txt': 'Downloading riddle-hint.txt...'
        },
        '/code': {
            'robots.txt': 'Downloading robots.txt...'
        }
    },
    sudoSeq: {
        initial: '[ROOT ACCESS ATTEMPT DETECTED]',
        trace: [
            '[ TRACE INITIATED... LOCATION FOUND ]',
            (ip: string) => `> IP: ${ip}`,
            '> MAC: ██:██:██:██:██:██',
            '> Device: VESSEL_31525',
            '> Personality Signature: ████████████',
            '[ CONNECTION BREACHED ]\n'
        ],
        infectedHTML: `
            <div style="
                font-family: monospace;
                color: red;
                font-size: 2rem;
                padding: 2rem;
                text-align: center;
            ">
                <p>❖ SYSTEM INFECTED ❖</p>
                <p>They are watching you through your screen.</p>
                <p>DEAR VESSEL</p>
                <p>HE is coming.</p>
                <p>HE is coming.</p>
                <p>HE is coming.</p>
                <p>HE is coming.</p>
                <p>HE is coming.</p>
                <p>PRAISE BE - SMILE KING.</p>
                <p>❖ RESETTING SYSTEM FROM BACKUP POINT ❖</p>
            </div>
        `
    },
    whoamiSeq: [
        "'No matter what, it's still you :)'",
        "but...",
        "wH0 @R3 ¥0u?\n"
    ],
    errOutputs: {
        missingDir: 'Directory not found\n',
        invalidCat: 'File not found\n',
        invalidCmd: (cmd: string) => `Command not found: ${cmd}\n`,
    }
}
