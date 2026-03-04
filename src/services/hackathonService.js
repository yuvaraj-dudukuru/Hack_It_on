import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CONFIG_DOC_PATH = 'config/hackathonSettings';

export const hackathonService = {
    /**
     * Get global hackathon settings.
     */
    getSettings: async () => {
        try {
            const settingsDoc = await getDoc(doc(db, CONFIG_DOC_PATH));
            return settingsDoc.exists() ? settingsDoc.data() : null;
        } catch (error) {
            console.error("Error fetching hackathon settings:", error);
            throw error;
        }
    },

    /**
     * Subscribe to global hackathon settings.
     */
    subscribeToSettings: (callback) => {
        return onSnapshot(doc(db, CONFIG_DOC_PATH), (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            }
        });
    },

    /**
     * Initialize settings if they don't exist.
     */
    initializeSettings: async () => {
        try {
            const settingsRef = doc(db, CONFIG_DOC_PATH);
            const settingsDoc = await getDoc(settingsRef);

            if (!settingsDoc.exists()) {
                await setDoc(settingsRef, {
                    currentRound: 1,
                    round1: {
                        isActive: true,
                        isLocked: false,
                        deadline: null // Set manually by admin
                    },
                    round2: {
                        isActive: false,
                        isLocked: false,
                        deadline: null
                    },
                    round3: {
                        isActive: false,
                        isLocked: false,
                        deadline: null
                    },
                    updatedAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Error initializing settings:", error);
        }
    },

    /**
     * Update round settings (Admin only).
     */
    updateRoundSettings: async (settings) => {
        try {
            const settingsRef = doc(db, CONFIG_DOC_PATH);
            await updateDoc(settingsRef, {
                ...settings,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating settings:", error);
            throw error;
        }
    }
};
