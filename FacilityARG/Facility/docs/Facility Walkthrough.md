# **VESSEL ARG Walkthrough (Player-Friendly Step-by-Step)**

> Very basic and doesn't cover optional/bonus/secret content.

---

## **Step 1: Home**

### **Part 1: First Visit**

1. Open the Home page.
2. A countdown will start. Wait for it to finish.
3. Listen to the voice clip that plays when the countdown ends.
4. Read the facility text on the screen.

### **Part 2: Finding the First Keyword**

1. Hover over a special line in the text.
2. This reveals a string of binary.
3. Decode the binary to Base64 to obtain **KEYWORD1**.

### **Part 3: Setting the Clock**

1. Somewhere on the page, you will find a HEX value that represents a time.
2. Set your system clock to match this time.
3. Refresh the page.
4. After refreshing, you will see that a new section is now unlocked: **Wi-Fi Panel**.

---

## **Step 2: Wi-Fi Login**

1. Click the **Wi-Fi Login** button if prompted.
2. If this is your first visit, a cutscene called **Interference** will play.
3. You must log in:

    * Username is derived from a reversed YouTube audio clip.
    * Password is obtained via a JavaScript hash on the page.
4. After entering correct credentials, you are redirected back to the Wi-Fi Panel.

---

## **Step 3: Wi-Fi Panel**

### **Part 1: Initial Options**

1. On the Wi-Fi Panel page, you will see two buttons: **Receive** and **Send**.
2. Click **Receive** to get an encoded question. Look for hints in the page’s HTML comments.

### **Part 2: Sending the Answer**

1. The **Send** button is locked until you have **KEYWORD1** from Home.
2. Enter the solution to the encoded question.
3. Solve the Caesar cipher if required.
4. If correct, the Media section will unlock.

### **Optional / Advanced**

* If you use `curl` or `wget` to interact with the page, it may return **KEYWORD2** for later use.

---

## **Step 4: Media Section**

### **Part 1: Accessing Media**

1. Enter **KEYWORD2** from Wi-Fi Panel if required.
2. You will find three types of media content:

    * **Audio** → decode Morse → reveals **KEYWORD3**
    * **ZIP1** (pass = KEYWORD3) → extract ASCII → reveals **KEYWORD4**
    * **ZIP2** (pass = KEYWORD4) → reversed audio + QR code → URL buttons

### **Part 2: Completion**

* Make sure you access all three media items. Once done, the Buttons section unlocks.

---

## **Step 5: Buttons**

### **Part 1: Interaction**

1. You will see five browser-specific buttons.
2. Click all five buttons to complete this step.

### **Part 2: Progression**

* After clicking all buttons, the File Console (`tree98`) unlocks.

---

## **Step 6: File Console / tree98**

### **Part 1: Cutscene**

1. On first visit, a boot screen appears with a Win98 simulation.
2. Watch chaos events, errors, TREE’s farewell, and a bluescreen.

### **Part 2: Terminal**

1. After cutscene, the retro terminal becomes available.
2. Explore files, run commands, and read messages.
3. When done, you can return to **Home**.

---

## **Step 7: h0m3 (Corrupted Home)**

1. You will notice corrupted visuals: whispers, static, and infinite scroll.
2. Click the **RESET** button.
3. You are returned to the normal Home page.

---

## **Step 8: Scroll**

1. On visiting the Scroll page, watch the black/colored screen.
2. Wait for console errors and TTS insults (2–3 minutes).
3. Click **ESCAPE** to proceed to Black and White.

---

## **Step 9: Black and White**

1. Explore the QR codes → Base64 poem → **KEYWORD5**.
2. Examine the binary grid → confirms **KEYWORD5**.
3. Type **KEYWORD5** into the console.
4. Make sure your screen is 666x666.
5. After doing this, you unlock **Choices**.

* Optional: Typing `404` may trigger Moonlight cutscene (rare).

---
