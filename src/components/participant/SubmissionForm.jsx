import { Github, Globe, FileText, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useRoundGuard } from '../../hooks/useRoundGuard';
import { hackathonService } from '../../services/hackathonService';

const SubmissionForm = ({ teamId, existingSubmission }) => {
    const { status, isActionAllowed, loading: guardLoading } = useRoundGuard(1);
    const [pptLink, setPptLink] = useState(existingSubmission?.pptLink || '');
    const [githubLink, setGithubLink] = useState(existingSubmission?.githubLink || '');
    const [deployLink, setDeployLink] = useState(existingSubmission?.deployLink || '');

    const [isValidatingRepo, setIsValidatingRepo] = useState(false);
    const [repoStatus, setRepoStatus] = useState(existingSubmission?.githubLink ? 'valid' : 'idle'); // idle, loading, valid, invalid
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const validateRepo = async (url) => {
        if (!url) {
            setRepoStatus('idle');
            return;
        }

        // Basic URL format check
        const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
        if (!githubRegex.test(url)) {
            setRepoStatus('invalid');
            return;
        }

        setIsValidatingRepo(true);
        setRepoStatus('loading');

        try {
            // Extract owner and repo
            const parts = url.replace(/\/$/, '').split('/');
            const owner = parts[parts.length - 2];
            const repo = parts[parts.length - 1];

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (response.ok) {
                const data = await response.json();
                if (data.private === false) {
                    setRepoStatus('valid');
                } else {
                    setRepoStatus('invalid');
                    setMessage({ type: 'error', text: 'Repository must be public.' });
                }
            } else {
                setRepoStatus('invalid');
                setMessage({ type: 'error', text: 'Repository not found or API limit reached.' });
            }
        } catch (error) {
            setRepoStatus('invalid');
        } finally {
            setIsValidatingRepo(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!teamId) return;
        if (repoStatus !== 'valid') {
            setMessage({ type: 'error', text: 'Please provide a valid public GitHub repository.' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            const submissionRef = doc(db, 'submissions', teamId);
            await setDoc(submissionRef, {
                teamId,
                pptLink,
                githubLink,
                deployLink,
                submittedAt: serverTimestamp(),
                lastUpdated: serverTimestamp()
            }, { merge: true });

            setMessage({ type: 'success', text: 'Submission successful!' });
        } catch (error) {
            console.error("Submission error:", error);
            setMessage({ type: 'error', text: 'Failed to submit. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8">
            <h2 className="text-2xl font-bold mb-8">Project Submission</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* PPT Link */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={16} /> Solution PPT Link (Google Drive / Canva)
                    </label>
                    <input
                        type="url"
                        value={pptLink}
                        onChange={(e) => setPptLink(e.target.value)}
                        placeholder="https://docs.google.com/presentation/d/..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500/50 transition-all"
                        required
                    />
                </div>

                {/* GitHub Link */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Github size={16} /> GitHub Repository URL
                    </label>
                    <div className="relative">
                        <input
                            type="url"
                            value={githubLink}
                            onChange={(e) => {
                                setGithubLink(e.target.value);
                                setRepoStatus('idle');
                            }}
                            onBlur={(e) => validateRepo(e.target.value)}
                            placeholder="https://github.com/username/project"
                            className={`w-full bg-white/5 border rounded-2xl py-4 px-6 pr-12 focus:outline-none transition-all ${repoStatus === 'valid' ? 'border-green-500/50' :
                                repoStatus === 'invalid' ? 'border-red-500/50' : 'border-white/10'
                                }`}
                            required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {repoStatus === 'loading' && <Loader2 className="animate-spin text-cyan-400" size={20} />}
                            {repoStatus === 'valid' && <CheckCircle2 className="text-green-500" size={20} />}
                            {repoStatus === 'invalid' && <XCircle className="text-red-500" size={20} />}
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500">Repository must be public and contain the final source code.</p>
                </div>

                {/* Deploy Link */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={16} /> Live Deployment Link
                    </label>
                    <input
                        type="url"
                        value={deployLink}
                        onChange={(e) => setDeployLink(e.target.value)}
                        placeholder="https://your-project.vercel.app"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500/50 transition-all"
                        required
                    />
                </div>

                {message && (
                    <div className={`p-4 rounded-2xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Round Status Warning */}
                {!isActionAllowed && !guardLoading && (
                    <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400 mb-4 animate-fade-in">
                        <AlertCircle size={18} />
                        <p className="text-xs font-bold uppercase tracking-widest">
                            {status === 'locked' ? 'Submissions Locked by Admin' :
                                status === 'inactive' ? 'Round is not yet active' :
                                    status === 'expired' ? 'Deadline Expired' : 'Action forbidden'}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting || repoStatus !== 'valid' || !isActionAllowed}
                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.2)] ${isActionAllowed
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950'
                            : 'bg-white/5 text-gray-500 border border-white/5'
                        }`}
                >
                    {submitting ? 'Transmitting Source...' : (
                        <div className="flex items-center gap-3">
                            Submit Project
                            <Send size={20} />
                        </div>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SubmissionForm;
