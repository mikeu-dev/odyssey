import gsap from 'gsap';
import * as THREE from 'three';
import { currentSection, currentMode, scrollProgress, type ExperienceMode } from './stores';
import { get } from 'svelte/store';

export class ExperienceManager {
    private static instance: ExperienceManager;

    // Target values for shaders/animation
    public params = {
        chaosLevel: 0,
        flowSpeed: 0.5,
        distortion: 0.1,
        morph: 0,
        roughness: 0.4,
        metalness: 0.1,
        colorA: new THREE.Color('#ffb703'), // Warm yellow
        colorB: new THREE.Color('#fb8500'), // Orange
        colorC: new THREE.Color('#219ebc'), // Blue
    };

    constructor() {
        if (ExperienceManager.instance) {
            return ExperienceManager.instance;
        }
        ExperienceManager.instance = this;

        // Initialize Tweakpane
        if (typeof window !== 'undefined') {
            import('tweakpane').then(({ Pane }) => {
                const pane = new Pane({ title: 'Creative Controls' });
                const f1 = pane.addFolder({ title: 'Params' });
                f1.addBinding(this.params, 'chaosLevel', { min: 0, max: 2 });
                f1.addBinding(this.params, 'flowSpeed', { min: 0, max: 5 });
                f1.addBinding(this.params, 'distortion', { min: 0, max: 3 });
                f1.addBinding(this.params, 'morph', { min: 0, max: 1 });
                f1.addBinding(this.params, 'roughness', { min: 0, max: 1 });

                const f2 = pane.addFolder({ title: 'Colors' });
                f2.addBinding(this.params, 'colorA', { color: { type: 'float' } });
                f2.addBinding(this.params, 'colorB', { color: { type: 'float' } });
                f2.addBinding(this.params, 'colorC', { color: { type: 'float' } });
            });
        }
    }

    public static getInstance(): ExperienceManager {
        if (!ExperienceManager.instance) {
            ExperienceManager.instance = new ExperienceManager();
        }
        return ExperienceManager.instance;
    }

    public onScroll(progress: number) {
        scrollProgress.set(progress);

        // Determine section based on scroll (0.0 - 1.0)
        // We have 4 sections, so 0.25 chunks
        let section = 0;
        let mode: ExperienceMode = 'GENESIS';

        if (progress < 0.25) {
            section = 0;
            mode = 'GENESIS';
            this.transitionToGenesis();
        } else if (progress < 0.5) {
            section = 1;
            mode = 'ENERGY';
            this.transitionToEnergy();
        } else if (progress < 0.75) {
            section = 2;
            mode = 'CHAOS';
            this.transitionToChaos();
        } else {
            section = 3;
            mode = 'HARMONY';
            this.transitionToHarmony();
        }

        // Only update store if changed to avoid thrashing
        if (get(currentSection) !== section) currentSection.set(section);
        if (get(currentMode) !== mode) currentMode.set(mode);
    }

    // TRANSITIONS (Using GSAP for smooth interpolation)

    private transitionToGenesis() {
        // Calm, breathing, warm colors
        gsap.to(this.params, {
            chaosLevel: 0,
            flowSpeed: 0.3,
            distortion: 0.2,
            morph: 0,
            roughness: 0.4,
            duration: 1.5
        });
        gsap.to(this.params.colorA, { r: 1.0, g: 0.8, b: 0.6, duration: 2 }); // Pastel
        gsap.to(this.params.colorB, { r: 0.4, g: 0.6, b: 0.9, duration: 2 }); // Soft Blue
    }

    private transitionToEnergy() {
        // glowing, pulsing, liquid
        gsap.to(this.params, {
            chaosLevel: 0.2,
            flowSpeed: 1.2,
            distortion: 0.6, // High waves
            morph: 0.5,
            roughness: 0.2, // Shiny
            duration: 1.5
        });
        gsap.to(this.params.colorA, { r: 0.1, g: 0.9, b: 0.4, duration: 2 }); // Neon Green
        gsap.to(this.params.colorB, { r: 0.1, g: 0.1, b: 0.9, duration: 2 }); // Deep Blue
    }

    private transitionToChaos() {
        // Spiky, fast, glitchy
        gsap.to(this.params, {
            chaosLevel: 1.0, // Full chaos
            flowSpeed: 3.0,
            distortion: 1.2, // Extreme spikes
            morph: 1.0,
            roughness: 0.8, // Matte/Rough
            duration: 1.0 // Faster transition
        });
        gsap.to(this.params.colorA, { r: 0.9, g: 0.1, b: 0.1, duration: 1 }); // Red
        gsap.to(this.params.colorB, { r: 0.1, g: 0.0, b: 0.0, duration: 1 }); // Black/Dark
    }

    private transitionToHarmony() {
        // Complex but smooth, pearlescent
        gsap.to(this.params, {
            chaosLevel: 0.1,
            flowSpeed: 0.5,
            distortion: 0.4,
            morph: 0.2,
            roughness: 0.1, // Very shiny
            duration: 2.0
        });
        gsap.to(this.params.colorA, { r: 0.9, g: 0.9, b: 1.0, duration: 2 }); // Pearl White
        gsap.to(this.params.colorB, { r: 0.6, g: 0.4, b: 0.6, duration: 2 }); // Soft Purple
    }
}
