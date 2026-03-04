import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";

// --- CONFIGURATION ---
const mascotsData = [
  // BACK ROW (Tall, Darker)
  { id: 1, color: "#334155", x: 60, width: 80, height: 180, zIndex: 1 },
  { id: 2, color: "#475569", x: 160, width: 85, height: 190, zIndex: 1 },
  { id: 3, color: "#64748b", x: 260, width: 80, height: 175, zIndex: 1 },

  // FRONT ROW (Short, Vibrant)
  { id: 4, color: "#f97316", x: 100, width: 90, height: 120, zIndex: 10 }, // Orange
  { id: 5, color: "#0ea5e9", x: 220, width: 100, height: 130, zIndex: 10 }, // Blue
];

// --- PHYSICS HOOK ---
function useLookTarget(mousePos, isTypingPassword, showPassword, char) {
  const lookX = useSpring(0, { stiffness: 120, damping: 20 });
  const lookY = useSpring(0, { stiffness: 120, damping: 20 });
  const bodyLean = useSpring(0, { stiffness: 80, damping: 25 });

  // PARANOIA CHECKER LOGIC
  const [isChecking, setIsChecking] = useState(false);

  // Randomly toggle 'isChecking' when in Peek Mode
  useEffect(() => {
    if (isTypingPassword && !showPassword) {
      const duration = isChecking ? 600 : 1000 + Math.random() * 2000; // Check quickly (600ms), wait longer (1-3s)
      const timeout = setTimeout(() => {
        setIsChecking(!isChecking);
      }, duration);
      return () => clearTimeout(timeout);
    } else {
      setIsChecking(false);
    }
  }, [isTypingPassword, showPassword, isChecking]);


  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let lean = 0;

    // SCENARIO 1: SECRET PEEK (Typing + Hidden) -> "Paranoid Check"
    if (isTypingPassword && !showPassword) {
      const centerX = 200;

      if (isChecking) {
        // CHECKING: Eyes dart to current input
        targetX = (centerX - char.x) / 3.5;
        targetY = 10;
        lean = (centerX - char.x) / 50; // Minimal lean
      } else {
        // INNOCENT: Look slightly up/away (Acting cool)
        targetX = 0;
        targetY = -15; // Whistle/Look Up
        lean = 0; // Upright
      }

    }
    // SCENARIO 2: SHY/WHISTLING (Funny) -> "Nothing to see here"
    else if (showPassword) {
      const centerX = 200;
      targetX = (char.x - centerX) / 3;
      targetY = -30;
      lean = (char.x - centerX) / 8;
    }
    // SCENARIO 3: IDLE
    else if (mousePos) {
      const dx = mousePos.x - (char.x + char.width / 2);
      const dy = mousePos.y - (300);
      targetX = Math.min(Math.max(dx / 30, -15), 15);
      targetY = Math.min(Math.max(dy / 30, -12), 12);
      lean = dx / 80;
    }

    lookX.set(targetX);
    lookY.set(targetY);
    bodyLean.set(lean);

  }, [mousePos, isTypingPassword, showPassword, isChecking, char, lookX, lookY, bodyLean]);

  return { lookX, lookY, bodyLean, isChecking };
}

// --- FACE COMPONENT ---
const Face = ({ state, isChecking }) => {
  // STATES: 'idle', 'peek' (secret), 'shy' (whistle), 'success', 'error'

  // MUSIC NOTES FOR WHISTLING
  const [noteKey, setNoteKey] = useState(0);
  useEffect(() => {
    if (state === 'shy' || (state === 'peek' && !isChecking)) { // Whistle if Shy OR Innocent Peek
      const interval = setInterval(() => setNoteKey(k => k + 1), 800);
      return () => clearInterval(interval);
    }
  }, [state, isChecking]);

  // EYE VARIANTS
  const eyes = {
    idle: (
      <>
        <motion.div className="w-3 h-4 bg-black/90 rounded-full relative overflow-hidden"><div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" /></motion.div>
        <div className="w-1" />
        <motion.div className="w-3 h-4 bg-black/90 rounded-full relative overflow-hidden"><div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" /></motion.div>
      </>
    ),
    peek: (
      <>
        {/* DYNAMIC EYES */}
        {isChecking ? (
          // CHECKING: Squinted Side Eye
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-white border-2 border-black/90 rounded-full relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-0 w-full h-1/2 bg-black/10 z-10" />
              <div className="w-1.5 h-1.5 bg-black rounded-full translate-y-[1px]" />
            </div>
            <div className="w-4 h-4 bg-white border-2 border-black/90 rounded-full relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-0 w-full h-1/2 bg-black/10 z-10" />
              <div className="w-1.5 h-1.5 bg-black rounded-full translate-y-[1px]" />
            </div>
          </div>
        ) : (
          // INNOCENT: Normal Eyes Looking Up
          <div className="flex gap-1">
            <motion.div className="w-3 h-4 bg-black/90 rounded-full relative overflow-hidden"><div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" /></motion.div>
            <motion.div className="w-3 h-4 bg-black/90 rounded-full relative overflow-hidden"><div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" /></motion.div>
          </div>
        )}
      </>
    ),
    shy: (
      <>
        {/* SHIFTY EYES */}
        <motion.div
          animate={{ x: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-3 h-4 bg-black/90 rounded-full relative overflow-hidden"
        >
          <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" />
        </motion.div>
        <div className="w-1" />
        <motion.div
          animate={{ x: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-3 h-4 bg-black/90 rounded-full relative overflow-hidden"
        >
          <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" />
        </motion.div>
      </>
    ),
    success: (
      <>
        <svg width="30" height="10" viewBox="0 0 30 10" className="overflow-visible">
          <path d="M 0 10 Q 5 0 10 10" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 20 10 Q 25 0 30 10" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </>
    ),
    error: (
      <>
        <div className="text-red-600 font-black text-xs">X</div>
        <div className="w-2" />
        <div className="text-red-600 font-black text-xs">X</div>
      </>
    )
  };

  // MOUTH VARIANTS
  const mouth = {
    idle: <div className="w-1 h-0.5 bg-black/40 rounded-full" />,
    peek: (
      // Toggle Smirk (Check) vs Whistle (Innocent)
      isChecking ?
        <div className="w-3 h-1 bg-black/80 rounded-full -rotate-6 translate-x-1" /> // Smirk
        :
        <div className="w-2 h-2 border-2 border-black/60 rounded-full bg-transparent" /> // Whistle
    ),
    shy: (
      <div className="w-2 h-2 border-2 border-black/60 rounded-full bg-transparent" />
    ),
    success: (
      <svg width="16" height="8" viewBox="0 0 16 8">
        <path d="M 0 0 Q 8 12 16 0" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    error: <div className="w-4 h-1 bg-black/80 rounded-full rotate-6" />
  };

  return (
    <div className="flex flex-col items-center gap-1 scale-125">

      {/* BROWS (Only when checking) */}
      <div className="h-1 w-full flex justify-center gap-1 opacity-70">
        {state === 'peek' && isChecking && (
          <>
            <div className="w-2 h-[2px] bg-black rotate-6 translate-y-1" />
            <div className="w-2 h-[2px] bg-black -rotate-6 translate-y-1" />
          </>
        )}
      </div>

      {/* EYES */}
      <div className="flex items-center justify-center h-5">
        {eyes[state] || eyes.idle}
      </div>

      {/* MOUTH */}
      <div className="mt-1 h-3 flex items-start justify-center relative">
        {mouth[state] || mouth.idle}

        {/* ANIMATED MUSIC NOTE (Whistling when Shy OR Innocent Peek) */}
        <AnimatePresence>
          {(state === 'shy' || (state === 'peek' && !isChecking)) && (
            <motion.div
              key={noteKey}
              initial={{ y: 0, x: 0, opacity: 0, scale: 0 }}
              animate={{ y: -20, x: (noteKey % 2 === 0 ? 10 : -10), opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute -top-1 left-1/2 text-cyan-400 font-bold text-xs pointer-events-none"
            >
              ♪
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};


// --- MASCOT COMPONENT ---
function Mascot({ char, mousePos, isTypingPassword, showPassword, loginState }) {
  const { lookX, lookY, bodyLean, isChecking } = useLookTarget(mousePos, isTypingPassword, showPassword, char);

  let faceState = 'idle';
  if (loginState === 'success') faceState = 'success';
  else if (loginState === 'error') faceState = 'error';
  else if (showPassword) faceState = 'shy';
  else if (isTypingPassword) faceState = 'peek';

  const scaleY = useTransform(bodyLean, [-15, 15], [0.95, 1.05]);

  const headRotate = useTransform(lookX, [-15, 15], [-5, 5]);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: char.x,
        bottom: 20,
        width: char.width,
        height: char.height,
        zIndex: char.zIndex,
        rotate: bodyLean,
        scaleY: scaleY,
        transformOrigin: "bottom center"
      }}
    >
      <div className="absolute -bottom-1 left-2 right-2 h-3 bg-black/40 rounded-full blur-sm" />

      <motion.div
        className="w-full h-full relative overflow-visible shadow-xl"
        style={{
          backgroundColor: char.color,
          borderRadius: "50% 50% 0 0",
        }}
        animate={{ scaleY: [1, 1.02, 1] }}
        transition={{ duration: 2 + char.id, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-4 left-4 w-1/3 h-1/4 bg-white/10 rounded-full rotate-12 blur-[1px]" />

        {/* FACE CONTAINER */}
        <motion.div
          className="absolute top-[20%] left-0 right-0 flex justify-center items-center"
          style={{ x: lookX, y: lookY, rotate: headRotate }}
        >
          <Face state={faceState} isChecking={isChecking} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// --- MAIN CONTAINER ---
export default function AnimatedMascots({ mousePos, isTypingPassword, showPassword, loginState }) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute bottom-[20px] left-10 right-10 h-[2px] bg-white/10 rounded-full" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[400px] h-[400px]">
          {mascotsData.map((char) => (
            <Mascot
              key={char.id}
              char={char}
              mousePos={mousePos}
              isTypingPassword={isTypingPassword}
              showPassword={showPassword}
              loginState={loginState}
            />
          ))}
        </div>
      </div>
    </div>
  );
}