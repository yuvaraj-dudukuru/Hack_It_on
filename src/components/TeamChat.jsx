import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, onSnapshot, serverTimestamp, where, doc, updateDoc, increment } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessageSkeleton } from '../components/LoadingSkeletons.jsx';
import { Send, MessageSquare, Reply, X, User } from 'lucide-react';
import { cn } from '../design-system/theme';

function TeamChat({ teamId, isReadOnly }) {
  const { currentUser } = useAuth();
  const [mainMessages, setMainMessages] = useState([]);
  const [threadMessages, setThreadMessages] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newThreadMessage, setNewThreadMessage] = useState('');
  const mainScroll = useRef();
  const threadScroll = useRef();

  const sortMessages = (msgs) => {
    return msgs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || Date.now();
      const timeB = b.createdAt?.toMillis() || Date.now();
      return timeA - timeB;
    });
  };

  useEffect(() => {
    const messagesRef = collection(db, 'lftPosts', teamId, 'messages');
    const q = query(messagesRef, where('parentId', '==', null));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMainMessages(sortMessages(msgs));
      setTimeout(() => mainScroll.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      console.error("Error listening to messages:", error);
    });
    return () => unsubscribe();
  }, [teamId]);

  useEffect(() => {
    if (!activeThread) return;
    const messagesRef = collection(db, 'lftPosts', teamId, 'messages');
    const q = query(messagesRef, where('parentId', '==', activeThread.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setThreadMessages(sortMessages(msgs));
      setTimeout(() => threadScroll.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [teamId, activeThread]);

  const handleSendMessage = async (text, parentId = null) => {
    if (!text.trim() || isReadOnly) return;
    const messagesRef = collection(db, 'lftPosts', teamId, 'messages');
    await addDoc(messagesRef, {
      text: text, createdAt: serverTimestamp(), uid: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email, photoURL: currentUser.photoURL, parentId: parentId, replyCount: 0
    });
    if (parentId) {
      const parentRef = doc(db, 'lftPosts', teamId, 'messages', parentId);
      await updateDoc(parentRef, { replyCount: increment(1) });
      setNewThreadMessage('');
    } else {
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble = ({ msg, isThreadView = false }) => {
    const isMe = msg.uid === currentUser.uid;
    return (
      <div className={cn(
        "flex flex-col group relative mb-6 animate-slide-up",
        isMe ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "flex max-w-[85%] gap-3",
          isMe ? "flex-row-reverse" : "flex-row"
        )}>
          <div className="relative shrink-0 self-end">
            <img
              src={msg.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${msg.uid}`}
              alt="avatar"
              className="w-10 h-10 rounded-xl border border-white/10 shadow-lg object-cover"
            />
          </div>

          <div className={cn(
            "flex flex-col",
            isMe ? "items-end" : "items-start"
          )}>
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isMe ? "text-cyan-400" : "text-purple-400"
              )}>
                {isMe ? 'You' : msg.displayName?.split('@')[0]}
              </span>
              <span className="text-[10px] font-black text-gray-600">
                {formatTime(msg.createdAt)}
              </span>
            </div>

            <div className={cn(
              "px-4 py-3 rounded-2xl shadow-2xl relative overflow-hidden",
              isMe
                ? "bg-cyan-500/10 text-cyan-50 border border-cyan-500/20 rounded-tr-none"
                : "bg-white/5 text-gray-100 border border-white/10 rounded-tl-none"
            )}>
              <div className="markdown prose prose-invert max-w-none prose-sm leading-relaxed antialiased">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            </div>

            {!isThreadView && msg.replyCount > 0 && (
              <button
                onClick={() => setActiveThread(msg)}
                className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] hover:bg-white/[0.06] rounded-full border border-white/5 transition-all group/btn shadow-lg"
              >
                <Reply size={12} className="text-purple-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/btn:text-purple-400">
                  {msg.replyCount} {msg.replyCount === 1 ? 'Response' : 'Responses'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Hover Action */}
        {!isThreadView && !isReadOnly && (
          <div className={cn(
            "absolute -top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1",
            isMe ? "right-12" : "left-12"
          )}>
            <button
              onClick={() => setActiveThread(msg)}
              className="p-2 bg-white/10 hover:bg-purple-500/20 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl text-purple-400 transition-colors"
              title="Reply to Thread"
            >
              <Reply size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full overflow-hidden bg-transparent">
      <div className={cn(
        "flex flex-col h-full transition-all duration-500 relative",
        activeThread ? "w-3/5 border-r border-white/5" : "w-full"
      )}>
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          {mainMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
              <MessageSquare size={48} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-[0.3em]">Channel Idle</p>
            </div>
          ) : (
            mainMessages.map(msg => <MessageBubble key={msg.id} msg={msg} />)
          )}
          <div ref={mainScroll} />
        </div>

        {/* Console Input */}
        <div className="p-6 bg-[#030712]/40 border-t border-white/5">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(newMessage); }}
            className="relative group"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isReadOnly ? "CHANNEL ENCRYPTED / READ-ONLY" : "Enter message to squad..."}
              disabled={isReadOnly}
              className={cn(
                "w-full px-6 py-4 rounded-2xl bg-white/[0.03] text-white border transition-all duration-300 pl-14",
                "focus:outline-none focus:bg-white/[0.06] focus:border-cyan-500/50",
                isReadOnly ? "border-rose-500/20 placeholder:text-rose-500/30" : "border-white/10 placeholder:text-white/20"
              )}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors">
              <MessageSquare size={20} />
            </div>
            <button
              type="submit"
              disabled={isReadOnly || !newMessage.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-cyan-500 text-gray-950 hover:scale-105 active:scale-95 disabled:opacity-0 disabled:scale-90 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {activeThread && (
        <div className="w-2/5 flex flex-col h-full bg-white/[0.01] backdrop-blur-3xl animate-slide-left">
          <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Reply size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Thread Context</h3>
            </div>
            <button
              onClick={() => setActiveThread(null)}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
            <div className="opacity-60 border-b border-white/5 pb-8 mb-8">
              <MessageBubble msg={activeThread} isThreadView={true} />
            </div>
            {threadMessages.map(msg => <MessageBubble key={msg.id} msg={msg} isThreadView={true} />)}
            <div ref={threadScroll} />
          </div>

          <div className="p-6 bg-[#030712]/40 border-t border-white/5">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(newThreadMessage, activeThread.id); }}
              className="relative group"
            >
              <input
                type="text"
                value={newThreadMessage}
                onChange={(e) => setNewThreadMessage(e.target.value)}
                placeholder={isReadOnly ? "LOCK" : "Reply..."}
                disabled={isReadOnly}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all pl-10"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors">
                <Reply size={14} />
              </div>
              <button
                type="submit"
                disabled={isReadOnly || !newThreadMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-purple-500 text-white disabled:opacity-0 transition-opacity"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamChat;
