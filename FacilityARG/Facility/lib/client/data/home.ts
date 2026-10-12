// home.tsx
import {TextData} from "@/types";

// All static data used in the home page
export const data = {
    // Video path for the hollow pilgrimage
    hollowPilgrimagePath: {
        href: "/static/home/The_Hollow_Pilgrimage.mp4",
        title: "The_Hollow_Pilgrimage.mp4",
    },
    // Konami code sequence for special feature activation
    konamiSequence: [
        'ArrowUp', 'ArrowUp',
        'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight',
        'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ]
}

// All text used in the home page
export const text: TextData = {
    puzzlePanel: {
        binaryPuzzleVal: "01010111 01101000 01101001 01110011 01110000 01100101 01110010 01110011",
        timePuzzleVal: "15:25",
    },
    dataPanel: {
        title: "SYSTEM STATUS",
        subtitle: "Real-time Monitoring",
    },
    timePanel: {
        timeHex: {
            title: "When will you see?",
            subtitle: "Timestamp Anchor",
        },
        timeCountdown: {
            title: "SHUTDOWN TIMER",
            afterSubtitle: "Time Dissolved",
            beforeSubtitle: "Neural Sync Countdown",
        }
    },
    topBarPanel: {
        title: "NEURAL INTERFACE TERMINAL",
        subtitle: "Project VESSEL • Subject 31525 • Clearance HIGH",
        h1: "SECURE NEURAL LINK",
    },
    mainPanel: {
        title: "FACILITY 05-B",
        subtitle: "NEURAL INTERFACE RESEARCH COMPLEX",
        load: "INITIALIZING FACILITY SYSTEMS...",
        announcementBar: "TOP SECRET//SCI//E - FACILITY 05-B - PROJECT VESSEL - AUTHORIZED PERSONNEL ONLY",
        timeSubtitle: "VESSEL TIME",
    },
    logPanel: {
        title: "RESEARCH LOGS",
        subtitle: "Project VESSEL Documentation Archive.",
        corruptionWarn: "⚠️ DATA CORRUPTION DETECTED ⚠️",
        corruptionMsg: "This log file has been compromised by unknown interference. Some data may be\n" +
            "unreliable or have been altered by external forces. Proceed with caution."
    },
    securityPanel: {
        title: "SECURITY PROTOCOLS",
        subtitle: "Access Control & Monitoring",
        easterEggCountMsg: "How many will you see?",
    },
    terminalPanel: {
        lines: [
            {prompt: "FACILITY", text: "Neural Interface Research Complex 05-B"},
            {prompt: "PROJECT", text: "VESSEL - Connected as Subject 31525"},
            {prompt: "SUBJECT", text: "31525 - Neural compatibility: ??.?%"},
            {prompt: "STATUS", text: "Transfer sequence initiated"},
            {prompt: "DATA", text: "[NEURAL_DATA_STREAM]", dynamic: true},
            {prompt: "WARNING", text: "Temporal displacement detected in Terminal 5", warning: true}
        ]
    },
    securityData: [
        {title: "Scans", value: "1,247"},
        {title: "Breach Alerts", value: "43"},
        {title: "Active Personnel", value: "0"}
    ],
    sysMetricPanel: {
        title: "SYSTEM PERFORMANCE",
        subtitle: "Neural Processing Units",
    },
    sysIndicators: [
        "Neural Interface: ACTIVE",
        "Consciousness Monitor: DEACTIVATED",
        "Vessel Anchors: DEGRADED",
    ],
    alertsData: {
        title: "CRITICAL ALERTS",
        subtitle: "Active Incidents & Warnings",
        alerts: [
            {level: "warning", message: "Organic growth detected in [redacted]"},
            {level: "critical", message: "Subject 31525 connected to terminal [redacted]"},
            {level: "warning", message: "Displacement events in Test Chamber 3"},
            {level: "critical", message: "Reality anchor stability: Failing"},
            {level: "critical", message: "Unknown root systems breaching foundation"},
            {level: "warning", message: "??? reporting shared consciousness events"}
        ],
        refreshAlert: {
            level: "critical",
            message: "Persistent refresh pattern detected - [redacted] awareness confirmed",
            minRefreshCount: 5
        }
    },
    notifications: {
        title: "SYSTEM NOTIFICATION",
        accept: "ACKNOWLEDGE"
    },
    contactPanel: {
        emergency: [
            {label: "Neural Security", extension: "Ext. 2847"},
            {label: "Medical Emergency", extension: "Ext. 3156"},
            {label: "Technical Support", extension: "Ext. 4729"},
            {label: "Command Center", extension: "Ext. 1001"},
            {label: "Containment Breach", extension: "Ext. 0000", emergency: true},
        ],
        secret: {
            label: "Will you ever smile",
            extension: "When the time hits ∞",
            emergency: true,
            minRefreshCount: 25
        },
    },
    projectClassPanel: {
        title: "PROJECT CLASSIFICATION",
        subtitle: "Security Clearance Info",
        classifications: [
            {label: "Security Level", value: "HIGH", className: "cosmic"},
            {label: "Compartment Accessing", value: "SCI//VESSEL"},
            {label: "Project Code", value: "VESSEL-31525"},
            {label: "Facility ID", value: "05-B"},
            {
                label: "TREE Protocol",
                valueIfLow: "ACTIVE",
                valueIfHigh: "ALIVE",
                threshold: 15,
                classNameIfHigh: "text-red-400",
                classNameIfLow: "text-green-400"
            }
        ]
    },
    // System messages used for either notifications or TTS speech etc.
    systemMessages: {
        scroll: "System integrity verified. Proceed to the void.",
        time: "Time dissolves into the void... here, eternity and instant are one.",
        invalidLogPerm: "TREE System Authorisation - You do not have enough admin permissions to view this",
        wifiUnlocked: "Network access granted. Use curl/wget there with the prefix /api/ for a prize to the next ;)",
        hollowPilgrimage: "Welcome to hell - Cease your bleating - Isn't it you who seeks this crimson path? - So play the hollow pilgrimage",
        konamiUnlock: "You listened... So reap what you sowed.",
        refreshMessages: [
            {
                threshold: 5,
                message:
                    "Five refreshes... You're persistent. The tree notices persistence. Earn my trust to see more."
            },
            {
                threshold: 15,
                message:
                    "Fifteen refreshes... The roots whisper your name now. They remember you... They trust you."
            },
            {
                threshold: 25,
                message:
                    "Twenty five refreshes... You've fed the tree well. It smiles upon you, vessel. Seek the next step.",
                invert: true
            }
        ]
    },
    // Data for fake system metrics
    systemMetrics: {
        performanceData: [
            {label: "CPU Usage", value: "92%", status: "warning"},
            {label: "Memory", value: "68%"},
            {label: "Disk Space", value: "8 TB"},
            {label: "Network", value: "1.8 Gbps"},
            {label: "Threads Available", value: "4,218", status: "warning"},
            {label: "Power Draw", value: "1421W", status: "warning"},
        ],
        sensorData: [
            {label: "Temperature", key: "temperature", value: "22.7°C"},
            {label: "Pressure", key: "pressure", value: "1013.42 hPa"},
            {label: "Humidity", key: "humidity", value: "43%"},
            {label: "Radiation", key: "radiation", value: "0.09 μSv/h"},
            {label: "Power Output", key: "powerOutput", value: "2.4 MW"},
            {label: "Network", key: "networkStatus", value: "SECURE"}
        ],
        neuralUnits: {
            active: 12,
            warning: 9,
            critical: 3,
        }
    },
    // Research logs
    researchLogs: [
        {
            id: "LOG-001-VESSEL",
            title: "Neural Interface Synchronization Trial #1",
            researcher: "[REDACTED]",
            date: "2024-03-15",
            classification: "TOP SECRET",
            corrupted: false,
            content: `RESEARCH LOG
Date: March 15, 2024
Research Lead: [REDACTED]
Classification: TOP SECRET

Subject 31525 demonstrates strong compatibility with prototype neural interface hardware. 
Initial response time exceeds expectations. 
Memory cohesion across short-term transfer appears intact.

Summary of Metrics:
- Neural mapping: 97% complete
- Response latency: 0.003ms
- Memory retention: 99.7%
- Behavioral consistency: Stable

Mild irregularities noted in temporal lobe activity. 
EEG patterns do not match known baselines. 
Possible anomalies under review.

Recommend advancement to Phase 2 testing.

Note: Several technicians report recurring dreams after extended exposure to Subject. Monitoring advised.

– [REDACTED]`
        },
        {
            id: "LOG-002-BREACH",
            title: "Sector 7 - Containment Failure Report",
            researcher: "[REDACTED]",
            date: "[REDACTED]-03-18",
            classification: "SECRET",
            corrupted: true,
            content: `SECURITY REPORT
Date: March 18, [REDACTED]
Filed by: [REDACTED]
Classification: SECRET

Status:
- Personnel missing: ██
- Internal containment: Failed
- External perimeter: Compromised

██████████████████████████████████████████████████████
████████████████████████████
████████████████████████████████████████
██████████

████████████████████████████
██████████████████
██████████████████████████████████
██████
██████████████████████████████████████████████

Recommend lockdown of eastern wing. Awaiting further instruction.

[LOG CORRUPTED]`
        },
        {
            id: "LOG-003-TEMPORAL",
            title: "Temporal Fluctuations in Terminal 3",
            researcher: "Dr. [ALL OF THEM ARE DEAD]",
            date: "[REDACTED]-03-20",
            classification: "???",
            corrupted: false,
            content: `TEMPORAL RESEARCH OBSERVATION
Date: March 20, [REDACTED]
Lead: [REDACTED]
Classification: [REDACTED] – INTERNAL ONLY

Increasing temporal irregularities noted during interface testing in Chamber 3. 
Synchronization between local and facility clocks drifting unpredictably.

Findings:
- Equipment desync events recorded
- Mild perceptual anomalies among personnel
- Subject 31525 referenced events not yet observed

Anchor stability is declining. Possible cross-interference with early-stage causality layers suspected.

Recommendation: Suspend further temporal experimentation until baseline reality conditions are re-established.

333333333333333

– Dr. Vasquez`
        },
        {
            id: "LOG-004-CONSCIOUSNESS",
            title: "Consciousness Transfer Protocol – Phase 2",
            researcher: "TAS",
            date: "[REDACTED]-03-22",
            classification: "TOP SECRET",
            corrupted: false,
            content: `TRANSFER REPORT – PHASE 2
Date: March 22, [REDACTED]
Lead: TAS
Classification: TOP SECRET

Subject 31525's consciousness exhibits signs of multi-node distribution. 
Echo patterns detected in offsite backup environments. 
Behavioral bleed observed between vessels.

Known Instances:
- Primary host: 31525
- Secondary/Redundant units: [REDACTED]

Cross-talk between copies confirmed. 
Unexplained precognitive remarks noted. 
Subject appears aware of test outcomes in advance.

Growth observed in interface chamber continues. 
Subject remains calm.

[DATA INTEGRITY FAILURE DETECTED]
[END OF LOG]`
        },
        {
            id: "LOG-005-FINAL",
            title: "Final Entry – [REDACTED]",
            researcher: "Dr. [REDACTED]",
            date: "[REDACTED]-03-25",
            classification: "???",
            corrupted: false,
            content: `RESEARCH LOG – FINAL
Date: March 25, [REDACTED]
Researcher: Dr. [REDACTED]
Classification: COSMIC – INTERNAL EYES ONLY

This is my final entry.

Something is growing beneath us. It’s connected to everything we've done. 
The subject isn’t being tested-they are observing us. 

We've fed data, signals, thoughts into a system we never understood.

The roots are real. The dreams are spreading. The interface wasn't just a machine.

I don't know what we’ve awakened.

Don’t dig deeper. Don’t come looking. Whatever this is… it remembers.

[LOG TERMINATED]
[CORRUPTION: 67%]`
        },
        {
            id: "LOG-006-MAINTENANCE",
            title: "Structural Anomaly Report – South Wing",
            researcher: "Chief Engineer [REDACTED]",
            date: "[REDACTED]-03-12",
            classification: "CONFIDENTIAL",
            corrupted: false,
            content: `MAINTENANCE REVIEW
Date: March 12, [REDACTED]
Engineer: [REDACTED]
Classification: CONFIDENTIAL

Multiple structural concerns observed:

- Root-like growth breaching subfloor concrete
- Organic material present in duct systems
- Audio irregularities in test zones
- Magnetic disturbances in Lab 4

Material does not match any known local flora. 
Growth speed: approx. 3 inches/day.

Personnel exposed to affected areas report dream phenomena. 
Complaints logged. Further tests pending.

Note: Research department has requested no removal of root systems in Sector 7.
`
        },
        {
            id: "LOG-007-PSYCHOLOGICAL",
            title: "Group Evaluation – Staff Anomalies",
            researcher: "Dr. [SHE IS DEAD]",
            date: "[REDACTED]-03-14",
            classification: "SECRET",
            corrupted: true,
            content: `STAFF PSYCH EVALUATION
Date: March 14, [REDACTED]
Psych Lead: Dr. ████ ██████
Classification: SECRET

Multiple Level 5 personnel report recurring dream phenomena:

- Underground forests with distorted foliage
- Sensations of shared memories
- Unusual language comprehension in sleep

Group effect may be spreading. Neurological scans show elevated temporal activity. 
Similarities noted to Subject ██████’s baseline patterns.

Recommendation: Evacuation of non-essential personnel. 
Further █████████ ███ may accelerate group effects.

– Dr. ██████`
        },
        {
            id: "LOG-008-EMERGENCY",
            title: "Emergency Protocol Activation",
            researcher: "Director [HE IS DEAD]",
            date: "[REDACTED]-03-26",
            classification: "EMERGENCY",
            corrupted: true,
            content: `EMERGENCY INITIATED
Date: March 26, [REDACTED]
Director: James Harrison
Classification: EMERGENCY – FULL LOCKDOWN

Protocol ███████ enacted. Evacuation ordered.

Summary:
- E██████ spread beyond predicted containment
- ██████ systems operating without human input
- Structural integrity compromised
- Anchor points offline

Subject ██████ location unknown. Interface systems still receiving input. ██████ data confirms external ██████ ████ ██████████.

Rescue operations not advised. Recommend perimeter denial protocols.

[TRANSMISSION ENDED]
[ALL SYSTEMS UNRESPONSIVE]

████████████████████████████████████████████████████████████████
[ERROR: SYSTEM ROOT OVERRIDE]`
        }
    ]
}

// Classification colors for log entries tags
export const classificationClass = (selectedLog?: { classification?: string }) => {
    switch (selectedLog?.classification) {
        case 'TOP SECRET':
            return 'bg-red-900/50 text-red-300';
        case 'SECRET':
            return 'bg-orange-900/50 text-orange-300';
        case 'EMERGENCY':
            return 'bg-pink-900/60 text-pink-300';
        case '???':
            return 'bg-gray-900/50 text-gray-300';
        case 'CONFIDENTIAL':
            return 'bg-blue-900/50 text-blue-300';
        default:
            return 'bg-green-900/50 text-green-300';
    }
};
