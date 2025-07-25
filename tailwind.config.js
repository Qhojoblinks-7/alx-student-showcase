// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}', // Make sure src is included
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Define your custom dark palette and accents
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors for your tech aesthetic
        gray: {
          950: '#0F0F0F', // Very dark background
          900: '#1A1A1A',
          800: '#2C2C2C',
          700: '#3D3D3D',
          600: '#4F4F4F',
          500: '#666666',
          400: '#999999',
          300: '#B0B0B0',
          200: '#CCCCCC',
          100: '#E0E0E0',
        },
        neutral: {
          950: '#0A0A0A',
          900: '#111111',
          800: '#222222',
          700: '#333333',
        },
        blue: {
          300: '#8FB8ED',
          400: '#42A5F5', // Lighter blue accent
          500: '#2196F3', // Primary blue
          600: '#1976D2',
        },
        purple: {
          400: '#C28BF4',
          500: '#AB47BC', // Lighter purple accent
          600: '#9C27B0', // Primary purple
          700: '#7B1FA2',
        },
        indigo: {
          500: '#6366F1',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // --- Custom Keyframes for HeroSection ---

        // Existing 'blob' animation (retained)
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30vw, -20vh) scale(1.1)' },
          '66%': { transform: 'translate(-20vw, 30vh) scale(0.9)' },
        },
        // Existing 'fadeIn' animation (retained)
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // Existing 'fadeInSlow' animation (retained)
        fadeInSlow: {
          from: { opacity: '0' },
          to: { opacity: '0.1' },
        },
        // Existing 'slideUp' animation (retained)
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },

        // Updated 'fadeInUp' to match HeroSection usage
        'fade-in-up': { // Changed from fadeInUp to 'fade-in-up' for consistency
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

        // New: For subtle background element movement (used as 'floating' in HeroSection)
        floating: {
            "0%": { transform: "translate(0, 0) scale(1)" },
            "25%": { transform: "translate(20px, -30px) scale(1.05)" },
            "50%": { transform: "translate(-15px, 20px) scale(0.95)" },
            "75%": { transform: "translate(10px, -10px) scale(1)", },
            "100%": { transform: "translate(0, 0) scale(1)" },
        },
        // New: For avatar surrounding circles - slow spin
        'spin-slow': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
        },
        // New: For avatar surrounding circles - faster spin
        'spin-fast': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
        },
        // New: For elements sliding in from the right
        'slide-in-right': {
            '0%': { opacity: '0', transform: 'translateX(30px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // --- Custom Animations for HeroSection ---

        // Existing animations (retained)
        blob: 'blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55)',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-in-slow': 'fadeInSlow 3s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',

        // Updated 'fade-in-up' to match HeroSection usage
        'fade-in-up': 'fade-in-up 0.7s ease-out forwards', // Changed name and duration/easing

        // New animations
        'floating': 'floating 15s ease-in-out infinite alternate', // Adjust duration and timing as needed
        'spin-slow': 'spin-slow 25s linear infinite', // Slower spin for avatar circles
        'spin-fast': 'spin-fast 15s linear infinite', // Faster spin for avatar circles
        'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards', // Smoother slide
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};