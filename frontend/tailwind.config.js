/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PixelWar palette
        'pw-green':      '#4caf50',
        'pw-green-dark': '#388e3c',
        'pw-green-deep': '#1b5e20',
        'pw-forest':     '#4caf50',
        'pw-forestDark': '#388e3c',
        'pw-navy':       '#0d2b27',
        'pw-navy-mid':   '#14533c',
        'pw-sky':        '#87ceeb',
        'pw-sky-dark':   '#5ba3c9',
        'pw-cream':      '#fef9e7',
        'pw-gold':       '#facc15',
        'pw-gold-dark':  '#eab308',
        'pw-yellow':     '#f3c42e',
        'pw-red':        '#ef4444',
        'pw-danger':     '#ef4444',
        'pw-purple':     '#7c3aed',
        'pw-teal':       '#0d9488',
        'pw-border':     '#191c1e',
        'pw-white':      '#ffffff',
      },
      fontFamily: {
        pixel: ["'Press Start 2P'", 'monospace'],
      },
      fontSize: {
        'xxs': '6px',
        'px-xs': '8px',
        'px-sm': '10px',
        'px-base': '12px',
        'px-md': '14px',
        'px-lg': '18px',
        'px-xl': '24px',
        'px-2xl': '32px',
        'px-hero': '64px',
      },
      spacing: {
        'pw-sm': '16px',
        'pw-md': '24px',
        'pw-lg': '40px',
        'pw-xl': '64px',
      },
      boxShadow: {
        'pixel': '4px 4px 0 0 #191c1e',
        'pixel-sm': '2px 2px 0 0 #191c1e',
        'pixel-gold': '4px 4px 0 0 #eab308',
        'pixel-green': '4px 4px 0 0 #388e3c',
        'pixel-inset': 'inset 4px 4px 0 0 rgba(0,0,0,0.25)',
      },
      borderWidth: {
        'pixel': '4px',
      },
      animation: {
        'pixel-float': 'pixel-float 3s ease-in-out infinite',
        'pixel-pulse': 'pixel-pulse 2s ease-in-out infinite',
        'pixel-blink': 'pixel-blink 1s step-end infinite',
        'marquee': 'marquee 20s linear infinite',
        'glow': 'glow-pulse 2s ease-in-out infinite',
        'slide-right': 'slide-in-right 0.3s ease',
        'count-up': 'count-up 0.5s ease forwards',
      },
      keyframes: {
        'pixel-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pixel-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'pixel-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(250,204,21,0.4)' },
          '50%': { boxShadow: '0 0 20px 6px rgba(250,204,21,0.8)' },
        },
        'slide-in-right': {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'count-up': {
          'from': { opacity: '0', transform: 'translateY(4px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};