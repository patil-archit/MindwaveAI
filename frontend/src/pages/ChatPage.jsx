import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Menu, Plus, User, Sparkles, Smile, Frown, Zap, HelpCircle, AlertCircle, Trash2, Edit2, Search, Network, Link as LinkIcon, Volume2, VolumeX, Database, Wind, Video } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useVoice from '../hooks/useVoice';
import { Mic, MicOff } from 'lucide-react';
import FaceSensor from '../components/FaceSensor';
import BrainGraph from '../components/BrainGraph';
import AmbientSynth from '../components/AmbientSynth';
import TruthAnchor from '../components/TruthAnchor';

// Emotion icons mapping
const EmotionIcon = ({ emotion }) => {
    switch (emotion) {
        case 'happy': return <Smile size={20} className="text-uprock-yellow" />;
        case 'sad': return <Frown size={20} className="text-blue-400" />;
        case 'angry': return <Zap size={20} className="text-red-500" />;
        case 'curious': return <HelpCircle size={20} className="text-purple-500" />;
        default: return <Sparkles size={20} className="text-uprock-orange" />;
    }
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const ChatPage = () => {
    const { currentUser, logout } = useAuth();
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatMode, setChatMode] = useState('auto'); // 'auto', 'logic', 'support', 'motivation'
    const [currentEmotion, setCurrentEmotion] = useState('neutral');
    const [showGraph, setShowGraph] = useState(false);
    const [showAnchor, setShowAnchor] = useState(false);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [faceEmotion, setFaceEmotion] = useState('neutral');
    const [loading, setLoading] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [currentQuote, setCurrentQuote] = useState(null);
    const [isTtsEnabled, setIsTtsEnabled] = useState(false); // TTS Toggle
    const [activeThought, setActiveThought] = useState(null); // Modal State
    const messagesEndRef = useRef(null);

    // Voice Hook
    const { isListening, startListening, stopListening, transcript, setTranscript, speak, stopSpeaking, isSpeaking } = useVoice();

    // Auto-fill input from voice and (Optional) Auto-send?
    // Let's autosend for fluid conversation
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
            // Optional: Auto-send after short delay if desired, or just let user click send.
            // For now, just fill input. User review is better.
        }
    }, [transcript]);

    // Inspirational quotes collection
    const quotes = [
        {
            text: "The best way to predict the future is to create it.",
            author: "Peter Drucker"
        },
        {
            text: "Your mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.",
            author: "Unknown"
        },
        {
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs"
        },
        {
            text: "Believe you can and you're halfway there.",
            author: "Theodore Roosevelt"
        },
        {
            text: "Every moment is a fresh beginning.",
            author: "T.S. Eliot"
        },
        {
            text: "The future belongs to those who believe in the beauty of their dreams.",
            author: "Eleanor Roosevelt"
        },
        {
            text: "It always seems impossible until it's done.",
            author: "Nelson Mandela"
        },
        {
            text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
            author: "Ralph Waldo Emerson"
        },
        {
            text: "The only impossible journey is the one you never begin.",
            author: "Tony Robbins"
        },
        {
            text: "In the middle of difficulty lies opportunity.",
            author: "Albert Einstein"
        },
        {
            text: "Your limitation—it's only your imagination.",
            author: "Unknown"
        },
        {
            text: "Great things never come from comfort zones.",
            author: "Unknown"
        },
        {
            text: "The mind is everything. What you think you become.",
            author: "Buddha"
        },
        {
            text: "Happiness is not by chance, but by choice.",
            author: "Jim Rohn"
        },
        {
            text: "The journey of a thousand miles begins with one step.",
            author: "Lao Tzu"
        }
    ];

    // Select random quote on mount
    useEffect(() => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setCurrentQuote(randomQuote);

        // Hide splash after 5 seconds
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);


    // Get current chat messages
    const currentChat = chats.find(chat => chat.id === currentChatId);
    const messages = currentChat?.messages || [];

    // Load chats from Supabase or localStorage
    useEffect(() => {
        if (!currentUser) return;

        const loadChats = async () => {
            try {
                // Load from Backend API
                const response = await fetch(`${API_BASE_URL}/chats/${currentUser.uid}`);
                if (!response.ok) throw new Error('Failed to fetch chats');

                const chatsData = await response.json();

                if (chatsData && chatsData.length > 0) {
                    const loadedChats = chatsData.map(chat => ({
                        id: chat.id,
                        title: chat.title,
                        messages: chat.messages || [],
                        createdAt: new Date(chat.created_at),
                        lastUpdated: new Date(chat.updated_at)
                    }));
                    setChats(loadedChats);
                    setCurrentChatId(loadedChats[0].id);
                    return;
                }
            } catch (error) {
                console.error('API load failed, using localStorage:', error);
            }

            // Fallback to localStorage
            const chatsKey = `chats_${currentUser.uid}`;
            const currentChatKey = `currentChatId_${currentUser.uid}`;

            const savedChats = localStorage.getItem(chatsKey);
            const savedCurrentChatId = localStorage.getItem(currentChatKey);

            if (savedChats) {
                try {
                    const parsedChats = JSON.parse(savedChats);
                    const chatsWithDates = parsedChats.map(chat => ({
                        ...chat,
                        createdAt: new Date(chat.createdAt),
                        lastUpdated: new Date(chat.lastUpdated),
                        messages: chat.messages.map(msg => ({
                            ...msg,
                            timestamp: new Date(msg.timestamp),
                            createdAt: new Date(msg.createdAt)
                        }))
                    }));
                    setChats(chatsWithDates);

                    if (savedCurrentChatId && chatsWithDates.find(c => c.id === savedCurrentChatId)) {
                        setCurrentChatId(savedCurrentChatId);
                    } else if (chatsWithDates.length > 0) {
                        setCurrentChatId(chatsWithDates[0].id);
                    }
                } catch (error) {
                    console.error('Error loading chats from localStorage:', error);
                    createNewChat();
                }
            } else {
                createNewChat();
            }
        };

        loadChats();
    }, [currentUser]);

    // Save chats to localStorage as fallback when Firestore is not available
    useEffect(() => {
        if (!currentUser || chats.length === 0) return;

        // Save if any chat has messages
        const hasMessages = chats.some(chat => chat.messages && chat.messages.length > 0);

        if (hasMessages) {
            const chatsKey = `chats_${currentUser.uid}`;
            const currentChatKey = `currentChatId_${currentUser.uid}`;

            try {
                localStorage.setItem(chatsKey, JSON.stringify(chats));
                if (currentChatId) {
                    localStorage.setItem(currentChatKey, currentChatId);
                }
            } catch (error) {
                console.error('Error saving chats to localStorage:', error);
            }
        }
    }, [chats, currentChatId, currentUser]);

    // Update emotion when switching chats
    useEffect(() => {
        if (messages.length > 0) {
            const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
            if (lastAiMsg && lastAiMsg.emotion) {
                setCurrentEmotion(lastAiMsg.emotion);
            }
        } else {
            setCurrentEmotion('neutral');
        }
    }, [currentChatId, messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const fetchGraph = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/graph`);
            const data = await res.json();
            setGraphData(data);
        } catch (e) {
            console.error("Graph load failed", e);
        }
    };

    useEffect(() => {
        if (showGraph) {
            fetchGraph();
        }
    }, [showGraph, messages]); // Refresh when messages change

    const generateChatTitle = (firstMessage) => {
        const text = firstMessage.substring(0, 30);
        return text.length < firstMessage.length ? text + '...' : text;
    };

    const createNewChat = async () => {
        const newChatData = {
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
            lastUpdated: new Date()
        };

        // Optimistic update: add to local state immediately
        const tempId = `temp_${Date.now()}`;
        const tempChat = { id: tempId, ...newChatData };
        setChats(prev => [tempChat, ...prev]);
        setCurrentChatId(tempId);
        setCurrentEmotion('neutral');

        try {
            // Call Backend API
            const response = await fetch(`${API_BASE_URL}/chats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.uid,
                    title: 'New Chat'
                })
            });

            if (!response.ok) throw new Error('Failed to create chat');
            const data = await response.json();

            // Update with real ID
            setChats(prev => prev.map(chat =>
                chat.id === tempId ? { ...chat, id: data.id } : chat
            ));
            setCurrentChatId(data.id);
        } catch (error) {
            console.error('Backend create failed, keeping local chat:', error);
            // Keep the temp chat
        }
    };

    const switchChat = (chatId) => {
        setCurrentChatId(chatId);
    };

    const deleteChat = async (chatId, e) => {
        e.stopPropagation();

        if (!chatId && chatId !== 0) {
            console.error('Invalid chatId:', chatId);
            return;
        }

        if (!confirm('Are you sure you want to delete this chat?')) {
            return;
        }

        // Optimistic update: remove from local state immediately
        setChats(prev => prev.filter(chat => chat.id !== chatId));

        if (chatId === currentChatId) {
            const remainingChats = chats.filter(chat => chat.id !== chatId);
            if (remainingChats.length > 0) {
                setCurrentChatId(remainingChats[0].id);
            } else {
                createNewChat();
            }
        }

        // Skip Supabase for temp chats (which are strings starting with temp_)
        if (typeof chatId === 'string' && chatId.startsWith('temp_')) return;

        try {
            // Call Backend API
            const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete chat');
        } catch (error) {
            console.error('Backend delete failed, but local state updated:', error);
            // Local state is already updated
        }
    };

    const renameChat = async (chatId, currentTitle, e) => {
        e.stopPropagation();
        const newTitle = prompt("Enter new chat name:", currentTitle);
        if (!newTitle || newTitle.trim() === currentTitle) return;

        // Optimistic update
        setChats(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, title: newTitle.trim() } : chat
        ));

        // Skip Supabase for temp chats
        if (typeof chatId === 'string' && chatId.startsWith('temp_')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle.trim() })
            });

            if (!response.ok) throw new Error('Failed to rename chat');
        } catch (error) {
            console.error('Rename failed:', error);
            alert('Failed to rename chat. Check backend logs.');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || !currentUser || !currentChatId) {
            console.warn('Cannot send message:', { input: input.trim(), loading, currentUser: !!currentUser, currentChatId });
            return;
        }

        // Ensure currentChatId is valid
        if (!currentChatId && currentChatId !== 0) {
            console.error('Invalid currentChatId:', currentChatId);
            return;
        }

        const userText = input;
        setInput('');
        setLoading(true);

        // Create user message
        const userMessage = {
            id: Date.now().toString() + '-user',
            sender: 'user',
            text: userText,
            role: 'user',
            timestamp: new Date(),
            emotion: currentEmotion,
            createdAt: new Date()
        };

        // Optimistic UI Update (Local Only)
        setChats(prev => prev.map(chat => {
            if (chat.id === currentChatId) {
                const newMessages = [...chat.messages, userMessage];
                let title = chat.title;
                if (chat.title === 'New Chat' && chat.messages.length === 0) {
                    title = generateChatTitle(userText);
                }
                return { ...chat, messages: newMessages, title, lastUpdated: new Date() };
            }
            return chat;
        }));

        try {
            // Prepare History for Backend (Last 10 messages including the new one)
            const updatedMessages = [...messages, userMessage];
            const history = updatedMessages.slice(-11).slice(0, -1).map(m => ({
                role: m.sender === 'user' ? 'user' : 'ai',
                content: m.text
            }));

            // Call Backend
            const payload = {
                message: userText,
                uid: String(currentUser.uid),
                chat_id: String(currentChatId),
                face_emotion: faceEmotion,
                mode: chatMode,
                email: currentUser.email || null // Pass user email
            };

            // Calculate title if new chat
            const chatToUpdate = chats.find(c => c.id === currentChatId);
            if (chatToUpdate && chatToUpdate.title === 'New Chat' && (!chatToUpdate.messages || chatToUpdate.messages.length === 0)) {
                payload.title = generateChatTitle(userText);
            }

            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Create AI response
            const aiMessage = {
                id: Date.now().toString() + '-ai',
                sender: 'ai',
                text: data.response,
                role: 'ai',
                timestamp: new Date(),
                emotion: data.emotion,
                agent_thoughts: data.agent_thoughts, // Store thoughts
                createdAt: new Date()
            };

            // Add AI response to Local State (Backend already saved it)
            setChats(prev => prev.map(chat => {
                if (chat.id === currentChatId) {
                    return { ...chat, messages: [...chat.messages, aiMessage], lastUpdated: new Date() };
                }
                return chat;
            }));

            setCurrentEmotion(data.emotion);

            // Auto-enable TTS and speak the response
            setIsTtsEnabled(true);
            speak(data.response);

        } catch (error) {
            console.error("Error sending message:", error);
            // Add error message and save to Supabase
            const errorMessage = {
                id: Date.now().toString() + '-error',
                sender: 'ai',
                text: `Sorry, I encountered an error: ${error.message}`,
                role: 'ai',
                timestamp: new Date(),
                emotion: 'neutral',
                createdAt: new Date()
            };
            setChats(prev => prev.map(chat => {
                if (chat.id === currentChatId) {
                    return { ...chat, messages: [...chat.messages, errorMessage], lastUpdated: new Date() };
                }
                return chat;
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Main Chat Interface */}
            <div className="flex h-screen overflow-hidden p-4 pt-24 gap-6 bg-warm-bg font-sans relative z-10">
                {/* Sidebar */}
                <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 300, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="hidden md:flex flex-col glass-panel h-full p-6 overflow-hidden shrink-0"
                        >

                            <button
                                onClick={createNewChat}
                                className="flex items-center gap-3 w-full p-4 mb-2 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all text-deep-brown font-semibold border border-deep-brown/5"
                            >
                                <Plus size={20} className="text-uprock-orange" />
                                <span>New Chat</span>
                            </button>

                            <Link
                                to="/search"
                                className="flex items-center gap-3 w-full p-4 mb-6 rounded-3xl bg-uprock-yellow/20 hover:bg-uprock-yellow/30 transition-all text-deep-brown font-semibold border border-uprock-yellow/50"
                            >
                                <Search size={20} className="text-deep-brown" />
                                <span>Memory Vault</span>
                            </Link>

                            <button
                                onClick={() => setShowGraph(!showGraph)}
                                className={`flex items-center gap-3 w-full p-4 mb-2 rounded-3xl transition-all font-semibold border ${showGraph
                                    ? 'bg-uprock-orange text-white border-uprock-orange'
                                    : 'bg-white/50 border-deep-brown/5 text-deep-brown hover:bg-white/80'}`}
                            >
                                <Network size={20} className={showGraph ? "text-white" : "text-deep-brown"} />
                                <span>Neural Graph</span>
                            </button>

                            <Link
                                to="/insights"
                                className="flex items-center gap-3 w-full p-4 mb-2 rounded-3xl bg-purple-100/50 hover:bg-purple-100 transition-all text-deep-brown font-semibold border border-purple-200/50"
                            >
                                <Zap size={20} className="text-purple-600" />
                                <span>Insight Dashboard</span>
                            </Link>

                            <Link
                                to="/focus"
                                className="flex items-center gap-3 w-full p-4 mb-2 rounded-3xl bg-teal-100/50 hover:bg-teal-100 transition-all text-deep-brown font-semibold border border-teal-200/50"
                            >
                                <Wind size={20} className="text-teal-600" />
                                <span>Focus Sanctuary</span>
                            </Link>

                            <Link
                                to="/video-session"
                                className="flex items-center gap-3 w-full p-4 mb-2 rounded-3xl bg-red-100/50 hover:bg-red-100 transition-all text-deep-brown font-semibold border border-red-200/50"
                            >
                                <Video size={20} className="text-red-500" />
                                <span>3D Video Counselor</span>
                            </Link>

                            <button
                                onClick={async () => {
                                    if (confirm("Generate demo data for your account? This will add chats to your history.")) {
                                        try {
                                            await fetch(`${API_BASE_URL}/seed/${currentUser.uid}`, { method: 'POST' });
                                            alert("Seeding started! Give it a moment and then check your Graph.");
                                        } catch (e) { alert("Error seeding: " + e.message); }
                                    }
                                }}
                                className="flex items-center gap-3 w-full p-4 mb-6 rounded-3xl bg-blue-100/50 hover:bg-blue-100 transition-all text-deep-brown font-semibold border border-blue-200/50"
                            >
                                <Database size={20} className="text-blue-500" />
                                <span>Seed Demo Data</span>
                            </button>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {chats.map(chat => (
                                    <div
                                        key={chat.id}
                                        onClick={() => switchChat(chat.id)}
                                        className={`p-4 rounded-3xl text-deep-brown text-sm font-medium cursor-pointer transition-all group relative ${chat.id === currentChatId
                                            ? 'bg-uprock-yellow/20 border border-uprock-yellow/50'
                                            : 'bg-white/50 border border-deep-brown/5 hover:bg-white/80'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold truncate">{chat.title}</div>
                                                <div className="text-xs text-deep-brown/60 mt-1">
                                                    {new Date(chat.lastUpdated).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => renameChat(chat.id, chat.title, e)}
                                                    className="p-1 hover:bg-gray-100 rounded-lg text-deep-brown/60 hover:text-deep-brown"
                                                    title="Rename chat"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => deleteChat(chat.id, e)}
                                                    className="p-1 hover:bg-red-100 rounded-lg text-red-400 hover:text-red-600"
                                                    title="Delete chat"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 mt-auto p-2">
                                <div className="w-10 h-10 rounded-full bg-deep-brown/10 flex items-center justify-center">
                                    <User size={20} className="text-deep-brown" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-deep-brown">{currentUser?.email?.split('@')[0] || 'User'}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col glass-panel h-full relative overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-deep-brown/5 bg-white/40 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-white/50 rounded-full transition-colors md:hidden"
                            >
                                <Menu size={24} className="text-deep-brown" />
                            </button>
                            <div className="flex items-center gap-2">



                                <button
                                    onClick={() => setShowAnchor(true)}
                                    className="p-2 rounded-full hover:bg-deep-brown/10 text-deep-brown transition-colors"
                                    title="Open Truth Anchor (Blockchain)"
                                >
                                    <LinkIcon size={20} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (isTtsEnabled) {
                                            stopSpeaking();
                                            setIsTtsEnabled(false);
                                        } else {
                                            setIsTtsEnabled(true);
                                        }
                                    }}
                                    className={`p-2 rounded-full transition-colors ${isTtsEnabled ? 'bg-uprock-orange text-white' : 'hover:bg-deep-brown/10 text-deep-brown'}`}
                                    title={isTtsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                                >
                                    {isTtsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                </button>
                                <span className="font-bold text-lg text-deep-brown">Mindwave AI</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${currentEmotion === 'angry' ? 'bg-red-100 text-red-600' :
                                    currentEmotion === 'happy' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-slate-100 text-deep-brown/60'
                                    }`}>
                                    {currentEmotion}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
                        {messages.length === 0 && (
                            <div className="text-center text-deep-brown/40 mt-20">
                                <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Start a new conversation...</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.sender === 'ai' && (
                                        <span className="text-xs font-bold text-deep-brown/40 mb-2 ml-4">Companion</span>
                                    )}
                                    <div className={`p-6 md:p-8 text-base md:text-lg leading-relaxed ${msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'
                                        }`}>
                                        <ReactMarkdown
                                            components={{
                                                strong: ({ node, ...props }) => <span className="font-bold text-deep-brown" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 block my-2" {...props} />,
                                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0 block" {...props} />
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>

                                        {/* Council Member Buttons */}
                                        {msg.agent_thoughts && typeof msg.agent_thoughts === 'object' && (
                                            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-deep-brown/10">
                                                {Object.entries(msg.agent_thoughts).map(([persona, thought]) => (
                                                    <button
                                                        key={persona}
                                                        onClick={() => setActiveThought({ persona, thought })}
                                                        className="px-3 py-1.5 bg-white/50 hover:bg-white rounded-lg text-xs font-bold text-deep-brown/80 shadow-sm border border-deep-brown/5 transition-all flex items-center gap-2"
                                                    >
                                                        <span>
                                                            {persona.includes("Logic") ? "🏛️" :
                                                                persona.includes("Support") ? "❤️" : "🏆"}
                                                        </span>
                                                        {persona}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {msg.sender === 'ai' && (
                                        <div className="mt-2 ml-4 p-1.5 bg-white/50 rounded-full w-fit shadow-sm">
                                            <EmotionIcon emotion={msg.emotion} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="p-6 rounded-t-4xl rounded-br-4xl rounded-bl-lg bg-white/50 text-deep-brown/60 text-sm flex items-center gap-2">
                                    <Sparkles size={16} className="animate-pulse text-uprock-orange" />
                                    Thinking...
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area + Mode Selector */}
                    <div className="p-6 md:p-8 bg-white/40 backdrop-blur-md flex flex-col gap-4">
                        {/* Mode Selector */}
                        <div className="flex gap-2 mx-auto bg-white/50 p-1 rounded-full border border-white/60 shadow-sm">
                            {['auto', 'logic', 'support', 'motivation'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setChatMode(mode)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${chatMode === mode
                                        ? 'bg-deep-brown text-white shadow-md'
                                        : 'text-deep-brown/60 hover:bg-white/80'
                                        }`}
                                >
                                    {mode === 'auto' ? '🧠 Council' :
                                        mode === 'logic' ? '🏛️ Logic' :
                                            mode === 'support' ? '❤️ Support' : '🏆 Motivation'}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={sendMessage} className="relative max-w-4xl w-full mx-auto flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Message the ${chatMode === 'auto' ? 'Council' : chatMode.charAt(0).toUpperCase() + chatMode.slice(1)}...`}
                                className="w-full glass-input pr-16 text-lg"
                                disabled={loading}
                            />

                            {/* Voice Button */}
                            <button
                                type="button"
                                onClick={isListening ? stopListening : startListening}
                                className={`absolute right-14 p-2 rounded-full transition-all ${isListening
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'text-deep-brown/40 hover:bg-black/5 hover:text-deep-brown'
                                    }`}
                                title="Voice Input"
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 p-3 bg-deep-brown rounded-full text-white shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Active Thought Modal */}
            <AnimatePresence>
                {activeThought && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveThought(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            <div className={`p-6 ${activeThought.persona.includes("Logic") ? "bg-stone-200" :
                                activeThought.persona.includes("Support") ? "bg-rose-100" :
                                    "bg-amber-100"
                                }`}>
                                <h3 className="text-xl font-bold text-deep-brown flex items-center gap-2">
                                    <span>
                                        {activeThought.persona.includes("Logic") ? "🏛️" :
                                            activeThought.persona.includes("Support") ? "❤️" : "🏆"}
                                    </span>
                                    {activeThought.persona}
                                </h3>
                            </div>
                            <div className="p-8">
                                <p className="text-lg leading-relaxed text-deep-brown/80 font-medium italic">
                                    "{activeThought.thought}"
                                </p>
                                <button
                                    onClick={() => setActiveThought(null)}
                                    className="mt-8 w-full py-3 bg-deep-brown text-white rounded-xl font-bold hover:bg-deep-brown/90 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Neural Constellation Overlay */}
            {/* Neural Constellation Overlay */}
            <AnimatePresence>
                {showGraph && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <div className="w-full h-full max-w-7xl max-h-[95vh] relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-uprock-orange/20 glow-border">
                            {/* Close Button */}
                            <button
                                onClick={() => setShowGraph(false)}
                                className="absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
                            >
                                <VolumeX className="rotate-45" size={24} />
                            </button>

                            {/* Graph Component */}
                            <BrainGraph graphData={graphData} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quantum Canvas (Music) */}
            <AmbientSynth emotion={currentEmotion} />

            {/* Blockchain Anchor */}
            {showAnchor && <TruthAnchor onClose={() => setShowAnchor(false)} />}

            {/* Face Emotion Sensor */}
            <FaceSensor onEmotionChange={setFaceEmotion} />
        </>
    );
};

export default ChatPage;
