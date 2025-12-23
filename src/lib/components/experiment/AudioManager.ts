import * as Tone from 'tone';
import { experienceState } from './state.svelte';

export class AudioManager {
    private static instance: AudioManager;
    private drones: Map<string, Tone.Player | Tone.Oscillator | Tone.Synth> = new Map();
    private reverb: Tone.Reverb;
    private delay: Tone.FeedbackDelay;
    private filter: Tone.Filter;
    private isInitialized = false;

    // Generators for generative music
    private polySynth: Tone.PolySynth;
    private seq: Tone.Sequence | null = null;

    private constructor() {
        // Effects Chain
        this.reverb = new Tone.Reverb({ decay: 5, wet: 0.5 }).toDestination();
        this.delay = new Tone.FeedbackDelay("8n", 0.3).connect(this.reverb);
        this.filter = new Tone.Filter(200, "lowpass").connect(this.delay);

        this.polySynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 1, decay: 0.5, sustain: 0.5, release: 2 }
        }).connect(this.filter);
        this.polySynth.volume.value = -6;
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public async initialize() {
        if (this.isInitialized) return;
        await Tone.start();
        this.isInitialized = true;
        console.log("Audio Context Started");
        this.updateAmbience();
    }

    public toggleMute(muted: boolean) {
        Tone.Destination.mute = muted;
    }

    public updateAmbience() {
        if (!this.isInitialized) return;
        // This is now mainly a backup or initial trigger
    }

    public setChapterMood(chapterIndex: number) {
        if (!this.isInitialized) return;

        const era = Math.floor(chapterIndex / 5);
        const progressInEra = (chapterIndex % 5) / 4; // 0.0 to 1.0 within Era

        // Base Chaos automation
        const targetFreq = 200 + (experienceState.params.chaosLevel * 2000);
        this.filter.frequency.rampTo(targetFreq, 2);

        // ERA SWITCH (Broad changes)
        if (this.seq) {
            this.seq.dispose();
            this.seq = null;
        }

        switch (era) {
            case 0: // GENESIS
                this.playGenesis();
                // Granular: Increase Reverb as we get closer to Awakening
                this.reverb.wet.rampTo(0.8 - (progressInEra * 0.3), 2); // Dies down slightly
                break;
            case 1: // ENERGY
                this.playEnergy();
                // Granular: Speed up transport? Or just volume
                this.polySynth.volume.rampTo(-6 + (progressInEra * 3), 2); // Get louder
                break;
            case 2: // CHAOS
                this.playChaos();
                // Granular: Increase distortion feedback
                this.delay.feedback.value = 0.5 + (progressInEra * 0.4); // 0.5 -> 0.9
                break;
            case 3: // HARMONY
                this.playHarmony();
                // Granular: Purest sound at the end
                this.reverb.wet.rampTo(0.5 + (progressInEra * 0.4), 2); // More washing
                break;
        }
    }

    private playGenesis() {
        // Deep drone (Low C)
        this.polySynth.releaseAll();
        this.polySynth.triggerAttack(["C2", "G2"], Tone.now(), 0.1);

        // Very wet reverb
        this.reverb.wet.rampTo(0.8, 2);
        this.delay.wet.rampTo(0.1, 2);
    }

    private playEnergy() {
        this.polySynth.releaseAll();
        // Ascending arpeggio
        this.seq = new Tone.Sequence((time, note) => {
            this.polySynth.triggerAttackRelease(note, "8n", time);
        }, ["C3", "E3", "G3", "B3", "C4"], "4n").start(0);

        this.reverb.wet.rampTo(0.4, 2);
        Tone.Transport.start();
    }

    private playChaos() {
        this.polySynth.releaseAll();
        // Random dissonant notes
        this.seq = new Tone.Sequence((time, note) => {
            if (Math.random() > 0.3) {
                this.polySynth.triggerAttackRelease(note, "16n", time);
            }
        }, ["C#3", "D3", "F#3", "A#3", "C4"], "16n").start(0);

        // High feedback delay
        this.delay.feedback.value = 0.6;
        this.delay.wet.rampTo(0.5, 1);
        Tone.Transport.start();
    }

    private playHarmony() {
        this.polySynth.releaseAll();
        // Slow major chord swelling
        this.polySynth.triggerAttack(["C3", "E3", "G3", "C4"], Tone.now());

        // Pure reverb
        this.reverb.wet.rampTo(0.6, 2);
        this.delay.wet.rampTo(0.2, 2);
        Tone.Transport.stop(); // Stop sequencer, just drone
    }
}
