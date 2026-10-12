// Note any updates to routes must reflect to middleware.ts
// as vercel doesn't support importing values from here

export const routes = {
    notFound: "/404",
    moonlight: "/moonlight",
    choices: "/choices",
    terminal: "/terminal",
    oArvoreDaCarne: "/O-ARVORE-DA-CARNE",
    api: {
        utils: {
            // API: POST /api/utils/signCookie - signs a cookie value using server-side secret.
            // Receives a JSON body with "key=value", validates it, and signs the data using HMAC-SHA256.
            // Combines the value with its signature to ensure integrity and prevent tampering.
            // Returns a JSON response while setting a secure, long-lived cookie with the signed value.
            signCookie: "/api/utils/signCookie",
            // API: POST /api/utils/hashValue - hashes a value server-side with secret salt.
            // Accepts a JSON body with "value" and returns a SHA-256 hash using the server's SALT.
            // Used for creating tamper-proof localStorage values by keeping the salt secret.
            // Returns a JSON response with the hash or an error for invalid requests.
            hashValue: "/api/utils/hashValue",
            checkKeyword: {
                // API: POST /api/utils/checkKeyword - checks if a provided keyword matches a pre-defined hash.
                // Accepts a keyword and number, validating input for type and range correctness.
                // Hashes the keyword (case-insensitive) using a salt and compares it to a known hash list.
                // Returns a JSON response indicating which number was checked and whether the keyword matched.
                _: "/api/utils/checkKeyword",
                // API: POST /api/utils/checkKeyword/validate-email - validates a user-provided terminal email.
                // Accepts a JSON body with a 'provided' field containing the email to check.
                // Normalizes input, rejects missing or malformed values, and checks against the server-side expected email.
                // Returns a JSON response indicating whether the provided email is correct without exposing the actual email.
                // GET requests are blocked and return a 405 Method Not Allowed with a generic error message.
                validateEmail: "/api/utils/checkKeyword/validate-email",
                // API: POST /api/utils/checkKeyword/validate-keyword - validates a user-provided terminal keyword.
                // Accepts a JSON body with 'provided' (the keyword) and 'guessedKeywords' (array of already guessed keyword keys).
                // Normalizes input, rejects missing or malformed values, and checks against the server-side expected keywords.
                // If the keyword is invalid, responds with a generic "Incorrect keyword" message without erroring.
                // Tracks whether the keyword has already been guessed and returns its key and value without exposing other keywords.
                // GET requests are blocked and return a 405 Method Not Allowed with a generic error message.
                validateKeyword: "/api/utils/checkKeyword/validate-keyword",
            },
            // API: POST /api/utils/hashChecker - verifies if a provided string matches the hash of a secret item.
            // Accepts a JSON body with "stringToCheck" and "itemToCheck" (enum key).
            // Hashes the input string and compares it to the stored hash for the specified item.
            // Returns a JSON response indicating if the input matches the secret item's hash.
            hashChecker: "/api/utils/hashChecker",
        },
        security: {
            // API: GET /api/security/csrf-token - provides a CSRF token for form submissions.
            // Generates a 32-byte random CSRF token and sends it as a cookie to the client.
            // The cookie is readable by JavaScript (not HttpOnly) for frontend use in requests.
            // Returns a JSON success response with a secure, short-lived CSRF token cookie.
            csrfToken: "/api/security/csrf-token",
            // API: POST /api/security/auth - authenticates a user based on a provided password.
            // Handles POST requests for authentication by verifying the provided password.
            // If correct, hashes the environment password with a salt using SHA-256 and returns it.
            // Blocks GET requests, responding with an error indicating the method is not allowed.
            auth: "/api/security/auth",
        },
        browser: {
            // API: GET /api/browser/getBrowserState - retrieves the clicked state of a specified browser button.
            // Validates CSRF tokens from cookie and header before processing a button press request.
            // Checks or updates the button’s clicked state in the database, handling duplicate presses safely.
            // Returns a secure JSON response indicating success or relevant error conditions.
            getBrowserState: "/api/browser/getBrowserState",
            // API: POST /api/browser/flipBrowserState - toggles or sets the clicked state of a specified browser button.
            // Fetches all button states from the database, including each browser and its click status.
            // Safely releases the database connection after querying to prevent leaks.
            // Returns a secure JSON response with the data or an error if the query fails.
            flipBrowserState: "/api/browser/flipBrowserState",
        },
        chapters: {
            // API: POST /api/changeNextState - toggles the requested bonus act (Act_I..Act_X).
            // Need: JSON body { act: "Act_I" } and matching CSRF token in cookie 'csrf-token' and header 'x-csrf-token'.
            // Return: JSON object like { Act_I: "New State" } showing the new value, or an error object with status.
            // REQUIRES ADMIN AUTH
            changeToNextState: "/api/chapters/changeNextState",
            // API: GET /api/checkAll - returns boolean progress for all bonus acts (Act_I..Act_X).
            // Need: none (reads from actions table).
            // Return: JSON object like { Act_I: "New State", Act_II: "New State", ... } or an error object with appropriate status.
            getAll: "/api/chapters/checkAll",
            // API: GET /api/checkOne - returns the boolean progress for a single bonus act (Act_I..Act_X).
            // Need: query parameter "act" (one of Act_I, Act_II, ..., Act_X).
            // Return: JSON object like { "Act_I": "New State" } or an error object with appropriate status.
            getOne: "/api/chapters/checkOne",
            // API: GET /api/chapters/III/clockStates - returns the current clock states for chapter III.
            // Return: JSON object with server time, or an error object with appropriate status.
            IIIClockStates: "/api/chapters/III/clockStates",
            IV: {
                // API: POST /api/chapters/iv/validate-keyword - validates a plaque keyword and unlocks it for Chapter IV.
                // Return: Success flag and sets a signed HttpOnly auth cookie on valid input.
                validateKeyword: "/api/chapters/iv/validate-keyword",
                // API: POST /api/chapters/iv/validate-stage - validates a stage answer and updates Chapter IV plaque progress.
                // Return: Success flag and refreshes the signed auth cookie with unlocked plaques.
                validateStage: "/api/chapters/iv/validate-stage",
                // API: GET /api/chapters/iv/status - returns the current plaque solve states for Chapter IV.
                // Return: List of plaque IDs marked as solved based on verified auth cookie.
                status: "/api/chapters/iv/status",
            },
            // API: GET /api/puzzle - returns metadata about the puzzle (years and totals).
            // Return: JSON object like { years: [2020, 2021, ...], yearTotals: {2020: 5, 2021: 3, ...} }
            //         or an error object with appropriate status.
            // API: POST /api/puzzle - validates user-submitted numbers for a year and returns correct matches.
            // Need: JSON body with { year: number, numbers: number[] }.
            // Return: JSON object like { year: 2020, correctCount: 3, correctNumbers: [1,4,5], totalForYear: 5 }
            //         or an error object with appropriate status (400 for invalid input, 500 for server error).
            VII: "/api/chapters/VII",
        },
        banned: {
            // API: POST /api/banned/checkMe
            // Check if user IP is banned
            // Accepts { ip?: string }
            checkMe: "/api/banned/checkMe",
            // API: POST /api/banned/addMe
            // Adds an IP to the banned table
            addMe: "/api/banned/addMe",
            // API: GET /api/banned/all
            // Returns all rows from banned in a neat structure
            // REQUIRES ADMIN AUTH
            all: "/api/banned/all",
            // API: POST /api/banned/remove
            // Removes an IP from the banned table
            // REQUIRES ADMIN AUTH
            remove: "/api/banned/remove",
            // API: POST /api/banned/count
            // Returns the number of banned IPs
            count: "/api/banned/count"
        }
    },
    fileConsole: "/file-console",
    home: "/home",
    h0m3: "/h0m3",
    wifiPanel: "/wifi-panel",
    theEnd: "/the-end",
    wordOfTheDay: "/word_of_the_day",
    blackAndWhite: "/black-and-white",
    smileking: "/smileking",
    smilekingAuth: "/smileking-auth",
    wifiLogin: "/wifi-login",
    media: "/media",
    root: "/",
    cheater: "/CHEATER",
    tree98: "/file-console/tree98",
    scroll: "/scroll",
    codex: "/codex",
    saveFile: "/save-file",
    whiteroom: "/whiteroom",
    clickMe: "/click-me",
    bonus: {
        main: "/chapters",
        notYet: "/chapters/not_yet_child",
        noTime: "/chapters/no_time_left",
        locked: "/chapters/locked_behind_doors",
        noTimeChID(chID: string): string {
            return `/chapters/no_time_left?chapter=${chID}`;
        },
        actID(chID: string): string {
            return `/chapters/${chID.toUpperCase()}`
        },
        chapterIISpecial: {
            path3: '/chapters/II/3',
            path15: '/chapters/II/15',
            path25: '/chapters/II/25',
            pathTree: '/chapters/II/TREE',
            pathVessel: '/chapters/II/VESSEL',
            pathTr33: '/chapters/II/TR33',
            path1033333013: '/chapters/II/1033333013',
            pathTimedUrl: '/chapters/II/3h-15m-10th-utc',
        },
        chapterIVSpecial: {
            entity: '/chapters/IV/puzzles/Entity',
            tree: '/chapters/IV/puzzles/TREE',
            tas: '/chapters/IV/puzzles/TAS',
        },
        V_aStory: "/chapters/V/aStory",
        X_aStory: "/chapters/X_aStory",
    },
}

const rawCookies = {
    // Cookie to check if the user is allowed to see temporarily access the moonlight page
    theMoon: "themoon",
    // Cookie to check if the user saw KILL TAS cutscene
    killTAS: "KILLTAS_cutscene_seen",
    // Cookie to check if the user saw the o Arvore da Carne cutscene due to /dream
    tree: "TREE",
    // Cookie to check if the user got the "The Hollow Pilgrimage" video Easter egg
    hollowPilgrimage: "THP_Play",
    // Cookie to check if the user saw the moonlight cutscene
    moonTime: "moonlight_time_cutscene_played",
    // Cookie to check if the user saw the interference cutscene
    interference: "Interference_cutscene_seen",
    // Cookie to check if the user can access BnW
    blackAndWhite: "BnW_unlocked",
    // Cookie to check if the user can access Choice
    choice: "Choice_Unlocked",
    // Cookie to check if the user can access File Console
    fileConsole: "File_Unlocked",
    // Cookie to check if the user can access the Buttons
    buttons: "Button_Unlocked",
    // Cookie to check if the user can access the terminal
    terminal: "terminal_unlocked",
    // Cookie to check if the user already saw tree98 page
    tree98: 'tree98_cutscene_seen',
    // Cookie to check if the user is logged in to tree98
    loggedIn: 'tree98_logged_in',
    // Cookie to check if corrupt sequence can be played
    corrupt: "Corrupt",
    // Cookie to check if the user is in the corrupt limbo state
    corrupting: "corrupting",
    // Cookie to check if the user has completed the corrupt sequence
    noCorruption: "No_corruption",
    // Cookie to check if the user can access the scroll page
    scroll: "Scroll_unlocked",
    // Cookie to check if the user can access the Wi-Fi page
    wifiPanel: "Wifi_Unlocked",
    // Cookie to check if the user has passed the Wi-Fi login
    wifiPassed: "wifi_passed",
    // Cookie to check if the user can access the login page of Wi-Fi
    wifiLogin: "wifi_login",
    // Cookie to check if the user has entered the end
    endQuestion: "End?",
    // Cookie to check if the user has completed the end
    end: "End",
    // Cookie to check if the user can access the media page
    media: "Media_Unlocked",
    // Cookie storing the hash of the admin password inputted by user
    // This is a special cookie, httpOnly and signed server-side, DO NOT ATTEMPT TO MODIFY NOR ASSUME IT USES SIGN COOKIE API
    adminPass: "admin-pass",
    // Cookie to check if the user has accepted the disclaimers
    disclaimersAccepted: "accepted",
    // Cookie to check if the user already checked chapter II password for 3h15m25thUTC page
    chII_passDone: '3h15m25thUTC_passDone',
    // Cookie for chapter IV unlocked plaques (signed, server-only)
    chapIV_auth: 'chapIV_auth',
    // Cookie for ch 4 entity puzzle progress
    chIV_progress: 'chapterIV-plaque-progress',
    // Cookie to check if the user has completed the keyword of the day puzzle
    keywordOfTheDay: 'keywordOfTheDay',
};

export const cookies = process.env.NODE_ENV !== "production"
    ? new Proxy(rawCookies, {
        get(target, prop) {
            if (prop in target) {
                // console.log(`[USED_COOKIE] ${value}`);
                return target[prop as keyof typeof target];
            }
            return undefined;
        }
    })
    : rawCookies;


export const localStorageKeys = {
    // Check if the TTS message about time was run - LocalStorage key
    timeTTSSpoken: "voidTTSPlayed",
    // Number of times the facility has been refreshed - LocalStorage key
    refreshCount: "facilityRefreshCount",
    // Check if file console already executed the long boot sequence - LocalStorage key
    fileConsoleBooted: "file_console_booted",
    // Check if the flower in the end is cut
    flowerCut: "flowerCut",
    // Check if the user has seen the vessel boot sequence in tree98
    vesselBoot: "SeenVesselBoot",
    // Session ID - LocalStorage key
    sessionId: "sessionId",
    // How many seconds survived in chapter VI
    chapterVISeconds: "chapterVISeconds",
    // Side-puzzle solved flag for chapter VI
    chapterVISidePuzzleSolved: "chapterVI-side-puzzle-solved",
    // Ban until timestamp for chapter VII timeline input
    chapterVIIUnbanDate: "timeline_ban_until",
    // Witness phase completion for chapter VII
    chapterVIIWitnessComplete: "timeline_witness_complete",
    // Yearly progress for chapter VII timeline input (This will be a prefix, where there will be 5, one per year)
    logCreationDateStore: (year: number) => `year_${year}_found`,
    // Chapter VIII progression tokens - LocalStorage keys that show what user has done in chapter VIII
    chapterVIIIProgressionTokens: {
        solvedKey: "VIII_solved",
        connect: "VIII_part_connect",
        upload: "VIII_part_upload",
        switch: "VIII_part_switch",
        whisper: "VIII_part_whisper",
    },
    // Chapter IV progress storage key (For TAS Puzzle)
    chIV_TASProgress: "chapterIV-TAS-progress",
    // Chapter IV progress storage key (For TREE Puzzle)
    chIV_TREEProgress: "chapterIV-TREE-progress",
    // Chapter IV progress storage key (For Entity Puzzle)
    chIV_EntityProgress: "chapterIV-Entity-progress",
    // Chapter IX progress storage key (For tracking if TREE.exe was killed)
    chIX_TreeKilled: "chapterIX-TreeKilled",
}

// Keys for items to be checked via hash
// These are reference keys to the actual secret values stored server-side
// Check /app/api/utils/hashChecker/route.ts to modify the server-side secrets
export enum ItemKey {
    portNum,
    ipAddress,
    InternalCode
}
