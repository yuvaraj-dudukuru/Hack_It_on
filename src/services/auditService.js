import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Service for creating tamper-evident audit logs.
 */
/**
 * Service for creating tamper-evident audit logs.
 */
export const auditService = {
    /**
     * Log a critical event.
     * @param {string} actionType - E.g., 'ROUND_LOCK', 'SCORE_SUBMITTED', 'TEAM_QUALIFIED', 'PAYMENT_VERIFIED'
     * @param {string} performedBy - UID of the user performing the action
     * @param {string} role - Role of the user
     * @param {string} targetId - ID of the target (e.g., teamId)
     * @param {Object} metadata - Additional context for the log
     */
    logEvent: async (actionType, performedBy, role, targetId, metadata = {}) => {
        try {
            await addDoc(collection(db, 'auditLogs'), {
                actionType,
                performedBy,
                role,
                targetId,
                metadata,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Critical: Failed to write audit log:", error);
            // In a production app, you might want to send this to an external logging service
            // as a fallback (e.g., Sentry, Cloud Watch).
        }
    }
};
