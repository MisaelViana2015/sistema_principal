import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let renderer: THREE.WebGLRenderer;
        let particles: THREE.Points;
        let animationId: number;

        const particleCount = 10000;
        const baseY = 150;
        const groundY = -120;
        const fallSpeed = 0.3;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities: number[] = [];
        let geometry: THREE.BufferGeometry;

        const init = () => {
            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                1,
                1000
            );
            camera.position.z = 160;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            canvasRef.current?.appendChild(renderer.domElement);

            geometry = new THREE.BufferGeometry();

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const x = (Math.random() - 0.5) * 300;
                const y = Math.random() * baseY;
                const z = (Math.random() - 0.5) * 300;

                positions[i3] = x;
                positions[i3 + 1] = y;
                positions[i3 + 2] = z;

                colors[i3] = 1;
                colors[i3 + 1] = 1;
                colors[i3 + 2] = 1;

                velocities.push(Math.random() * fallSpeed + 0.1);
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const sprite = new THREE.TextureLoader().load(
                'https://threejs.org/examples/textures/sprites/circle.png'
            );
            const material = new THREE.PointsMaterial({
                size: 1.2,
                map: sprite,
                transparent: true,
                vertexColors: true,
                opacity: 1,
                depthWrite: false,
            });

            particles = new THREE.Points(geometry, material);
            scene.add(particles);

            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        };

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const time = Date.now() * 0.001;
            const positions = geometry.attributes.position.array as Float32Array;
            const colors = geometry.attributes.color.array as Float32Array;

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;

                // Fall velocity
                positions[i3 + 1] -= velocities[i];

                // Burnout logic
                if (positions[i3 + 1] < groundY) {
                    // Reset to top
                    positions[i3] = (Math.random() - 0.5) * 300;
                    positions[i3 + 1] = baseY;
                    positions[i3 + 2] = (Math.random() - 0.5) * 300;
                    velocities[i] = Math.random() * fallSpeed + 0.1;
                } else if (positions[i3 + 1] < groundY + 20) {
                    // Begin burn color transition
                    colors[i3] = 1.0;
                    colors[i3 + 1] = 0.5 + 0.5 * Math.random();
                    colors[i3 + 2] = 0;
                } else {
                    // Normal (white) dust
                    colors[i3] = 1.0;
                    colors[i3 + 1] = 1.0;
                    colors[i3 + 2] = 1.0;
                }

                // Optional: flicker
                colors[i3 + 0] += Math.sin(time + i) * 0.05;
                colors[i3 + 1] += Math.cos(time + i * 0.5) * 0.05;
            }

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;

            renderer.render(scene, camera);
        };

        init();
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            if (renderer) {
                renderer.dispose();
                canvasRef.current?.removeChild(renderer.domElement);
            }
            if (geometry) {
                geometry.dispose();
            }
        };
    }, []);

    return (
        <div
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none'
            }}
        />
    );
}
