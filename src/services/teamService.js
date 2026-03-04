import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Service for team and user profile operations.
 */
export const teamService = {
    /**
     * Get user profile by UID
     */
    getUserProfile: async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    /**
     * Create or update user profile
     */
    createUserProfile: async (uid, data) => {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, {
                ...data,
                uid,
                role: data.role || 'participant',
                createdAt: serverTimestamp(),
            }, { merge: true });
        } catch (error) {
            console.error("Error creating user profile:", error);
            throw error;
        }
    },

    /**
     * Assign role to user (Admin only ideally)
     */
    assignRole: async (uid, role) => {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { role });
        } catch (error) {
            console.error("Error assigning role:", error);
            throw error;
        }
    }
};
