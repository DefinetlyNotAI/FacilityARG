# VFX Effects & Node Menu - Documentation

## VFX Effects System

### Overview

The VN Engine now supports visual effects that can be triggered from VN scripts to enhance storytelling.

### Available Effects

| Effect         | Duration | Description               |
|----------------|----------|---------------------------|
| `shake`        | 500ms    | Screen shake effect       |
| `flash`        | 300ms    | Brief white flash         |
| `glitch`       | 600ms    | Digital glitch/corruption |
| `fadeIn`       | 1000ms   | Fade in from black        |
| `fadeOut`      | 1000ms   | Fade out to black         |
| `pulse`        | 1000ms   | Pulsing scale effect      |
| `static`       | 800ms    | TV static noise           |
| `wave`         | 1200ms   | Wavy distortion           |
| `slideInLeft`  | 800ms    | Slide in from left        |
| `slideInRight` | 800ms    | Slide in from right       |
| `zoomIn`       | 600ms    | Zoom in effect            |
| `chromatic`    | 1000ms   | Chromatic aberration      |
| `scanlines`    | 2000ms   | CRT scanlines overlay     |

### Usage in VN Scripts

```
# Basic usage
$ vfx effectName

# Examples
$ vfx shake
$ vfx glitch  
$ vfx flash
```

### When to Use VFX

**Shake** - Dramatic revelations, impacts, important choices

```
$ vfx shake
> System: THE ENTITY AWAKENS
```

**Glitch** - System errors, corruption, breaking the fourth wall

```
$ vfx glitch
> Narrator: But wait...
```

**Flash** - Achievements, sudden insights, scene transitions

```
$ vfx flash
> System: ACHIEVEMENT UNLOCKED
```

**Static** - Keywords, system interference, mysterious moments

```
$ vfx static
> System: whispers... echoes... nullskin...
```

**Chromatic** - Final moments, climactic scenes

```
$ vfx chromatic
> System: === VESTIGE COMPLETE ===
```

---

## Node Menu System

### Overview

Players can now jump to previously visited nodes through a menu interface. Progress is automatically saved to
localStorage.

### Features

✅ **Automatic Progress Tracking** - Nodes are marked as visited when completed
✅ **localStorage Persistence** - Progress saved across sessions  
✅ **Smart Formatting** - Node names automatically formatted (e.g., `final_truth` → "Final Truth")
✅ **Visual Indicators** - ✓ for visited, 🔒 for locked
✅ **Current Node Highlighting** - Shows where you are

### How It Works

1. **Completion Tracking** - When a node completes (reaches its end), it's marked as visited
2. **localStorage Storage** - Saved as `vn_node_[nodeName] = "true"`
3. **Menu Access** - Click the Menu button (☰) in header controls
4. **Jump to Node** - Click any visited node to jump there immediately

### Menu UI

```
Jump to Node
┌─────────────┬─────────────┐
│ Start ✓     │ Watching ✓  │
│ Pilgrim ✓   │ Dance 🔒    │
│ Beyond 🔒   │ Legacy 🔒   │
└─────────────┴─────────────┘
```

- **Green background** = Current node
- **✓** = Visited (clickable)
- **🔒** = Not visited (locked)
- **Faded** = Cannot access yet

### Clearing Progress

To reset all visited nodes:

```javascript
// In browser console
Object.keys(localStorage).forEach(key => {
    if (key.startsWith('vn_node_')) {
        localStorage.removeItem(key);
    }
});
```

### Integration Example

The aStory.vns file now includes:

- VFX effects at dramatic moments
- Auto-saved progress through all 20+ nodes
- Full menu navigation when enabled

---

## Combined Usage Example

```
@node dramatic_reveal
$ vfx shake
> Narrator: Everything you knew was a lie.
$ vfx glitch
> System: ERROR... TRUTH LOADING...
$ vfx flash
> Narrator: The ENTITY has awakened.
@jump aftermath

@node aftermath
> Narrator: What will you do now?
? Choose your path:
- Fight -> battle_node
- Flee -> escape_node
- Accept -> truth_node
```

When players complete `dramatic_reveal`, it's saved. They can later use the menu to jump back and experience it again or
try different choices.

---

**Created:** December 24, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅

