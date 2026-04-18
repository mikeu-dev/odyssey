<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as THREE from 'three';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
	import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);
	import { HeroObject } from './HeroObject';
	import { ExperienceManager } from './ExperienceManager';
	import { ScrollManager } from './ScrollManager';
	import { CinematicModel } from './CinematicModel';
	
	let { container } = $props();

	let canvas: HTMLCanvasElement;
	let renderer: THREE.WebGLRenderer;
	let composer: EffectComposer;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let hero: HeroObject;
	let cinematicModel: CinematicModel;
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

		// Lights
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
		directionalLight.position.set(5, 5, 5);
		scene.add(directionalLight);

		// Objects
		hero = new HeroObject();
		scene.add(hero.mesh);

		// Cinematic Model
		cinematicModel = new CinematicModel(scene);
		cinematicModel.init('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/DamagedHelmet/glTF-Binary/DamagedHelmet.glb').then(() => {
			ScrollManager.getInstance().setCinematicModel(cinematicModel);
		});

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

		// Init Scroll Manager
		if (container) {
			ScrollManager.getInstance().init(container);
		}
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
		// ScrollTrigger handles this now
	};

	const tick = (time: number = 0) => {
		const elapsedTime = time * 0.001;

		// Update Manager handled by GSAP Timeline now

		if (hero) hero.update(elapsedTime);
		if (cinematicModel) cinematicModel.update(elapsedTime);

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
			if (cinematicModel) cinematicModel.dispose();
		}
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed top-0 left-0 -z-10 block h-full w-full bg-neutral-900 outline-none"
></canvas>
