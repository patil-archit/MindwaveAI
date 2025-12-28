import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase project config
// Get this from: https://console.firebase.google.com
const firebaseConfig = {
    apiKey: "AIzaSyCYRBpEdKip6KWLUhmzrkO4w-qiNxpYsyc",
    authDomain: "mindwaveai-b10ac.firebaseapp.com",
    projectId: "mindwaveai-b10ac",
    storageBucket: "mindwaveai-b10ac.firebasestorage.app",
    messagingSenderId: "792056638792",
    appId: "1:792056638792:web:872532110030549eed177d",
    measurementId: "G-DCCV7G0SZL"
};

import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
