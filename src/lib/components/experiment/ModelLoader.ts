import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export class ModelLoader {
    private static loader = new GLTFLoader();

    public static async loadModel(url: string): Promise<THREE.Group> {
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    resolve(gltf.scene);
                },
                (xhr) => {
                    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    console.error('An error happened while loading the model', error);
                    reject(error);
                }
            );
        });
    }
}
