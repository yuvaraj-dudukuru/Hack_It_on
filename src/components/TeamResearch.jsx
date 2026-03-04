import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc
} from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import {
  Cpu,
  Search,
  Save,
  Trash2,
  ChevronRight,
  Zap,
  Sparkles,
  RefreshCw,
  Terminal,
  Database
} from 'lucide-react';
import { cn, colors, typography } from '../design-system/theme.js';

function TeamResearch({ teamId }) {
  const { currentUser } = useAuth();
  const [queryInput, setQueryInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [savedInsights, setSavedInsights] = useState([]);
  const [error, setError] = useState(null);

  // NEW: Project Context State
  const [projectData, setProjectData] = useState({
    description: '',
    trelloUrl: '',
    figmaUrl: '',
    systemDesignUrl: '',
    pitchDeckUrl: '',
    editorUrl: ''
  });
  const [isEditingContext, setIsEditingContext] = useState(false);
  const [tempDescription, setTempDescription] = useState('');

  // 1. Listen to the MAIN team document for insights AND context
  useEffect(() => {
    const docRef = doc(db, 'lftPosts', teamId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Load Insights
        let insights = data.researchInsights || [];
        insights.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setSavedInsights(insights);

        // Load Context
        setProjectData({
          description: data.projectDescription || '',
          trelloUrl: data.trelloUrl || 'Not connected',
          figmaUrl: data.figmaUrl || 'Not connected',
          systemDesignUrl: data.systemDesignUrl || 'Not connected',
          pitchDeckUrl: data.pitchDeckUrl || 'Not connected',
          editorUrl: data.editorUrl || 'Not connected'
        });
        if (!isEditingContext) {
          setTempDescription(data.projectDescription || '');
        }
      }
      setError(null);
    }, (err) => {
      console.warn("Research access denied (handled):", err.code);
      setError("Secure Channel Locked");
    });
    return () => unsubscribe();
  }, [teamId, isEditingContext]);

  const handleSaveDescription = async () => {
    try {
      const docRef = doc(db, 'lftPosts', teamId);
      await updateDoc(docRef, {
        projectDescription: tempDescription
      });
      setIsEditingContext(false);
    } catch (err) {
      setError("Failed to update Protocol: " + err.message);
    }
  };

  // 2. Perform AI Research (Dynamic Model Discovery + Context)
  const performAIResearch = async (userQuery) => {
    setIsSearching(true);
    setError(null);

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      setError("System Error: Gemini Link Disconnected (Missing VITE_GEMINI_API_KEY)");
      setIsSearching(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      let selectedModelName = "gemini-1.5-flash";

      // DYNAMIC MODEL DISCOVERY (Keep existing logic)
      try {
        console.log("Neural Link: Scanning available models...");
        const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        if (listResp.ok) {
          const listData = await listResp.json();
          const availableModels = (listData.models || [])
            .filter(m => m.name.includes("gemini") && m.supportedGenerationMethods?.includes("generateContent"))
            .map(m => m.name.replace("models/", ""));
          if (availableModels.length > 0) {
            const preferredOrder = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-1.5-pro-001", "gemini-1.0-pro", "gemini-pro"];
            const bestMatch = preferredOrder.find(p => availableModels.includes(p));
            selectedModelName = bestMatch || availableModels[0];
          }
        }
      } catch (e) { console.warn("Neural Link: Auto-discovery failed, using default.", e); }

      console.log(`Neural Link: Established connection via [${selectedModelName}]`);

      // 3. DYNAMIC CONTEXT INJECTION
      const contextPrompt = `
        ROLE: You are the AI Technical Architect for a specific project titled "${projectData.description ? 'Client Project' : 'HackOS Neo User'}".
        
        === PROJECT PROTOCOL ===
        DESCRIPTION: ${projectData.description || "No description provided. Ask the user to define the project scope in the Neural Link settings."}
        
        === INTEGRATED RESOURCES ===
        - Project Management (Trello): ${projectData.trelloUrl}
        - Design System (Figma): ${projectData.figmaUrl}
        - Architecture Diagram: ${projectData.systemDesignUrl}
        - Pitch Deck: ${projectData.pitchDeckUrl}
        - Documentation: ${projectData.editorUrl}

        INSTRUCTION: 
        1. Contextual Awareness: Use the project description above to tailor all advice. If the description is missing, ask the user to provide it.
        2. Resource Linking: If the user asks about tasks, design, or slides, refer them to the specific URLs listed above.
        3. Tone: Professional, decisive, architectural.
      `;

      const model = genAI.getGenerativeModel({
        model: selectedModelName,
        systemInstruction: contextPrompt
      });

      const result = await model.generateContent(userQuery);
      const response = await result.response;
      const answer = response.text();

      setCurrentResult({
        id: Date.now().toString(),
        question: userQuery,
        answer: answer + `\n\n*— Transmitted via ${selectedModelName}*`,
        createdAt: Date.now(),
        savedBy: currentUser.displayName || "Architect"
      });

    } catch (err) {
      console.error("AI Research Failed:", err);
      setError("Link Severed: " + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    performAIResearch(queryInput);
  };

  // 3. Save Insight (to Parent Doc Array)
  const handleSaveInsight = async () => {
    if (!currentResult) return;
    try {
      const insightToSave = {
        ...currentResult,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        savedAt: new Date().toISOString()
      };
      const docRef = doc(db, 'lftPosts', teamId);
      await updateDoc(docRef, { researchInsights: arrayUnion(insightToSave) });
      setCurrentResult(null);
      setQueryInput('');
    } catch (err) { setError("Memory Bank Error: " + err.message); }
  };

  // 4. Delete Insight (Read-Modify-Write pattern for safety)
  const handleDeleteInsight = async (insightId) => {
    if (!window.confirm("Purge this record?")) return;
    try {
      const docRef = doc(db, 'lftPosts', teamId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const updatedInsights = (docSnap.data().researchInsights || []).filter(i => i.id !== insightId);
        await updateDoc(docRef, { researchInsights: updatedInsights });
      }
    } catch (err) { setError("Purge Failed"); }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#030712] overflow-hidden">

      {/* Sidebar: Saved Insights */}
      <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-white/[0.01] backdrop-blur-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Database size={18} />
            </div>
            <span className="font-black text-xs uppercase tracking-widest text-white">Insight Log</span>
          </div>
          <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-gray-500">{savedInsights.length}</span>
        </div>

        {error ? (
          <div className="p-6 text-center opacity-50">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <p className="text-[10px] font-black uppercase text-red-400 tracking-widest">{error}</p>
            <p className="text-[10px] text-gray-500 mt-2">Neural Link Unstable</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {savedInsights.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center opacity-30">
                <Sparkles size={32} className="mb-2" />
                <p className="text-[10px] uppercase font-black tracking-widest text-center">No Data Saved</p>
              </div>
            ) : (
              savedInsights.map(insight => (
                <div
                  key={insight.id}
                  className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-white pr-6 leading-tight truncate">{insight.question}</h4>
                    <button
                      onClick={() => handleDeleteInsight(insight.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold mb-3 flex items-center gap-1">
                    <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
                    {insight.savedBy}
                  </p>
                  <div className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {insight.answer.substring(0, 100)}...
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Main Console */}
      <div className="flex-1 flex flex-col relative overflow-hidden">

        {/* Background Decorative Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full -z-10" />

        {/* Viewport content */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">

          {/* Project Context Header */}
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Sparkles size={14} /> Active Protocol
              </h3>
              <button onClick={() => setIsEditingContext(!isEditingContext)} className="text-[10px] font-bold text-gray-500 hover:text-white underline">
                {isEditingContext ? 'Cancel' : 'Edit Context'}
              </button>
            </div>

            {isEditingContext ? (
              <div className="space-y-3 animate-fade-in">
                <textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Describe your project here (e.g., 'A decentralized voting app for local communities using Blockchain...')"
                  className="w-full h-24 bg-black/20 text-white text-sm p-3 rounded-xl border border-white/10 focus:border-cyan-500 outline-none resize-none"
                />
                <button onClick={handleSaveDescription} className="w-full py-2 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg hover:bg-cyan-500 hover:text-black transition-colors">
                  Update Protocol
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-400 font-medium">
                {projectData.description ? (
                  <p>"{projectData.description}"</p>
                ) : (
                  <p className="opacity-50 italic">No project description defined. The Oracle is running on generic parameters.</p>
                )}
              </div>
            )}
          </div>

          {/* Research Output Area */}
          {!currentResult && !isSearching && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-blue-600/10 rounded-[2.5rem] border border-cyan-500/20 flex items-center justify-center mb-8 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
                <Cpu size={48} className="text-cyan-400 animate-float" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">AI <span className="text-cyan-400">Oracle</span></h2>
              <p className="text-gray-500 max-w-sm font-medium leading-relaxed">System online. Project Context loaded. Ready for queries.</p>
            </div>
          )}

          {isSearching && (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={24} className="text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-xl font-black text-white tracking-widest uppercase text-[10px]">Processing Stream</p>
                <p className="text-cyan-400/70 font-bold text-sm animate-pulse">Neural Link Active...</p>
              </div>
            </div>
          )}

          {currentResult && !isSearching && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div className="flex items-center gap-4 border-l-4 border-cyan-500 pl-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-1">Oracle Output</p>
                  <h2 className="text-4xl font-black text-white tracking-tight">{currentResult.question}</h2>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                <div className=" absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-500 to-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                <div className="prose prose-invert max-w-none text-gray-300 prose-headings:text-white prose-a:text-cyan-400 prose-code:text-cyan-300 prose-code:bg-white/5 prose-code:p-1 prose-code:rounded">
                  <ReactMarkdown>{currentResult.answer}</ReactMarkdown>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => setCurrentResult(null)}
                  className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-colors"
                >
                  Terminate Output
                </button>
                <button
                  onClick={handleSaveInsight}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-black text-white shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  Store in Memory
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="p-6 md:p-10 shrink-0 bg-gradient-to-t from-[#030712] via-[#030712]/90 to-transparent">
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto flex items-center gap-3 bg-white/[0.03] backdrop-blur-2xl p-2 rounded-[1.5rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] focus-within:border-cyan-500/50 transition-all duration-500"
          >
            <div className="p-3 bg-white/5 rounded-2xl text-gray-500 ml-2">
              <Terminal size={20} />
            </div>
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Query the AI Oracle..."
              className="flex-1 bg-transparent py-4 text-white text-lg font-medium placeholder-gray-600 outline-none"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching || !queryInput.trim()}
              className="px-8 py-4 bg-cyan-500 text-gray-950 font-black rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 flex items-center gap-2 group"
            >
              <span>{isSearching ? 'Thinking...' : 'Execute'}</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          <div className="max-w-4xl mx-auto mt-4 px-6 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
            <span className="flex items-center gap-1"><Zap size={10} className="text-cyan-500" /> Neural Link Live</span>
            <span className="flex items-center gap-1"><Sparkles size={10} className="text-purple-500" /> Context Aware</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TeamResearch;
