import { useState, useEffect } from 'react';
import { hackathonService } from '../services/hackathonService';

/**
 * Hook to check if a specific action is allowed based on the current round state.
 */
export const useRoundGuard = (roundNumber) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = hackathonService.subscribeToSettings((data) => {
            setSettings(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const isActionAllowed = () => {
        if (loading || !settings) return false;

        const roundKey = `round${roundNumber}`;
        const round = settings[roundKey];

        if (!round) return false;

        const now = new Date();
        const deadline = round.deadline?.toDate();

        return (
            round.isActive &&
            !round.isLocked &&
            (!deadline || now < deadline)
        );
    };

    const getRoundStatus = () => {
        if (loading || !settings) return 'loading';
        const round = settings[`round${roundNumber}`];
        if (round?.isLocked) return 'locked';
        if (!round?.isActive) return 'inactive';

        const deadline = round.deadline?.toDate();
        if (deadline && new Date() > deadline) return 'expired';

        return 'active';
    };

    return { settings, loading, isActionAllowed: isActionAllowed(), status: getRoundStatus() };
};
