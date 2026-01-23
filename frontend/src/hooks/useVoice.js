import { useState, useEffect, useRef, useCallback } from 'react';

const useVoice = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);
    const synthesisRef = useRef(window.speechSynthesis);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false; // Only final results
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari.");
            alert("Voice Input not supported in this browser. Please use Chrome.");
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                setTranscript(''); // Clear previous
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting recognition:", e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const speak = useCallback((text) => {
        if (!synthesisRef.current) return;

        // Cancel existing speech
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Select the most human-like voice available
        const voices = synthesisRef.current.getVoices();
        
        // Priority list for better voices
        const preferredVoice = voices.find(v => 
            v.name.includes("Google US English") || 
            v.name.includes("Samantha") ||
            (v.name.includes("Natural") && v.lang.startsWith("en")) ||
            (v.name.includes("Enhanced") && v.lang.startsWith("en"))
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Slight adjustments for natural flow
        utterance.rate = 1.0; 
        utterance.pitch = 1.0; 

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        synthesisRef.current.speak(utterance);
    }, []);

    const stopSpeaking = useCallback(() => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        isListening,
        startListening,
        stopListening,
        transcript,
        setTranscript, // To allow manual implementation clearing
        speak,
        stopSpeaking,
        isSpeaking
    };
};

export default useVoice;
