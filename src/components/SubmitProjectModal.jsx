import React, { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

function SubmitProjectModal({ teamId, teamName, onClose }) {
  const [step, setStep] = useState(1);
  const [projectLink, setProjectLink] = useState('');
  const [finalDescription, setFinalDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!projectLink.trim()) {
        setError('Please enter a project URL');
        return;
      }
      if (!validateUrl(projectLink)) {
        setError('Please enter a valid URL (e.g., https://github.com/...)');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!finalDescription.trim()) {
        setError('Please enter a project description');
        return;
      }
      if (finalDescription.trim().length < 20) {
        setError('Please write at least 20 characters to describe your project');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!finalDescription.trim()) {
      setError('Please enter a project description');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await updateDoc(doc(db, 'lftPosts', teamId), {
        projectLink: projectLink.trim(),
        finalDescription: finalDescription.trim(),
        isSubmitted: true,
        submittedAt: Timestamp.now(),
        hackathonEndsAt: Timestamp.now()
      });

      // Show success animation
      setShowConfetti(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={!isSubmitting ? onClose : undefined}
      >
        {/* Modal */}
        <div
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b border-white/10 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 backdrop-blur-xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">🏆 Submit Your Project</h2>
                <p className="text-gray-400 text-sm">{teamName}</p>
              </div>
              {!isSubmitting && (
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center text-2xl"
                >
                  ×
                </button>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="relative mt-6 flex items-center">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 ${s < step
                          ? 'bg-green-500 border-green-400 text-white scale-100'
                          : s === step
                            ? 'bg-white border-white text-gray-900 scale-110 shadow-lg shadow-white/30'
                            : 'bg-gray-800 border-gray-700 text-gray-500 scale-90'
                        }`}
                    >
                      {s < step ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        s
                      )}
                    </div>
                    <span
                      className={`absolute -bottom-6 text-xs font-medium whitespace-nowrap transition-all ${s === step ? 'text-white' : 'text-gray-500'
                        }`}
                    >
                      {s === 1 ? 'Project URL' : s === 2 ? 'Description' : 'Confirm'}
                    </span>
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${s < step ? 'bg-green-500' : 'bg-gray-700'
                        }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[300px]">
            {/* Step 1: Project URL */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Project URL
                  </label>
                  <input
                    type="text"
                    value={projectLink}
                    onChange={(e) => {
                      setProjectLink(e.target.value);
                      setError('');
                    }}
                    placeholder="https://github.com/username/project"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-white placeholder-gray-500 transition-all outline-none"
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter your GitHub repo, deployed site, or demo video URL
                  </p>
                </div>

                {/* URL Preview */}
                {projectLink && validateUrl(projectLink) && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-400 mb-1">Valid URL</p>
                        <p className="text-xs text-gray-400 truncate">{projectLink}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Common examples */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'https://github.com/team/project',
                      'https://myproject.vercel.app',
                      'https://youtube.com/watch?v=demo'
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setProjectLink(example)}
                        className="px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 text-xs text-gray-400 hover:text-white transition-all"
                      >
                        {example.split('//')[1].split('/')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Description */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Project Description
                  </label>
                  <textarea
                    value={finalDescription}
                    onChange={(e) => {
                      setFinalDescription(e.target.value);
                      setError('');
                    }}
                    placeholder="Describe what you built, key features, and technologies used..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all outline-none resize-none"
                    autoFocus
                  />
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      This will be visible on your public portfolio
                    </p>
                    <span className={`text-xs font-medium ${finalDescription.length < 50 ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                      {finalDescription.length} characters
                    </span>
                  </div>
                </div>

                {/* Tips */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm font-bold text-blue-400 mb-2">💡 Pro Tips:</p>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li>• Mention the problem you solved</li>
                    <li>• List key technologies and tools</li>
                    <li>• Highlight unique or innovative features</li>
                    <li>• Keep it concise but informative</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Submit?</h3>
                  <p className="text-gray-400 text-sm">
                    Review your submission one last time
                  </p>
                </div>

                {/* Review Cards */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Project URL</p>
                    <a
                      href={projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 break-all flex items-center gap-2"
                    >
                      {projectLink}
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{finalDescription}</p>
                  </div>
                </div>

                {/* Warning */}
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-yellow-400 mb-1">Final Submission</p>
                      <p className="text-xs text-gray-400">
                        Once submitted, your workspace will be frozen and this project will be added to your portfolio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 flex gap-3 justify-end bg-gray-900/50">
            {step > 1 && !isSubmitting && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-all border border-gray-700"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-black transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    🏆 Submit Project
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-4xl font-black text-white mb-2">Submitted!</h2>
            <p className="text-xl text-gray-300">Great work, team! 🚀</p>
          </div>
        </div>
      )}
    </>
  );
}

export default SubmitProjectModal;