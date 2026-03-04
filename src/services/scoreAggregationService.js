import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { auditLogService } from './auditLogService';

/**
 * Service for aggregating scores and finalizing rounds.
 */
export const scoreAggregationService = {
    /**
     * Finalize a round for a team.
     * Calculates the average or sum of scores and updates the Team document.
     */
    finalizeTeamRound: async (teamId, roundNumber, adminUid) => {
        try {
            const scoresQuery = query(
                collection(db, 'scores'),
                where('teamId', '==', teamId),
                where('round', '==', roundNumber)
            );

            const querySnapshot = await getDocs(scoresQuery);
            if (querySnapshot.empty) {
                throw new Error('No scores found for this team in this round.');
            }

            let totalPoints = 0;
            let scoreCount = 0;

            querySnapshot.forEach((doc) => {
                totalPoints += doc.data().total;
                scoreCount++;
            });

            // Simple sum for now, can be configured for averages
            const finalScore = totalPoints;

            const batch = writeBatch(db);

            // 1. Update team's total score (accumulated)
            const teamRef = doc(db, 'teams', teamId);
            batch.update(teamRef, {
                totalScore: finalScore,
                [`round${roundNumber}Status`]: 'qualified', // Auto-qualify if finalized? Or manual?
                updatedAt: serverTimestamp()
            });

            // 2. Update Leaderboard collection
            const leaderboardRef = doc(db, 'leaderboard', teamId);
            batch.set(leaderboardRef, {
                teamId,
                totalScore: finalScore,
                updatedAt: serverTimestamp()
            }, { merge: true });

            await batch.commit();

            // 3. Audit Log
            await auditLogService.logEvent(
                'ROUND_FINALIZED',
                adminUid,
                'admin',
                teamId,
                { round: roundNumber, finalScore }
            );

            return finalScore;
        } catch (error) {
            console.error("Error finalizing round:", error);
            throw error;
        }
    }
};
