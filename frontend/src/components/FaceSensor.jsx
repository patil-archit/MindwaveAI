import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, Eye, EyeOff } from 'lucide-react';

// Using a public CDN for models to avoid local download issues
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

const FaceSensor = ({ onEmotionChange }) => {
    const videoRef = useRef();
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [detectedEmotion, setDetectedEmotion] = useState('neutral');
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            try {
                // Load only the essential models for expression detection
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelLoaded(true);
                console.log("FaceAPI Models Loaded");
            } catch (error) {
                console.error("Error loading FaceAPI models:", error);
            }
        };
        loadModels();
    }, []);

    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: {} })
            .then((stream) => {
                videoRef.current.srcObject = stream;
                setIsStreamActive(true);
                setShowVideo(true);
            })
            .catch((err) => console.error("Error accessing webcam:", err));
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreamActive(false);
            setShowVideo(false);
        }
    };

    useEffect(() => {
        let interval;
        if (isStreamActive && isModelLoaded) {
            interval = setInterval(async () => {
                if (videoRef.current) {
                    const detections = await faceapi
                        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                        .withFaceExpressions();

                    if (detections.length > 0) {
                        // Get the dominant emotion
                        const expressions = detections[0].expressions;
                        const maxEmotion = Object.keys(expressions).reduce((a, b) =>
                            expressions[a] > expressions[b] ? a : b
                        );

                        setDetectedEmotion(maxEmotion);
                        onEmotionChange(maxEmotion);
                    }
                }
            }, 1000); // Scan every 1s
        }
        return () => clearInterval(interval);
    }, [isStreamActive, isModelLoaded, onEmotionChange]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
            {/* The Vision Widget */}
            <div className="pointer-events-auto bg-gray-900/90 backdrop-blur-md p-2 rounded-2xl border border-gray-700 shadow-xl flex flex-col items-center gap-2 transition-all">

                {/* Header / Toggle */}
                <div className="flex items-center gap-2 mb-1">
                    <button
                        onClick={isStreamActive ? stopVideo : startVideo}
                        className={`p-2 rounded-full transition-colors ${isStreamActive ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                            }`}
                        title={isStreamActive ? "Turn Off Vision" : "Enable Vision"}
                    >
                        <Camera size={20} />
                    </button>
                    {isStreamActive && (
                        <button
                            onClick={() => setShowVideo(!showVideo)}
                            className="p-2 rounded-full bg-gray-700/50 text-gray-400 hover:text-white"
                        >
                            {showVideo ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>

                {/* Video Feed */}
                <div className={`relative overflow-hidden rounded-lg transition-all duration-300 ${showVideo ? 'w-32 h-24' : 'w-0 h-0 opacity-0'
                    }`}>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-1">
                        {detectedEmotion.toUpperCase()}
                    </div>
                </div>

                {/* Status Indicator */}
                {isStreamActive && !showVideo && (
                    <div className="text-xs text-green-400 font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        SCANNING: {detectedEmotion.toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceSensor;
