import { collection, query, where, onSnapshot, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { auditService } from '../../services/auditService';
import { Trophy, Github, FileText, Send, CheckCircle2, ChevronRight, Star, ExternalLink } from 'lucide-react';

const JudgeDashboard = () => {
    const { userData } = useAuth();
    const [teams, setTeams] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    // Scoring state
    const [scores, setScores] = useState({ innovation: 0, technical: 0, presentation: 0 });
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch teams that are verified and qualified for the current round (e.g., Round 1)
        const qTeams = query(collection(db, 'teams'), where('paymentStatus', '==', 'verified'));
        const unsubscribeTeams = onSnapshot(qTeams, (snapshot) => {
            const teamData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeams(teamData);
            setLoading(false);
        });

        // Fetch all submissions
        const qSubs = query(collection(db, 'submissions'));
        const unsubscribeSubs = onSnapshot(qSubs, (snapshot) => {
            const subData = {};
            snapshot.docs.forEach(doc => { subData[doc.id] = doc.data(); });
            setSubmissions(subData);
        });

        return () => {
            unsubscribeTeams();
            unsubscribeSubs();
        };
    }, []);

    const handleScoreSubmit = async () => {
        if (!selectedTeam || submitting) return;
        setSubmitting(true);

        const total = Object.values(scores).reduce((a, b) => a + b, 0);

        try {
            // 1. Save individual judge score
            const scoreRef = doc(db, 'scores', `${selectedTeam.id}_${userData.uid}`);
            await setDoc(scoreRef, {
                teamId: selectedTeam.id,
                judgeId: userData.uid,
                judgeName: userData.name || userData.displayName,
                criteria: scores,
                total,
                comment,
                timestamp: new Date().toISOString()
            });

            // 2. Audit Log (Scores are aggregated by admin later)
            await auditService.logEvent(
                'SCORE_SUBMITTED',
                userData.uid,
                'judge',
                selectedTeam.id,
                { total }
            );

            alert('Score submitted successfully!');
            setSelectedTeam(null);
            setScores({ innovation: 0, technical: 0, presentation: 0 });
            setComment('');
        } catch (error) {
            console.error("Scoring error:", error);
            alert('Failed to submit score.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-400">Loading Evaluation Queue...</div>;

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header>
                <h1 className="text-4xl font-black text-white mb-2">Judgment Panel</h1>
                <p className="text-gray-400 font-medium">Evaluating Round 1 Pathfinders</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Team Queue */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Submission Queue</h3>
                    <div className="space-y-3">
                        {teams.map(team => (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeam(team)}
                                className={`w-full text-left p-6 rounded-[24px] border transition-all ${selectedTeam?.id === team.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-white truncate pr-4">{team.teamName}</p>
                                    {submissions[team.id] ? <CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-gray-700" />}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{team.college}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Evaluation Interface */}
                <div className="lg:col-span-8">
                    {selectedTeam ? (
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-2">{selectedTeam.teamName}</h2>
                                    <p className="text-gray-400 font-medium">{selectedTeam.college}</p>
                                </div>
                                <div className="flex gap-3">
                                    {submissions[selectedTeam.id]?.pptLink && (
                                        <a href={submissions[selectedTeam.id].pptLink} target="_blank" className="p-4 bg-white/5 border border-white/10 rounded-2xl text-cyan-400 hover:bg-white/10 transition-all">
                                            <FileText size={20} />
                                        </a>
                                    )}
                                    {submissions[selectedTeam.id]?.githubLink && (
                                        <a href={submissions[selectedTeam.id].githubLink} target="_blank" className="p-4 bg-white/5 border border-white/10 rounded-2xl text-purple-400 hover:bg-white/10 transition-all">
                                            <Github size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Scoring */}
                                <div className="space-y-8">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Grading Criteria</h3>
                                    {Object.keys(scores).map(criterion => (
                                        <div key={criterion} className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-bold text-white capitalize">{criterion}</label>
                                                <span className="text-cyan-400 font-black">{scores[criterion]}/10</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="10" step="1"
                                                value={scores[criterion]}
                                                onChange={(e) => setScores({ ...scores, [criterion]: parseInt(e.target.value) })}
                                                className="w-full accent-cyan-500 bg-white/10 rounded-lg h-2"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Comments & Finalize */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Judge's Remarks</h3>
                                    <textarea
                                        placeholder="Enter constructive feedback..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 focus:outline-none focus:border-cyan-500/30 transition-all text-sm font-medium"
                                    />
                                    <button
                                        onClick={handleScoreSubmit}
                                        disabled={submitting}
                                        className="w-full py-5 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-center gap-3"
                                    >
                                        {submitting ? 'Calculating...' : 'Submit Evaluation'}
                                        <Star size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center text-center p-12">
                            <Trophy className="text-white/5 mb-6" size={80} />
                            <h2 className="text-2xl font-bold text-gray-500">Selection Required</h2>
                            <p className="text-gray-600 max-w-xs mt-2 font-medium">Please select a team from the queue to start evaluating their submission.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JudgeDashboard;
