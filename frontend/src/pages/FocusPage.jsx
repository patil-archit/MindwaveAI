import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, RefreshCw, Volume2, ArrowLeft, CloudRain, Trees, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const FocusPage = () => {
    const [isBreathing, setIsBreathing] = useState(false);
    const [script, setScript] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeSound, setActiveSound] = useState(null);
    const audioRef = React.useRef(new Audio());

    useEffect(() => {
        // Sound Library (Public Domain / CC0)
        const SOUND_URLS = {
            'rain': 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
            'forest': 'https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg',
            'waves': 'https://actions.google.com/sounds/v1/water/waves_crashing.ogg'
        };

        const audio = audioRef.current;

        if (activeSound) {
            audio.src = SOUND_URLS[activeSound];
            audio.loop = true;
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Audio playback error:", e));
        } else {
            audio.pause();
            audio.currentTime = 0;
        }

        return () => {
            audio.pause();
        };
    }, [activeSound]);

    // Breathing Voice Guidance
    useEffect(() => {
        let interval;
        let timeouts = [];

        const speak = (text) => {
            if (!window.speechSynthesis) return;
            window.speechSynthesis.cancel(); // Clear queue
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.85; // Slow and calming
            utterance.pitch = 1;
            // Try to find a good voice
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
            if (preferred) utterance.voice = preferred;

            window.speechSynthesis.speak(utterance);
        };

        if (isBreathing) {
            const runCycle = () => {
                speak("Breathe In");
                timeouts.push(setTimeout(() => speak("Hold"), 4000));
                timeouts.push(setTimeout(() => speak("Breathe Out"), 11000));
            };

            runCycle(); // Start immediately
            interval = setInterval(runCycle, 19000); // 19s cycle (4+7+8)
        } else {
            window.speechSynthesis.cancel();
        }

        return () => {
            clearInterval(interval);
            timeouts.forEach(clearTimeout);
            window.speechSynthesis.cancel();
        };
    }, [isBreathing]);

    const generateMeditation = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/meditate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: "stressed", duration: "1 minute" })
            });
            const data = await res.json();
            setScript(data.script);
        } catch (e) {
            console.error(e);
            alert("Could not generate meditation. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F2EA] p-6 md:p-12 font-sans text-[#4A3728] relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-uprock-orange rounded-full blur-3xl mix-blend-multiply filter animate-blob" />
                <div className="absolute top-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <Link to="/chat" className="p-3 bg-white/50 rounded-full hover:bg-white transition-all shadow-sm">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold">Focus Sanctuary</h1>
                        <p className="opacity-60">Center your mind. Reset your breathing.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                    {/* Breathing Section */}
                    <div className="bg-white/60 p-12 rounded-full aspect-square flex flex-col items-center justify-center relative shadow-xl border border-white/50">
                        <AnimatePresence mode="wait">
                            {isBreathing ? (
                                <motion.div
                                    key="breathing"
                                    animate={{
                                        scale: [1, 1.5, 1.5, 1],
                                        opacity: [0.8, 1, 1, 0.8]
                                    }}
                                    transition={{
                                        duration: 19, // 4-7-8 method (approx cycle)
                                        repeat: Infinity,
                                        times: [0, 0.2, 0.6, 1] // In (4s), Hold (7s), Out (8s) roughly
                                    }}
                                    className="w-48 h-48 bg-uprock-orange/80 rounded-full blur-xl absolute"
                                >
                                    <div className="w-full h-full bg-white/20 rounded-full animate-ping" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="w-48 h-48 bg-deep-brown/10 rounded-full absolute"
                                />
                            )}
                        </AnimatePresence>

                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl font-bold mb-4">{isBreathing ? "Breathe..." : "Ready?"}</h2>
                            <button
                                onClick={() => setIsBreathing(!isBreathing)}
                                className="px-8 py-3 bg-deep-brown text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                {isBreathing ? <Pause size={20} /> : <Play size={20} />}
                                {isBreathing ? "Stop" : "Start 4-7-8"}
                            </button>
                        </div>
                    </div>

                    {/* Controls & Generator */}
                    <div className="space-y-8">
                        {/* Soundscapes */}
                        <div className="bg-white/60 p-6 rounded-3xl border border-white/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2"><Volume2 size={20} /> Soundscapes</h3>
                                {activeSound && (
                                    <button
                                        onClick={() => setActiveSound(null)}
                                        className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full font-bold hover:bg-red-200"
                                    >
                                        Stop All
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-4">
                                {[
                                    { id: 'rain', icon: <CloudRain size={24} />, label: "Rain" },
                                    { id: 'forest', icon: <Trees size={24} />, label: "Forest" },
                                    { id: 'waves', icon: <Waves size={24} />, label: "Waves" }
                                ].map(sound => (
                                    <button
                                        key={sound.id}
                                        onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
                                        className={`flex-1 p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${activeSound === sound.id
                                            ? 'bg-deep-brown text-white shadow-md'
                                            : 'bg-white/50 hover:bg-white'
                                            }`}
                                    >
                                        {sound.icon}
                                        <span className="text-xs font-bold">{sound.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI Meditation */}
                        <div className="bg-white/60 p-6 rounded-3xl border border-white/50 min-h-[200px]">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><Wind size={20} /> AI Guidance</h3>

                            {!script && !loading && (
                                <div className="text-center py-8">
                                    <p className="mb-4 opacity-60 text-sm">Need a quick reset? I can generate a script for you.</p>
                                    <button
                                        onClick={generateMeditation}
                                        className="px-6 py-2 bg-uprock-orange text-white rounded-xl font-bold shadow-sm hover:bg-red-500 transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <RefreshCw size={18} /> Generate Script
                                    </button>
                                </div>
                            )}

                            {loading && (
                                <div className="flex justify-center py-8">
                                    <RefreshCw className="animate-spin text-uprock-orange" size={32} />
                                </div>
                            )}

                            {script && (
                                <div className="prose prose-sm prose-p:text-deep-brown">
                                    <p className="whitespace-pre-line leading-relaxed italic">
                                        "{script}"
                                    </p>
                                    <button
                                        onClick={() => setScript(null)}
                                        className="mt-4 text-xs font-bold text-deep-brown/40 hover:text-deep-brown uppercase tracking-wider"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FocusPage;
