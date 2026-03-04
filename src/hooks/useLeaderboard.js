import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Hook to fetch and listen to the public leaderboard.
 */
export const useLeaderboard = () => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'leaderboard'), orderBy('totalScore', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setStandings(data);
            setLoading(false);
        }, (err) => {
            console.error("useLeaderboard error:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { standings, loading, error };
};
