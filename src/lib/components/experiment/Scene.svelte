<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as THREE from 'three';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
	import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
	import gsap from 'gsap';
	import { HeroObject } from './HeroObject';
	import { ExperienceManager } from './ExperienceManager';

	let canvas: HTMLCanvasElement;
	let renderer: THREE.WebGLRenderer;
	let composer: EffectComposer;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let hero: HeroObject;
	let frameId: number;

	const init = () => {
		// Renderer
		renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: false, // Antialias performed by post-processing mostly, but can keep false for performance with Bloom
			alpha: true,
			powerPreference: 'high-performance',
			stencil: false
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		// renderer.setClearColor(0x000000, 1);

		// Scene
		scene = new THREE.Scene();

		// Camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
		camera.position.z = 3.5;

		// Post Processing
		composer = new EffectComposer(renderer);

		const renderPass = new RenderPass(scene, camera);
		composer.addPass(renderPass);

		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			0.5, // Strength (Subtle)
			0.4, // Radius
			0.2 // Threshold (Only bright spots)
		);
		composer.addPass(bloomPass);

		const outputPass = new OutputPass();
		composer.addPass(outputPass);

		// Objects
		hero = new HeroObject();
		scene.add(hero.mesh);

		// Intro Animation
		hero.mesh.scale.set(0, 0, 0);
		gsap.to(hero.mesh.scale, {
			x: 1,
			y: 1,
			z: 1,
			duration: 2.5,
			ease: 'elastic.out(1, 0.5)',
			delay: 0.1
		});

		// Events
		window.addEventListener('resize', onResize);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('scroll', onScroll);

		// Initial Scroll Check
		onScroll();

		// Start Loop
		tick();
	};

	const onResize = () => {
		if (!camera || !renderer || !composer) return;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		composer.setSize(window.innerWidth, window.innerHeight);

		if (hero) hero.onResize(window.innerWidth, window.innerHeight);
	};

	const onMouseMove = (e: MouseEvent) => {
		if (hero) hero.onMouseMove(e);
	};

	// Smooth Scrolling Variables
	let targetScroll = 0;
	let currentScroll = 0;

	const onScroll = () => {
		const scrollY = window.scrollY;
		const maxScroll = document.body.scrollHeight - window.innerHeight;
		// Just update target, don't trigger manager yet
		targetScroll = Math.max(0, Math.min(1, scrollY / maxScroll));
	};

	const tick = (time: number = 0) => {
		const elapsedTime = time * 0.001;

		// Linear Interpolation for Smooth Scroll
		// 0.05 is the damping factor (lower = smoother/slower)
		currentScroll += (targetScroll - currentScroll) * 0.05;

		// Update Manager with smooth value
		ExperienceManager.getInstance().onScroll(currentScroll);

		if (hero) hero.update(elapsedTime);

		composer.render();
		frameId = requestAnimationFrame(tick);
	};

	onMount(() => {
		if (browser) {
			init();
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frameId);

			if (renderer) renderer.dispose();
			if (hero) hero.dispose();
		}
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed top-0 left-0 -z-10 block h-full w-full bg-neutral-900 outline-none"
></canvas>
