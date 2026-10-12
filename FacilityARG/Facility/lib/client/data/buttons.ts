export const buttons = {
    browsers: [
        "chrome",
        "firefox",
        "safari",
        "edge",
        "opera"
    ],
    wingding: "👍︎♒︎♏︎♍︎🙵 ⧫︎♒︎♏︎ 👍︎💧︎💧︎ ⬧︎♏︎♍︎❒︎♏︎⧫︎",
    subtitleText: "Click the button matching your browser to activate it globally.\nCollaboration required - each browser can only be pressed once.",
    tooltip: {
        onlyThisBrowser: (browser: string) => `This button is for ${browser} browser only`,
        alreadyPressed: "Button already pressed",
        clickToPress: (browser: string) => `Press to activate ${browser} button`
    },
    title: "Buttons for 5.. 5 vessels."
};
