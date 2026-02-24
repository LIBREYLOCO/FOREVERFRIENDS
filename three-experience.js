import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class AnimalManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.animals = [];
        this.loader = new GLTFLoader();
        this.clock = new THREE.Clock();

        // Animal assets from Three.js examples (stable links)
        this.assets = [
            { url: 'https://threejs.org/examples/models/gltf/Parrot.glb', scale: 0.05, speed: 0.8 },
            { url: 'https://threejs.org/examples/models/gltf/Flamingo.glb', scale: 0.05, speed: 0.6 },
            { url: 'https://threejs.org/examples/models/gltf/Stork.glb', scale: 0.05, speed: 0.7 }
        ];

        this.init();
    }

    async init() {
        for (let i = 0; i < 3; i++) {
            const asset = this.assets[i % this.assets.length];
            await this.spawnAnimal(asset, i * 15 - 20); // Stagger initial X position
        }
    }

    async spawnAnimal(asset, initialX = null) {
        return new Promise((resolve) => {
            this.loader.load(asset.url, (gltf) => {
                const model = gltf.scene;
                const mixer = new THREE.AnimationMixer(model);

                // Play first animation
                if (gltf.animations.length > 0) {
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                }

                model.scale.set(asset.scale, asset.scale, asset.scale);

                // Position logic
                if (initialX !== null) {
                    model.position.x = initialX;
                    model.position.y = (Math.random() - 0.5) * 15;
                    model.position.z = (Math.random() - 0.5) * 10;
                } else {
                    this.resetAnimal(model);
                }

                this.scene.add(model);
                this.animals.push({
                    model,
                    mixer,
                    speed: asset.speed + Math.random(),
                    bounds: 20
                });
                resolve();
            });
        });
    }

    resetAnimal(model) {
        // Spread them way back to avoid clumping
        model.position.x = -30 - Math.random() * 30;
        // Higher vertical and depth variation
        model.position.y = (Math.random() - 0.5) * 18;
        model.position.z = (Math.random() - 0.5) * 15;

        // Random drift for vertical movement
        model.userData.driftY = (Math.random() - 0.5) * 0.05;
    }

    update() {
        const delta = this.clock.getDelta();

        this.animals.forEach(animal => {
            animal.mixer.update(delta);

            // Move across screen (Left to Right) with a slightly higher base multiplier
            animal.model.position.x += animal.speed * delta * 15;
            animal.model.position.y += Math.sin(Date.now() * 0.001) * 0.02 + animal.model.userData.driftY;

            // Rotation based on movement
            animal.model.rotation.y = Math.PI / 2;

            // Reset if out of bounds
            if (animal.model.position.x > 30) {
                this.resetAnimal(animal.model);
            }
        });
    }
}

// Scene Setup
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const animalManager = new AnimalManager(scene, camera);

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    animalManager.update();
    renderer.render(scene, camera);
}

animate();
