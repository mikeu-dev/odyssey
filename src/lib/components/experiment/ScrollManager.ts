import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { experienceState } from './state.svelte';
import { AudioManager } from './AudioManager';
import { ExperienceManager } from './ExperienceManager';
import { CinematicModel } from './CinematicModel';

export class ScrollManager {
    private static instance: ScrollManager;
    private masterTimeline: gsap.core.Timeline | null = null;
    private cinematicModel: CinematicModel | null = null;

    private constructor() {
        // Singleton
    }

    public static getInstance(): ScrollManager {
        if (!ScrollManager.instance) {
            ScrollManager.instance = new ScrollManager();
        }
        return ScrollManager.instance;
    }

    public init(triggerElement: HTMLElement) {
        if (this.masterTimeline) {
            this.masterTimeline.kill();
        }

        // Create Master Timeline
        this.masterTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: triggerElement,
                start: 'top top',
                end: '+=8000', // Extended scroll duration for cinematic feel
                scrub: 1, // Smooth scrubbing
                pin: true, // Pin the main section
                onUpdate: (self: any) => {
                    experienceState.scrollProgress = self.progress;
                }
            }
        });

        this.setupChapters();
    }

    private setupChapters() {
        if (!this.masterTimeline) return;

        const manager = ExperienceManager.getInstance();
        const configs = manager.chapterConfigs;
        const totalChapters = configs.length;
        const chapterDuration = 1 / totalChapters;

        configs.forEach((config, i) => {
            const startTime = i * chapterDuration;
            
            // Sync Section State & Audio
            this.masterTimeline!.add(() => {
                if (experienceState.section !== i) {
                    experienceState.section = i;
                    AudioManager.getInstance().setChapterMood(i);
                }
            }, startTime);

            // Visual Tweens (Params)
            // We use a small overlap/duration for smooth transition
            this.masterTimeline!.to(experienceState.params, {
                ...config.params,
                duration: chapterDuration,
                ease: 'power2.inOut'
            }, startTime);

            // Color Tweens
            this.masterTimeline!.to(experienceState.params.colorA, {
                ...config.colorA,
                duration: chapterDuration,
                ease: 'power2.inOut'
            }, startTime);

            this.masterTimeline!.to(experienceState.params.colorB, {
                ...config.colorB,
                duration: chapterDuration,
                ease: 'power2.inOut'
            }, startTime);

            // 3D Model Anim (Rotation & Position based on chapter)
            if (this.cinematicModel && this.cinematicModel.mesh) {
                this.masterTimeline!.to(this.cinematicModel.mesh.rotation, {
                    y: Math.PI * 2 * (i / totalChapters),
                    x: Math.sin(i) * 0.5,
                    duration: chapterDuration,
                    ease: 'none'
                }, startTime);

                this.masterTimeline!.to(this.cinematicModel.mesh.position, {
                    z: -1 + Math.cos(i) * 0.5,
                    duration: chapterDuration,
                    ease: 'power1.inOut'
                }, startTime);
            }
        });
    }

    public setCinematicModel(model: CinematicModel) {
        this.cinematicModel = model;
        // Refresh timeline to include model animations
        if (this.masterTimeline) {
            this.setupChapters();
        }
    }

    public getTimeline() {
        return this.masterTimeline;
    }

    public refresh() {
        ScrollTrigger.refresh();
    }

    public destroy() {
        if (this.masterTimeline) {
            this.masterTimeline.kill();
            this.masterTimeline = null;
        }
        ScrollTrigger.getAll().forEach(t => t.kill());
    }
}
