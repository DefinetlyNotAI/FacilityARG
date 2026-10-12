// Chapter IV Types fir hooks
import React from "react";

// Type used for plaque identification
export type PlaqueId = 'TREE' | 'TAS' | 'Entity';

// Other types used in code
export type LogEntry = { text: string; color?: 'green' | 'yellow' | 'red' | 'cyan' | 'magenta' | 'gray' };

export type FsNode = {
    name?: string;        // optional for root
    dirs?: FsNode[];      // subdirectories
    files?: string[];     // file names
};

export interface Process {
    pid: number,
    name: string,
    status: 'running' | 'stalled' | 'ghost'
}

export type ContainerClassArgs = {
    styles: Record<string, string>;
    glitchActive: boolean;
    fragmentsCollected: number;
};

export type FragmentsMap = Record<number, string>;

// Types used purely in components
export interface Stage {
    stage?: number;
    title?: string;

    [key: string]: any;
}

export interface StageNavigationProps {
    stages: Stage[];
    currentStageIndex: number;
    unlockedStage: number;
    onStageChange: (index: number) => void;
    className?: string;
}

export interface StageContainerProps {
    title: string;
    instruction?: string;
    children: React.ReactNode;
    className?: string;
}

export interface RiddleProps {
    idx: number;
    prompt: string;
    expectedChunk: string;
    onResult: (i: number, ok: boolean) => void;
}

export interface PuzzleHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

// Ch IV Const arg (text)
type StartupTextArgs = {
    sessionId: string | number;
    pid: string | number;
};

export interface vesselConstType {
    horrorMessageSets: Record<number, string[]>;
    randomProcessNames: string[];
    tasPredictionCommands: string[];

    heartbeatWindow: {
        min: number;
        max: number;
        interval: number;
        maxPhase: number;
    };

    horrorTiming: {
        baseInterval: number;
        minInterval: number;
        reductionPerFragment: number;
    };

    processTiming: {
        spawnInterval: number;
        spawnProbability: number;
        cpuSpikeDuration: number;
    };

    cdGaslightProbability: number;

    treeConstants: {
        newPid: number;
        newName: string;
        cpuUsage: number;
        metamorphosisDelay: number;
    };

    fileBuild: FsNode;

    startupText: (args: StartupTextArgs) => LogEntry[];

    messages: {
        // Process messages
        newProcessSpawn: string;

        // Fragment collection
        allFragmentsCollected: string;
        vesselSyncComplete: string;
        initializingTransfer: string;
        fragmentSaved: (i: number, v: string) => string;

        // Horror/Corruption messages
        memoryCorruption: string;
        glitchText: string;
        terminalLocked: string;

        // System messages
        monitoringProcess: string;
        listingProcesses: string;
        terminatingProcess: string;
        readingDirectory: string;
        loadingCommandRef: string;
        outputFilterModified: string;
        charSubstitutionConfigured: string;
        computingChecksum: string;
        monitoringCardiac: string;
        extractingTokens: string;
        queryingIdentity: string;
        readingLoginHistory: string;
        identityTransition: string;
        loadingMemoryTraces: string;
        accessingSystemLogs: string;
        readingHeartbeatLogs: string;
        sortingByCpu: string;

        // Warning messages
        treeAnomalousBehavior: string;
        criticalProcessTermination: string;
        spatialLogicError: string;

        // Alert messages
        terminalHardLocked: string;
        treeMetamorphosis: string;

        // Puzzle success messages
        onlyTreeRemains: string;
        foundTruthPath: string;
        foundTreeliedPath: string;

        // TAS messages
        tasPredictionFailed: string;
        tasActionMatched: string;
        tasBeginLog: string;
        tasEndLog: string;
        tasRememberPlaque: string;
        tasRememberDialogs: string;
        tasPredictedNext: (cmds: string[]) => string;
        tasWhyWouldYou: string;
        tasAuthBypass: string;

        // Process-related
        processRenamed: (name: string, pid: number) => string;
        killAttemptContainmentFailure: (name: string) => string;

        // Command errors
        inspectMissingPid: string;
        inspectPidNotFound: (pid: number) => string;
        inspectSpike: (name: string, pid: number) => string;
        killMissingPid: string;
        killPidNotFound: (pid: number) => string;
        killedProcess: (pid: number, name: string) => string;
        catMissingFile: string;
        catNoSuchFile: (file: string) => string;
        catBinaryFile: string;
        catEmptyFile: (file: string) => string;
        catPermissionDenied: string;
        lsPathError: string;
        lsContentsOf: (path: string) => string;
        lsEmpty: string;
        cdRoot: string;
        cdAtRoot: string;
        cdDisoriented: (path: string) => string;
        cdPathInvalid: string;
        cdNoSuchDirectory: (dir: string) => string;
        cdChangedTo: (path: string) => string;
        sha256MissingFile: string;
        sha256NoSuchFile: (file: string) => string;
        sha256NoHashAvailable: (file: string) => string;
        sha256Hash: (hash: string, file: string) => string;
        vesselIntegrityOk: string;
        vesselIntegrityMismatch: string;
        captureUnknownTarget: string;
        whoamiResult: (identity: string) => string;
        lastLogin: string;
        lastEllipsis: string;
        suAssumeVessel: string;
        suUserChangeFailed: string;
        secretUnlock: string;
        commandNotFound: (cmd: string) => string;
        pulseCaptured: string;
        pulseMisaligned: string;
        capturedToken: (token: string) => string;
        echoHijackStatus: (enabled: boolean) => string;
        mapEchoRequiresTwoArgs: string;
        mapEchoSet: (from: string, to: string) => string;
        pidofMissingName: string;
        pidofNoMatch: (name: string) => string;
        terminalCleared: string;

        // File contents
        readmeTitle: string;
        readmeContent: string[];
        passwdEntries: string[];
        hostsEntries: string[];
        systemLogEntries: string[];
        heartbeatLogEntries: string[];

        // Help text
        helpHeader: string;
        helpCommands: string[];

        // UI text
        headerTitle: string;
        sessionPrefix: string;
        sidebarProcesses: string;
        sidebarFragments: string;
        fragmentPlaceholder: string;
        tips: string;
        inputPlaceholder: string;
        runButton: string;
        liveStreamInfo: (count: number) => string;
        backLink: string;

        // Special paths
        secretDoorPath: string;
    };
}

// WhiteRoom
export type Phase = 'explore' | 'watching' | 'darkening' | 'eyes' | 'complete'