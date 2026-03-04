// src/design-system/theme.js
// HackOS Neo - Futuristic Design System

export const colors = {
  // Deep Neo Palette
  brand: {
    primary: 'from-cyan-400 via-blue-500 to-purple-600',
    secondary: 'from-pink-500 to-rose-500',
    accent: 'cyan-400',
    neon: {
      cyan: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]',
      purple: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
      pink: 'shadow-[0_0_15px_rgba(236,72,153,0.4)]',
    }
  },

  // State Colors
  state: {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/20',
    },
    danger: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      gradient: 'from-rose-500 to-red-600',
      glow: 'shadow-rose-500/20',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/20',
    },
    info: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      text: 'text-sky-400',
      gradient: 'from-sky-500 to-blue-600',
      glow: 'shadow-sky-500/20',
    },
  },

  // Background Layers (Neo-Glass)
  bg: {
    base: 'bg-[#030712]', // Deeper black
    gradient: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-gray-950 to-black',
    card: 'bg-white/[0.03] backdrop-blur-xl border border-white/10',
    cardHover: 'bg-white/[0.06] border-white/20',
    elevated: 'bg-gray-900/40 backdrop-blur-2xl border border-white/10',
    input: 'bg-black/40 border-white/5',
    inputHover: 'bg-black/60 border-white/10',
  },

  // Borders
  border: {
    subtle: 'border-white/5',
    default: 'border-white/10',
    strong: 'border-white/20',
    neon: 'border-cyan-400/50',
  },

  // Text
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    tertiary: 'text-gray-400',
    muted: 'text-gray-500',
    gradient: 'bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500',
  },
};

export const buttons = {
  primary: `
    px-6 py-3 rounded-2xl 
    bg-gradient-to-r from-cyan-500 to-blue-600 
    text-white font-bold 
    transition-all duration-300 
    shadow-[0_0_20px_rgba(6,182,212,0.3)]
    hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]
    hover:scale-[1.02] active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  secondary: `
    px-6 py-3 rounded-2xl 
    bg-white/5 hover:bg-white/10 
    text-white font-bold 
    transition-all duration-300 
    border border-white/10 hover:border-white/20
    backdrop-blur-md
  `,
  ghost: `
    px-6 py-3 rounded-2xl 
    text-gray-400 hover:text-white 
    hover:bg-white/5 
    transition-all duration-300
  `,
  outline: `
    px-6 py-3 rounded-2xl 
    bg-transparent border border-cyan-500/50
    text-cyan-400 hover:bg-cyan-500/10 
    transition-all duration-300
  `
};

export const cards = {
  neo: `
    bg-white/[0.03] backdrop-blur-xl 
    border border-white/10 
    rounded-[2rem] 
    shadow-2xl shadow-black/50
    transition-all duration-500
  `,
  interactive: `
    bg-white/[0.03] backdrop-blur-xl 
    border border-white/10 
    rounded-[2rem] 
    shadow-2xl shadow-black/50
    transition-all duration-500
    hover:bg-white/[0.05] hover:border-white/20
    hover:translate-y--1 hover:shadow-cyan-500/5
    cursor-pointer active:scale-[0.99]
  `,
  glass: `
    bg-black/20 backdrop-blur-md
    border border-white/5
    rounded-2xl
  `
};

export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-16 md:py-24',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
};

export const typography = {
  h1: 'text-5xl md:text-7xl font-black tracking-tighter text-white leading-[1.1]',
  h2: 'text-4xl md:text-5xl font-extrabold tracking-tight text-white',
  h3: 'text-2xl md:text-3xl font-bold text-white',
  body: 'text-lg text-gray-400 leading-relaxed',
  label: 'text-xs font-black uppercase tracking-[0.2em] text-gray-500',
  gradient: 'bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500',
};

// Helper Utilities
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function getButton(variant = 'primary') {
  return buttons[variant] || buttons.primary;
}

export function getCard(variant = 'neo') {
  return cards[variant] || cards.neo;
}

export default {
  colors,
  buttons,
  cards,
  layout,
  typography,
  cn,
  getButton,
  getCard,
};
