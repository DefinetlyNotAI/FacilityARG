// Chapter I data
export const chIData = {
    text: {
        connect: "Connect to Server",
        connectHelp: "Connection Help",
        hints: [
            "Find the answers in the first video log",
            "Find the answers in a leaked mail",
            "Then open my doors.. to see more doors"
        ],
        attemptingConn: "Attempting connection...",
        enterCreds: "Enter server credentials to proceed",
        inputs: {
            port: "Port:",
            ip: "IP Address:",
            ipPlaceholder: "Enter IP address",
            portPlaceholder: "Enter port number"
        },
        connectButton: {
            trueState: "Connecting...",
            falseState: "Connect",
        },
        accessHelpTip: "Need access? Email the administrator \"TREEFacility@outlook.com\"",
        completed: {
            title: "CONNECTION ESTABLISHED",
            subtitle: "Access granted. Download the gift to continue your journey.",
            downloadButton: "Download your gift"
        }
    },
    portNumErr: "Port Access Denied - TREE's root has blocked this port",
    ipAddressErr: "IP address connection failed/not accepting handshake protocol. Maybe try a different address?"
}

export const linksChI = {
    donecAnteDolorEXE: "/static/chapters/I/donec_ante_dolor.exe",
};