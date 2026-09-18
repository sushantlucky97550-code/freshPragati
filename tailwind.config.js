/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        railway: {
          dark: '#080C14',
          deeper: '#050811',
          cardDark: '#0C1422',
          cardDarkHover: '#111D32',
          borderDark: '#1A2744',
          navy: '#0B1E36',
          navyLight: '#163156',
          maroon: '#801820',
          maroonBright: '#A61E28',
          track: '#475569',
          steel: '#94A3B8',
          green: '#10B981',
          greenGlow: '#059669',
          amber: '#F59E0B',
          red: '#EF4444',
          traction: '#0284C7',
          cyan: '#06B6D4',
          cyanGlow: '#22D3EE',
          gold: '#FBBF24',
          signal: {
            red: '#DC2626',
            amber: '#F59E0B',
            green: '#10B981',
          }
        },
        command: {
          bg: '#060A12',
          surface: '#0B1120',
          card: '#0E1626',
          cardHover: '#121E36',
          border: '#1A2744',
          borderLight: '#243556',
          accent: '#1E40AF',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'train-move': 'trainMove 12s linear infinite',
        'train-move-fast': 'trainMove 6s linear infinite',
        'signal-blink': 'signalBlink 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'track-draw': 'trackDraw 1.5s ease-out forwards',
        'counter-tick': 'counterTick 0.3s ease-out',
        'scan-line': 'scanLine 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        trainMove: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
        signalBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px 0 rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(6, 182, 212, 0.35)' },
        },
        trackDraw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        counterTick: {
          '0%': { transform: 'scale(1.15)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scan: {
          '0%, 100%': { transform: 'translateX(0%)' },
          '50%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'command': '0 4px 24px -4px rgba(0, 0, 0, 0.5)',
        'command-lg': '0 8px 40px -8px rgba(0, 0, 0, 0.6)',
        'glow-cyan': '0 0 20px 2px rgba(6, 182, 212, 0.15)',
        'glow-red': '0 0 20px 2px rgba(239, 68, 68, 0.15)',
        'glow-green': '0 0 20px 2px rgba(16, 185, 129, 0.15)',
        'glow-amber': '0 0 20px 2px rgba(245, 158, 11, 0.15)',
        'card-hover': '0 8px 32px -6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(26, 39, 68, 0.5)',
      }
    },
  },
  plugins: [],
}
