/**
 * VFX Effects for Terminal VN
 */
import {VFXEffect} from "@/types";

export const VFX_EFFECTS: Record<string, VFXEffect> = {
    shake: {
        name: 'shake', duration: 500, apply: (el) => {
            el.style.animation = 'vfx-shake 0.5s ease-in-out';
        }, cleanup: (el) => {
            el.style.animation = '';
        }
    },
    flash: {
        name: 'flash', duration: 300, apply: (el) => {
            el.style.animation = 'vfx-flash 0.3s ease-out';
        }, cleanup: (el) => {
            el.style.animation = '';
        }
    },
    glitch: {
        name: 'glitch', duration: 600, apply: (el) => {
            el.style.animation = 'vfx-glitch 0.6s steps(2, end)';
        }, cleanup: (el) => {
            el.style.animation = '';
        }
    },
    fadeIn: {
        name: 'fadeIn', duration: 1000, apply: (el) => {
            el.style.animation = 'vfx-fadeIn 1s ease-in';
        }, cleanup: (el) => {
            el.style.animation = '';
        }
    },
    fadeOut: {
        name: 'fadeOut', duration: 1000, apply: (el) => {
            el.style.animation = 'vfx-fadeOut 1s ease-out';
        }, cleanup: (el) => {
            el.style.animation = '';
        }
    },
    pulse: {
        name: 'pulse', duration: 1000, apply: (el) => {
            el.style.animation = 'vfx-pulse 1s ease-in-out';
        }, cleanup: (el) => {
            el.style.animation = '';
        }
    },
    static: {
        name: 'static', duration: 800, apply: (el) => {
            el.style.animation = 'vfx-static 0.8s steps(10, end)';
        }, cleanup: (el) => {
            el.style.animation = '';
        }
    },
    chromatic: {
        name: 'chromatic', duration: 1000, apply: (el) => {
            el.style.animation = 'vfx-chromatic 1s ease-in-out';
        }, cleanup: (el) => {
            el.style.animation = '';
        }
    }
};

export function applyVFX(effectName: string, element: HTMLElement): void {
    const effect = VFX_EFFECTS[effectName];
    if (!effect) return;
    effect.apply(element);
    if (effect.cleanup) setTimeout(() => effect.cleanup!(element), effect.duration);
}

export function parseVFXCommand(command: string): { effect: string } | null {
    const match = command.match(/^vfx\s+(\w+)/);
    return match ? {effect: match[1]} : null;
}

export default VFX_EFFECTS;
