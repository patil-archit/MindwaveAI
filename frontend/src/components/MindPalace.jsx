import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

// Emotion-to-Atmosphere Mapping
const ATMOSPHERE = {
    happy: { color: '#FFD700', speed: 0.5, particles: 2000, title: "Radiance" }, // Gold
    sad: { color: '#4A90E2', speed: 0.2, particles: 1000, title: "Rain" },      // Blue
    angry: { color: '#FF4500', speed: 2.0, particles: 500, title: "Inferno" },   // Red
    fear: { color: '#800080', speed: 1.5, particles: 300, title: "Shadow" },     // Purple
    neutral: { color: '#FFFFFF', speed: 0.3, particles: 1500, title: "Void" },   // White
    surprised: { color: '#00FF00', speed: 1.0, particles: 2000, title: "Spark" } // Green
};

const ParticleField = ({ emotion }) => {
    const mesh = useRef();
    const config = ATMOSPHERE[emotion] || ATMOSPHERE.neutral;

    // Procedural Particles
    const particles = useMemo(() => {
        const count = config.particles;
        const temp = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            temp[i * 3] = (Math.random() - 0.5) * 20; // x
            temp[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
            temp[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
        }
        return temp;
    }, [emotion]);

    useFrame((state, delta) => {
        // Rotation based on "Arousal" (speed)
        if (mesh.current) {
            mesh.current.rotation.y += delta * 0.1 * config.speed;
            mesh.current.rotation.x += delta * 0.05 * config.speed;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color={config.color}
                sizeAttenuation
                transparent
                opacity={0.8}
            />
        </points>
    );
};

const FloatingCore = ({ emotion }) => {
    const mesh = useRef();
    const config = ATMOSPHERE[emotion] || ATMOSPHERE.neutral;

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Beating Heart Effect
        const scale = 1 + Math.sin(time * config.speed * 2) * 0.1;
        mesh.current.scale.set(scale, scale, scale);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={mesh}>
                <icosahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial
                    color={config.color}
                    wireframe
                    emissive={config.color}
                    emissiveIntensity={0.5}
                />
            </mesh>
        </Float>
    );
};

const MindPalace = ({ emotion = 'neutral' }) => {
    const config = ATMOSPHERE[emotion] || ATMOSPHERE.neutral;

    return (
        <div className="absolute inset-0 -z-10 bg-gray-900 transition-colors duration-1000">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color={config.color} />

                <ParticleField emotion={emotion} />
                <FloatingCore emotion={emotion} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Fog for Atmosphere */}
                <fog attach="fog" args={['#101010', 5, 15]} />
            </Canvas>

            {/* Overlay Text */}
            <div className="absolute bottom-10 left-10 text-white/20 font-mono text-xs tracking-widest pointer-events-none">
                MIND PALACE STATUS: {config.title.toUpperCase()}
            </div>
        </div>
    );
};

export default MindPalace;
