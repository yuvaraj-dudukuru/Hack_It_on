import { db } from '../config/firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Service for handling hackathon project submissions.
 */
export const submissionService = {
    /**
     * Submit or update a project submission.
     */
    submitProject: async (teamId, data) => {
        try {
            const submissionRef = doc(db, 'submissions', teamId);
            await setDoc(submissionRef, {
                ...data,
                teamId,
                lastUpdated: serverTimestamp()
            }, { merge: true });
            return { success: true };
        } catch (error) {
            console.error("Submission error:", error);
            throw error;
        }
    },

    /**
     * Validate public GitHub repository using GitHub API.
     */
    validateGitHubRepo: async (url) => {
        if (!url) return { status: 'idle' };

        const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
        if (!githubRegex.test(url)) return { status: 'invalid', message: 'Invalid GitHub URL format.' };

        try {
            const parts = url.replace(/\/$/, '').split('/');
            const owner = parts[parts.length - 2];
            const repo = parts[parts.length - 1];

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (response.ok) {
                const data = await response.json();
                if (data.private === false) {
                    return { status: 'valid', data };
                } else {
                    return { status: 'invalid', message: 'Repository must be public.' };
                }
            } else {
                return { status: 'invalid', message: 'Repository not found or API limit reached.' };
            }
        } catch (error) {
            return { status: 'invalid', message: 'Connection error during validation.' };
        }
    }
};
