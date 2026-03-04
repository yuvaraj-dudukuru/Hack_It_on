import React, { useEffect, useState, useRef } from 'react';

function AuthMascot({ focusedField, hasError, mousePos }) {
  const faceRef = useRef(null);
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  // Calculate eye movement to follow cursor
  useEffect(() => {
    if (!faceRef.current || focusedField === 'password') return;

    const rect = faceRef.current.getBoundingClientRect();
    const faceCenterX = rect.left + rect.width / 2;
    const faceCenterY = rect.top + rect.height / 2;

    // Calculate distance from center
    const dx = mousePos.x - faceCenterX;
    const dy = mousePos.y - faceCenterY;
    
    // Clamp the movement so eyes don't leave the face
    const maxMove = 10; 
    const moveX = Math.max(-maxMove, Math.min(maxMove, dx / 15));
    const moveY = Math.max(-maxMove, Math.min(maxMove, dy / 15));

    setEyePos({ x: moveX, y: moveY });
  }, [mousePos, focusedField]);

  // Determine current animation state
  const isPeeking = focusedField === 'password';
  const isSad = hasError;

  return (
    <div className="w-64 h-64 relative flex items-center justify-center">
      <svg
        ref={faceRef}
        viewBox="0 0 200 200"
        className={`w-full h-full transition-transform duration-300 ${isSad ? 'animate-shake' : ''}`}
      >
        {/* --- EAR LEFT --- */}
        <circle cx="40" cy="60" r="30" fill="#334155" />
        <circle cx="40" cy="60" r="15" fill="#475569" />

        {/* --- EAR RIGHT --- */}
        <circle cx="160" cy="60" r="30" fill="#334155" />
        <circle cx="160" cy="60" r="15" fill="#475569" />

        {/* --- FACE BASE --- */}
        <ellipse cx="100" cy="110" rx="80" ry="70" fill="#475569" />
        <ellipse cx="100" cy="120" rx="60" ry="50" fill="#64748b" />

        {/* --- EYES Container --- */}
        <g className="transition-all duration-200" style={{ 
            transform: isPeeking ? 'translateY(-10px)' : `translate(${eyePos.x}px, ${eyePos.y}px)` 
        }}>
          {/* Eye Whites */}
          <ellipse cx="70" cy="90" rx="15" ry="20" fill="white" />
          <ellipse cx="130" cy="90" rx="15" ry="20" fill="white" />
          
          {/* Pupils */}
          <g className="transition-all duration-100">
             {isPeeking ? (
                // Peeking Eyes (looking up nervously)
                <>
                  <circle cx="70" cy="80" r="5" fill="#0f172a" />
                  <circle cx="130" cy="80" r="5" fill="#0f172a" />
                </>
             ) : isSad ? (
                // Sad Eyes (looking down)
                 <>
                  <circle cx="70" cy="100" r="5" fill="#0f172a" />
                  <circle cx="130" cy="100" r="5" fill="#0f172a" />
                  {/* Sad eyebrows */}
                  <path d="M 55 75 Q 70 65 85 75" stroke="#0f172a" strokeWidth="3" fill="none" />
                  <path d="M 115 75 Q 130 65 145 75" stroke="#0f172a" strokeWidth="3" fill="none" />
                 </>
             ) : (
                // Normal Eyes
                <>
                  <circle cx="70" cy="90" r="8" fill="#0f172a" />
                  <circle cx="130" cy="90" r="8" fill="#0f172a" />
                  {/* Happy eyebrows */}
                  <path d="M 55 70 Q 70 80 85 70" stroke="#0f172a" strokeWidth="3" fill="none" opacity="0.3" />
                  <path d="M 115 70 Q 130 80 145 70" stroke="#0f172a" strokeWidth="3" fill="none" opacity="0.3" />
                </>
             )}
          </g>
        </g>

        {/* --- NOSE --- */}
        <ellipse cx="100" cy="130" rx="15" ry="10" fill="#0f172a" />

        {/* --- MOUTH --- */}
        {isSad ? (
           // Sad Mouth
           <path d="M 80 155 Q 100 140 120 155" stroke="#0f172a" strokeWidth="3" fill="none" />
        ) : (
           // Happy/Neutral Mouth
           <path d="M 80 145 Q 100 160 120 145" stroke="#0f172a" strokeWidth="3" fill="none" />
        )}

        {/* --- HANDS (for peeking) --- */}
        <g 
          className="transition-all duration-500 ease-in-out"
          style={{ 
             transform: isPeeking ? 'translateY(0px)' : 'translateY(150px)',
             opacity: isPeeking ? 1 : 0
          }}
        >
          {/* Left Hand */}
          <ellipse cx="60" cy="170" rx="25" ry="30" fill="#334155" />
          {/* Right Hand */}
          <ellipse cx="140" cy="170" rx="25" ry="30" fill="#334155" />
        </g>

      </svg>
    </div>
  );
}

export default AuthMascot;