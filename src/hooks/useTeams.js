import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Hook to fetch and listen to all teams.
 */
export const useTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teamData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeams(teamData);
            setLoading(false);
        }, (err) => {
            console.error("useTeams error:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { teams, loading, error };
};
