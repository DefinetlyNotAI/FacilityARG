import {FinaleMessage, FormFields} from "@/types";

export const messages = {
    finale: [
        {
            text: "ACCESS GRANTED",
            style: {fontSize: '1.8rem', marginBottom: '2rem'},
            type: 'title',
        },
        {
            text: "BUT SOMETHING\nSTILL WATCHES...\n\n54 52 59 20 41 4E 44 20 50 52 45 46 49 58 20 2F 61 70 69 2F 20 41 4E 44 20 46 4F 4C 4C 4F 57 20 54 48 45 20 50 52 45 56 49 4F 55 53 20 54 49 50 2E",
            type: 'body',
            // could add style or animation here if needed
        },
        {
            text: "Redirecting...",
            type: 'loading',
            // style or loading spinner flags can go here
        },
    ] as FinaleMessage[],
    interference: [
        'V3$$3L.. W@TCH.. M3.. GR0W',
        'TH1$ TR33 H@$ JU$T F@LL3N',
        'praise be',
        ':)',
    ] as string[],
    question: "Prove you are not a robot: What is 3, 15 and 25 summed up?",
    comment: "If you ever forgot your name: https://youtu.be/zZzx9qt1Q9s\n" +
        "Hash of the sha1 pass is e6d7a4c1389cffecac2b41b4645a305dcc137e81",
    err: {
        invPassword: (inputHashPass: string) => `Invalid password. Your hash: ${inputHashPass}`,
        invUsername: "Invalid username.",
        intentionalTransmission: "Transmission error: Encryption module failed - Caesar cipher the message before sending.",
        failedUnlock: "46 6F 6F 6C",
        incorrectPass: "49 64 69 6F 74",
        incorrectCeaserPass: "42 6F 74 68 20 61 20 66 6F 6F 6C 20 61 6E 64 20 61 6E 20 69 64 69 6F 74"
    },
    answer: {
        ceaser: "76",
        normal: "43",
    },
    loadMsg: "Establishing secure connection...",
    authMsg: "Authenticating..."
};
export const form: FormFields = {
    username: {
        title: "Username:",
        placeholder: "Enter username: ",
    },
    password: {
        title: "Password:",
        placeholder: "Enter password: ",
        min: 1,
        max: 10,
    },
}
export const hashes = {
    // sha1
    password: "e6d7a4c1389cffecac2b41b4645a305dcc137e81",
    // sha256
    username: "6c5a39f1f7e832645fae99669dc949ea848b7dec62d60d914a3e8b3e3c78a756"
}
export const wifiPanel = {
    title: "Wi-Fi Panel",
    sendButton: "Send",
    receiveButton: "Receive",
    transmissionPanel: {
        mainTitle: "Transmitting Layer",
        title: "Incoming Transmission",
        hint: "The base of a stack.",
        netForm: {
            request:
                "To unlock networking functionality,\n" +
                "Enter Keyword[1] Access Code first.",
            placeholder: "Enter the phrase taught to you.",
        },
        ansForm: {
            request: "Your answer:",
            placeholder: "Numerical value",
        },
    },
    caesarPanel: {
        title: "Encryption Protocol",
        description: "Module Error: Apply Caesar to the message and try again",
        placeholder: "Caesar-shifted answer",
    },
};
