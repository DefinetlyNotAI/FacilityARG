// Helper types
interface Classification {
    label: string;
    value?: string;
    valueIfLow?: string;
    valueIfHigh?: string;
    threshold?: number;
    className?: string;
    classNameIfHigh?: string;
    classNameIfLow?: string;
}

interface SysMsgRefresh {
    threshold: number;
    message: string;
    invert?: boolean;
}

interface SystemMetricPerformance {
    label: string;
    value: string;
    status?: "warning";
}

interface SystemMetricSensor {
    label: string;
    key: string;
    value: string;
}

interface Alerts {
    level: "warning" | "critical";
    message: string;
}

interface Security {
    title: string;
    value: string;
}

interface Emergency {
    label: string;
    extension: string;
    emergency?: boolean;
}

interface Terminal {
    prompt: string;
    text: string;
    dynamic?: boolean;
    warning?: boolean;
}

// Main exported interface for home page text data
export interface ResearchLog {
    id: string;
    title: string;
    researcher: string;
    date: string;
    classification: string;
    corrupted: boolean;
    content: string;
}

export interface TextData {
    puzzlePanel: {
        binaryPuzzleVal: string;
        timePuzzleVal: string;
    };

    dataPanel: {
        title: string;
        subtitle: string;
    };

    timePanel: {
        timeHex: {
            title: string;
            subtitle: string;
        };
        timeCountdown: {
            title: string;
            afterSubtitle: string;
            beforeSubtitle: string;
        };
    };

    topBarPanel: {
        title: string;
        subtitle: string;
        h1: string;
    };

    mainPanel: {
        title: string;
        subtitle: string;
        load: string;
        announcementBar: string;
        timeSubtitle: string;
    };

    logPanel: {
        title: string;
        subtitle: string;
        corruptionWarn: string;
        corruptionMsg: string;
    };

    securityPanel: {
        title: string;
        subtitle: string;
        easterEggCountMsg: string;
    };

    terminalPanel: {
        lines: Terminal[];
    };

    securityData: Security[];

    sysMetricPanel: {
        title: string;
        subtitle: string;
    };

    sysIndicators: string[];

    alertsData: {
        title: string;
        subtitle: string;
        alerts: Alerts[];
        refreshAlert: {
            level: "critical";
            message: string;
            minRefreshCount: number;
        };
    };

    notifications: {
        title: string;
        accept: string;
    };

    contactPanel: {
        emergency: Emergency[];
        secret: {
            label: string;
            extension: string;
            emergency: true;
            minRefreshCount: number;
        };
    };

    projectClassPanel: {
        title: string;
        subtitle: string;
        classifications: Classification[];
    };

    systemMessages: {
        scroll: string;
        time: string;
        invalidLogPerm: string;
        wifiUnlocked: string;
        hollowPilgrimage: string;
        konamiUnlock: string;
        refreshMessages: SysMsgRefresh[];
    };

    systemMetrics: {
        performanceData: SystemMetricPerformance[];
        sensorData: SystemMetricSensor[];
        neuralUnits: {
            active: number;
            warning: number;
            critical: number;
        };
    };

    researchLogs: ResearchLog[];
}
