import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User profile data or null if not found
 */
export const getUserProfile = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

/**
 * Create initial user profile in Firestore
 * @param {string} uid - User ID
 * @param {Object} initialData - Initial profile data (email, displayName, etc.)
 * @returns {Promise<void>}
 */
export const createUserProfile = async (uid, initialData) => {
    try {
        const userRef = doc(db, 'users', uid);
        const profileData = {
            uid,
            email: initialData.email || '',
            fullName: initialData.displayName || '',
            age: '',
            phone: '',
            bio: '',
            location: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(userRef, profileData);
        return profileData;
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
};

/**
 * Update user profile in Firestore
 * @param {string} uid - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (uid, profileData) => {
    try {
        const userRef = doc(db, 'users', uid);
        const updateData = {
            ...profileData,
            updatedAt: serverTimestamp()
        };

        await updateDoc(userRef, updateData);
        return updateData;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};
