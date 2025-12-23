<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as THREE from 'three';
	import gsap from 'gsap';
	import { HeroObject } from './HeroObject';

	let canvas: HTMLCanvasElement;
	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let hero: HeroObject;
	let frameId: number;

	const init = () => {
		// Renderer
		renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true,
			powerPreference: 'high-performance'
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 1);

		// Scene
		scene = new THREE.Scene();

		// Camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
		camera.position.z = 2;

		// Objects
		hero = new HeroObject();
		scene.add(hero.mesh);

		// Intro Animation
		hero.mesh.scale.set(0, 0, 0);
		gsap.to(hero.mesh.scale, {
			x: 1,
			y: 1,
			z: 1,
			duration: 2,
			ease: 'elastic.out(1, 0.5)',
			delay: 0.1
		});

		// Lights (Minimal setup, relying mostly on shader emissions/matcaps/fresnel)
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);

		const dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.position.set(5, 5, 5);
		scene.add(dirLight);

		// Events
		window.addEventListener('resize', onResize);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('scroll', onScroll);

		// Start Loop
		tick();
	};

	const onResize = () => {
		if (!camera || !renderer) return;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		if (hero) hero.onResize(window.innerWidth, window.innerHeight);
	};

	const onMouseMove = (e: MouseEvent) => {
		if (hero) hero.onMouseMove(e);
	};

	const onScroll = () => {
		if (hero) hero.onScroll(window.scrollY);
	};

	const tick = (time: number = 0) => {
		const elapsedTime = time * 0.001;

		if (hero) hero.update(elapsedTime);

		renderer.render(scene, camera);
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

<canvas bind:this={canvas} class="absolute top-0 left-0 block h-full w-full outline-none"></canvas>
