import { writable } from 'svelte/store';

export type ExperienceMode = 'GENESIS' | 'ENERGY' | 'CHAOS' | 'HARMONY';

export const currentSection = writable<number>(0);
export const currentMode = writable<ExperienceMode>('GENESIS');
export const scrollProgress = writable<number>(0);
