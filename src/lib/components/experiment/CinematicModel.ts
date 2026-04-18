import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';

export class CinematicModel {
    public mesh: THREE.Group | null = null;
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public async init(url: string) {
        try {
            this.mesh = await ModelLoader.loadModel(url);
            if (this.mesh) {
                // Initial setup for the model
                this.mesh.scale.set(1.5, 1.5, 1.5);
                this.mesh.position.set(0, 0, 0);
                
                // Add to scene
                this.scene.add(this.mesh);

                // Material override if needed for cinematic look
                this.mesh.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        if (mesh.material) {
                            // (mesh.material as THREE.MeshStandardMaterial).wireframe = true;
                            // Add any custom cinematic tweaks here
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Failed to init CinematicModel', error);
        }
    }

    public update(elapsedTime: number) {
        if (this.mesh) {
            // Subtle idle animation
            this.mesh.rotation.y += 0.005;
            this.mesh.position.y = Math.sin(elapsedTime * 0.5) * 0.1;
        }
    }

    public dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.geometry.dispose();
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }
            });
        }
    }
}
