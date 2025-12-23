import gsap from 'gsap';
import { experienceState, type ExperienceMode } from './state.svelte';
import { AudioManager } from './AudioManager';

export class ExperienceManager {
    private static instance: ExperienceManager;

    constructor() {
        if (ExperienceManager.instance) {
            return ExperienceManager.instance;
        }
        ExperienceManager.instance = this;

        // Initialize Tweakpane
        if (typeof window !== 'undefined') {
            import('tweakpane').then(({ Pane }) => {
                const pane = new Pane({ title: 'Creative Controls' }) as any;
                const f1 = pane.addFolder({ title: 'Params' });
                f1.addBinding(experienceState.params, 'chaosLevel', { min: 0, max: 2 });
                f1.addBinding(experienceState.params, 'flowSpeed', { min: 0, max: 5 });
                f1.addBinding(experienceState.params, 'distortion', { min: 0, max: 3 });
                f1.addBinding(experienceState.params, 'morph', { min: 0, max: 1 });
                f1.addBinding(experienceState.params, 'roughness', { min: 0, max: 1 });

                const f2 = pane.addFolder({ title: 'Colors' });
                f2.addBinding(experienceState.params, 'colorA', { color: { type: 'float' } });
                f2.addBinding(experienceState.params, 'colorB', { color: { type: 'float' } });
                f2.addBinding(experienceState.params, 'colorC', { color: { type: 'float' } });
            });
        }
    }

    public static getInstance(): ExperienceManager {
        if (!ExperienceManager.instance) {
            ExperienceManager.instance = new ExperienceManager();
        }
        return ExperienceManager.instance;
    }

    // Old logic removed in favor of granular config above

    // GRANULAR CHAPTER CONFIGS (20 Unique States)
    private chapterConfigs = [
        // GENESIS (0-4): Void -> Awakening
        { params: { chaosLevel: 0, flowSpeed: 0.1, distortion: 0.05, morph: 0, roughness: 0.6 }, colorA: { r: 0.05, g: 0.05, b: 0.1 }, colorB: { r: 0, g: 0, b: 0 } },
        { params: { chaosLevel: 0, flowSpeed: 0.2, distortion: 0.1, morph: 0.1, roughness: 0.55 }, colorA: { r: 0.1, g: 0.1, b: 0.2 }, colorB: { r: 0.02, g: 0.02, b: 0.05 } },
        { params: { chaosLevel: 0.05, flowSpeed: 0.3, distortion: 0.2, morph: 0.15, roughness: 0.5 }, colorA: { r: 0.15, g: 0.15, b: 0.3 }, colorB: { r: 0.05, g: 0.05, b: 0.1 } },
        { params: { chaosLevel: 0.1, flowSpeed: 0.4, distortion: 0.3, morph: 0.2, roughness: 0.45 }, colorA: { r: 0.2, g: 0.2, b: 0.4 }, colorB: { r: 0.1, g: 0.1, b: 0.2 } },
        { params: { chaosLevel: 0.15, flowSpeed: 0.5, distortion: 0.4, morph: 0.25, roughness: 0.4 }, colorA: { r: 0.3, g: 0.3, b: 0.5 }, colorB: { r: 0.15, g: 0.15, b: 0.3 } },

        // ENERGY (5-9): Flow -> Surge
        { params: { chaosLevel: 0.2, flowSpeed: 0.8, distortion: 0.5, morph: 0.3, roughness: 0.35 }, colorA: { r: 0.5, g: 0.4, b: 0.1 }, colorB: { r: 0.2, g: 0.1, b: 0.05 } },
        { params: { chaosLevel: 0.25, flowSpeed: 1.0, distortion: 0.6, morph: 0.35, roughness: 0.3 }, colorA: { r: 0.7, g: 0.5, b: 0.15 }, colorB: { r: 0.3, g: 0.2, b: 0.1 } },
        { params: { chaosLevel: 0.3, flowSpeed: 1.2, distortion: 0.7, morph: 0.4, roughness: 0.25 }, colorA: { r: 0.9, g: 0.7, b: 0.2 }, colorB: { r: 0.4, g: 0.25, b: 0.1 } },
        { params: { chaosLevel: 0.35, flowSpeed: 1.5, distortion: 0.8, morph: 0.45, roughness: 0.2 }, colorA: { r: 1.0, g: 0.8, b: 0.2 }, colorB: { r: 0.5, g: 0.3, b: 0.1 } },
        { params: { chaosLevel: 0.4, flowSpeed: 2.0, distortion: 0.9, morph: 0.5, roughness: 0.15 }, colorA: { r: 1.0, g: 0.9, b: 0.3 }, colorB: { r: 0.6, g: 0.4, b: 0.15 } },

        // CHAOS (10-14): Tension -> Break
        { params: { chaosLevel: 0.5, flowSpeed: 2.5, distortion: 1.2, morph: 0.6, roughness: 0.4 }, colorA: { r: 0.8, g: 0.2, b: 0.1 }, colorB: { r: 0.2, g: 0, b: 0 } },
        { params: { chaosLevel: 0.6, flowSpeed: 3.0, distortion: 1.5, morph: 0.7, roughness: 0.45 }, colorA: { r: 0.7, g: 0.1, b: 0.05 }, colorB: { r: 0.1, g: 0, b: 0 } },
        { params: { chaosLevel: 0.7, flowSpeed: 3.5, distortion: 1.2, morph: 0.8, roughness: 0.5 }, colorA: { r: 0.6, g: 0, b: 0 }, colorB: { r: 0.05, g: 0, b: 0 } },
        { params: { chaosLevel: 0.9, flowSpeed: 4.0, distortion: 1.0, morph: 0.9, roughness: 0.55 }, colorA: { r: 0.8, g: 0, b: 0 }, colorB: { r: 0, g: 0, b: 0 } }, // Peak Chaos
        { params: { chaosLevel: 1.0, flowSpeed: 2.0, distortion: 0.5, morph: 1.0, roughness: 0.6 }, colorA: { r: 0.2, g: 0, b: 0 }, colorB: { r: 0, g: 0, b: 0 } }, // The Void/Silence

        // HARMONY (15-19): Rebirth -> Eternity
        { params: { chaosLevel: 0.1, flowSpeed: 0.5, distortion: 0.3, morph: 0.2, roughness: 0.1 }, colorA: { r: 0.5, g: 0.6, b: 0.7 }, colorB: { r: 0.2, g: 0.3, b: 0.4 } },
        { params: { chaosLevel: 0.05, flowSpeed: 0.4, distortion: 0.2, morph: 0.15, roughness: 0.05 }, colorA: { r: 0.7, g: 0.8, b: 0.9 }, colorB: { r: 0.4, g: 0.5, b: 0.6 } },
        { params: { chaosLevel: 0, flowSpeed: 0.3, distortion: 0.15, morph: 0.1, roughness: 0.02 }, colorA: { r: 0.8, g: 0.9, b: 1.0 }, colorB: { r: 0.6, g: 0.7, b: 0.8 } },
        { params: { chaosLevel: 0, flowSpeed: 0.2, distortion: 0.1, morph: 0.05, roughness: 0.01 }, colorA: { r: 0.9, g: 0.95, b: 1.0 }, colorB: { r: 0.7, g: 0.75, b: 0.8 } },
        { params: { chaosLevel: 0, flowSpeed: 0.1, distortion: 0.1, morph: 0, roughness: 0.0 }, colorA: { r: 0.95, g: 0.98, b: 1.0 }, colorB: { r: 0.8, g: 0.8, b: 0.9 } },
    ];

    public onScroll(progress: number) {
        experienceState.scrollProgress = progress;

        const totalSections = 20;
        let section = Math.floor(progress * totalSections);
        if (section >= totalSections) section = totalSections - 1;

        // Update Section State
        if (experienceState.section !== section) {
            experienceState.section = section;
            AudioManager.getInstance().setChapterMood(section);
        }

        // Apply Visual Config for this specific chapter
        // We use GSAP to tween to the specific config, enabling continuous evolution
        const config = this.chapterConfigs[section];
        if (config) {
            gsap.to(experienceState.params, { ...config.params, duration: 2.0 });
            gsap.to(experienceState.params.colorA, { ...config.colorA, duration: 2.0 });
            gsap.to(experienceState.params.colorB, { ...config.colorB, duration: 2.0 });
        }
    }
}
