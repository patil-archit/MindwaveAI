import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Volume2, VolumeX, Music } from 'lucide-react';

// Scale Definitions
const SCALES = {
    happy: ['C4', 'E4', 'G4', 'B4', 'C5', 'E5', 'G5'], // Major
    sad: ['A3', 'C4', 'E4', 'A4', 'C5', 'E5'], // Minor
    angry: ['C3', 'C#3', 'F3', 'F#3', 'G3', 'C4'], // Diminished/Dissonant
    neutral: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'], // Pentatonic (Calm)
    fear: ['C4', 'Db4', 'Eb4', 'F#4', 'G4', 'C5'], // Locrian-ish
    excited: ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'] // High energy
};

const AmbientSynth = ({ emotion = 'neutral' }) => {
    const [isMuted, setIsMuted] = useState(true);
    const [isStarted, setIsStarted] = useState(false);

    // Synths refs
    const synthRef = useRef(null);
    const loopRef = useRef(null);
    const reverbRef = useRef(null);

    // Initialize Audio Context (User interaction required)
    const startAudio = async () => {
        await Tone.start();

        if (!synthRef.current) {
            // Create a polyphonic synth
            const reverb = new Tone.Reverb(3).toDestination();
            const delay = new Tone.FeedbackDelay("8n", 0.5).connect(reverb);

            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: {
                    attack: 2,
                    decay: 1,
                    sustain: 0.5,
                    release: 2
                }
            }).connect(delay);

            reverbRef.current = reverb;
        }

        if (!loopRef.current) {
            // Create a generative loop
            loopRef.current = new Tone.Loop(time => {
                playRandomNote(time);
            }, "4n").start(0);
        }

        Tone.Transport.start();
        setIsMuted(false);
        setIsStarted(true);
    };

    const toggleMute = () => {
        if (!isStarted) {
            startAudio();
            return;
        }

        if (isMuted) {
            Tone.Destination.mute = false;
            setIsMuted(false);
        } else {
            Tone.Destination.mute = true;
            setIsMuted(true);
        }
    };

    const playRandomNote = (time) => {
        if (!synthRef.current) return;

        // Pick scale based on emotion
        const scale = SCALES[emotion] || SCALES.neutral;

        // 50% chance to play a note
        if (Math.random() > 0.4) {
            const note = scale[Math.floor(Math.random() * scale.length)];
            const duration = Math.random() > 0.5 ? "2n" : "4n";
            // Randomize velocity for human feel
            synthRef.current.triggerAttackRelease(note, duration, time, Math.random() * 0.3 + 0.1);
        }
    };

    // React to emotion changes
    useEffect(() => {
        if (!synthRef.current) return;

        // Modulate synth parameters based on emotion
        if (emotion === 'angry') {
            synthRef.current.set({ oscillator: { type: "sawtooth" } });
            Tone.Transport.bpm.rampTo(120, 1);
        } else if (emotion === 'sad') {
            synthRef.current.set({ oscillator: { type: "sine" } });
            Tone.Transport.bpm.rampTo(60, 2);
        } else if (emotion === 'happy') {
            synthRef.current.set({ oscillator: { type: "triangle" } });
            Tone.Transport.bpm.rampTo(100, 1);
        } else {
            // Neutral
            synthRef.current.set({ oscillator: { type: "triangle" } });
            Tone.Transport.bpm.rampTo(80, 2);
        }

    }, [emotion]);

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={toggleMute}
                className={`p-3 rounded-full shadow-lg transition-all ${isMuted ? 'bg-white/10 text-deep-brown/40' : 'bg-uprock-orange text-white animate-pulse-slow'}`}
                title={isMuted ? "Turn on Ambient Music" : "Mute Music"}
            >
                {isMuted ? <VolumeX size={20} /> : <Music size={20} />}
            </button>
        </div>
    );
};

export default AmbientSynth;
