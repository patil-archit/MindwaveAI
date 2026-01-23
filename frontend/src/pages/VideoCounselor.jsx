import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import Webcam from 'react-webcam';
import { Mic, MicOff, Video, VideoOff, MessageSquare, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- 3D Avatar Component ---
// --- 3D Humanoid Avatar Component ---
const HumanoidAvatar = ({ talking }) => {
    const headRef = useRef();
    const mouthRef = useRef();
    const leftEyeRef = useRef();
    const rightEyeRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Gentle Head Float
        headRef.current.position.y = Math.sin(time * 1) * 0.1;
        headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;

        // Eye Blink Logic (Randomish)
        const blink = Math.sin(time * 5) > 0.98 ? 0.1 : 1;
        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, blink, 0.2);
        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blink, 0.2);

        // Mouth Movement (Lip Sync Mock)
        if (talking) {
            // Fast sine wave for talking
            const mouthOpen = 0.2 + Math.abs(Math.sin(time * 20)) * 0.5;
            mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, mouthOpen, 0.4);
            mouthRef.current.scale.x = 1.2;
        } else {
            // Closed / Neutral
            mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.1, 0.1);
            mouthRef.current.scale.x = 1;
        }
    });

    return (
        <group ref={headRef} position={[0, 0, 0]}>
            {/* Main Head Shape - Metallic/Glassy */}
            <Sphere args={[1.2, 64, 64]}>
                <meshStandardMaterial
                    color="#e0e0e0"
                    metalness={0.6}
                    roughness={0.2}
                    envMapIntensity={1}
                />
            </Sphere>

            {/* Glowing Eyes */}
            <group position={[0, 0.3, 1]}>
                <Sphere ref={leftEyeRef} position={[-0.4, 0, 0]} args={[0.15, 32, 32]}>
                    <meshStandardMaterial color="#00d2ff" emissive="#00d2ff" emissiveIntensity={2} toneMapped={false} />
                </Sphere>
                <Sphere ref={rightEyeRef} position={[0.4, 0, 0]} args={[0.15, 32, 32]}>
                    <meshStandardMaterial color="#00d2ff" emissive="#00d2ff" emissiveIntensity={2} toneMapped={false} />
                </Sphere>
            </group>

            {/* Animated Mouth */}
            <group position={[0, -0.4, 1.05]}>
                <Box ref={mouthRef} args={[0.4, 0.1, 0.1]}>
                    <meshStandardMaterial color="#333" />
                </Box>
            </group>

            {/* Halo / Aura */}
            <Sphere args={[1.4, 32, 32]} position={[0, 0, -0.5]}>
                <meshBasicMaterial color="#00d2ff" wireframe transparent opacity={0.1} />
            </Sphere>
        </group>
    );
};

// --- Main Page ---
const VideoCounselor = () => {
    const [isListening, setIsListening] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("Hello. I am here to listen. How are you feeling right now?");

    // Quick TTS Function - Optimized for Human Tone
    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // 1. Voice Selection Strategy
        const voices = window.speechSynthesis.getVoices();
        // Priority: Google US -> Samantha -> Default
        const preferred = voices.find(v => v.name.includes('Google US English')) ||
            voices.find(v => v.name.includes('Samantha') && v.lang.includes('en')) ||
            voices.find(v => v.lang.includes('en-US'));

        if (preferred) utterance.voice = preferred;

        // 2. Humanization Params
        utterance.rate = 0.95; // Slightly slower is more therapeutic
        utterance.pitch = 1.0; // Neutral pitch

        utterance.onstart = () => setAiSpeaking(true);
        utterance.onend = () => setAiSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    // Initial Greeting
    useEffect(() => {
        // Need to wait for voices to load
        const init = () => {
            const timer = setTimeout(() => speak(aiResponse), 1000);
            return () => clearTimeout(timer);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
            init();
        } else {
            window.speechSynthesis.onvoiceschanged = init;
        }
    }, []);

    // ... rest of logic ...

    // Mock Interaction (Since we don't have real STT backend set up in this specific file yet)
    const toggleListening = () => {
        if (isListening) {
            setIsListening(false);
            // Simulate processing
            handleUserSpeech("I am feeling a bit anxious about my workload.");
        } else {
            setIsListening(true);
            setTranscript("Listening...");
        }
    };

    const handleUserSpeech = async (text) => {
        setTranscript(text);

        // Use a persistent ID for the video session or just a random one
        const videoChatId = "video-session-" + new Date().toISOString().split('T')[0];

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    uid: "user_video_session", // In real app, use AuthContext
                    chat_id: videoChatId,
                    mode: "video" // Use a video mode if supported, or just auto
                })
            });

            const data = await res.json();
            const reply = data.response || "I am listening, but I am having trouble connecting.";

            setAiResponse(reply);
            speak(reply);
        } catch (e) {
            console.error(e);
            speak("I am having trouble connecting to my brain. Please try again.");
        }
    };

    return (
        <div className="h-screen w-screen bg-[#FDFBF7] relative overflow-hidden flex flex-col md:flex-row font-sans text-[#4A3728]">

            {/* 3D Humanoid Area (Main Stage) */}
            <div className="flex-1 h-1/2 md:h-full relative">
                <div className="absolute top-6 left-6 z-20">
                    <Link to="/chat" className="p-3 bg-white/50 text-[#4A3728] border border-[#4A3728]/10 rounded-full hover:bg-white transition-all backdrop-blur-md flex items-center gap-2 shadow-sm">
                        <ArrowLeft size={18} />
                        <span className="font-bold text-sm">Return to Chat</span>
                    </Link>
                </div>

                <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    <ambientLight intensity={0.9} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} color="#FFD700" />
                    <pointLight position={[-10, 5, -10]} intensity={0.5} />
                    <Suspense fallback={null}>
                        <HumanoidAvatar talking={aiSpeaking} />
                        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.5} />
                    </Suspense>
                </Canvas>

                {/* Subtitles */}
                <div className="absolute bottom-10 left-0 w-full text-center px-4 md:px-20 z-10">
                    <p className="text-[#E94E1B] font-mono text-xs mb-2 tracking-widest font-bold">{aiSpeaking ? "COUNSELOR SPEAKING" : "LISTENING..."}</p>
                    <motion.div
                        key={aiResponse}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-medium text-[#4A3728] leading-relaxed drop-shadow-sm"
                    >
                        "{aiResponse}"
                    </motion.div>
                </div>
            </div>

            {/* User Interaction Panel (Webcam & Controls) */}
            <div className="h-1/2 md:h-full md:w-[400px] bg-white border-l border-[#4A3728]/10 relative flex flex-col shadow-xl">

                {/* Webcam Feed */}
                <div className="relative aspect-video bg-[#FDFBF7] m-6 rounded-3xl overflow-hidden border border-[#4A3728]/10 shadow-inner">
                    <Webcam
                        audio={false}
                        className="w-full h-full object-cover transform scale-x-[-1] opacity-90"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                        <div className="bg-[#E94E1B]/90 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md font-bold shadow-sm">
                            EMOTION ANALYSIS ACTIVE
                        </div>
                    </div>
                </div>

                {/* Analysis Stats */}
                <div className="px-8 py-4 flex-1">
                    <h3 className="text-[#4A3728]/50 text-xs font-bold uppercase mb-6 tracking-wider">Real-time Biometrics</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm text-[#4A3728] font-medium mb-2">
                                <span>Stress Level</span>
                                <span className="text-green-600">Low</span>
                            </div>
                            <div className="h-2 w-full bg-[#4A3728]/5 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[30%] rounded-full" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm text-[#4A3728] font-medium mb-2">
                                <span>Voice Clarity</span>
                                <span className="text-blue-600">High</span>
                            </div>
                            <div className="h-2 w-full bg-[#4A3728]/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[85%] rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-8 bg-[#FDFBF7]/50 backdrop-blur-sm mt-auto">
                    <button
                        onClick={toggleListening}
                        className={`w-full py-6 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] active:scale-95 ${isListening
                            ? 'bg-[#E94E1B] text-white animate-pulse' // Red/Orange for active
                            : 'bg-[#FFD700] text-[#4A3728] hover:bg-[#FFC000]' // Yellow for default
                            }`}
                    >
                        {isListening ? <MicOff /> : <Mic />}
                        {isListening ? "Stop Speaking" : "Tap to Speak"}
                    </button>
                    <p className="text-center text-[#4A3728]/40 text-xs mt-4 font-medium">
                        Press button and ask anything.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default VideoCounselor;
