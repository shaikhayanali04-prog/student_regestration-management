/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1480px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "sans-serif"],
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
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
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        surface: "hsl(var(--surface))",
        "surface-muted": "hsl(var(--surface-muted))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "primary-soft": "hsl(var(--primary-soft))",
        "accent-soft": "hsl(var(--accent-soft))",
      },
      borderRadius: {
        xl: "1rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 3px)",
        sm: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.04)",
        lift: "0 18px 40px rgba(15, 23, 42, 0.08)",
        glow: "0 20px 60px rgba(59, 91, 219, 0.18)",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle at 1px 1px, rgba(59, 91, 219, 0.12) 1px, transparent 0)",
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(59, 91, 219, 0.18), transparent 32%), radial-gradient(circle at top right, rgba(106, 76, 255, 0.14), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(248,249,250,0.96) 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" }
        },
        "soft-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "mesh-shift": {
          "0%, 100%": { backgroundPosition: "0% 0%, 100% 0%, 50% 50%" },
          "50%": { backgroundPosition: "12% 8%, 88% 12%, 52% 48%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-right": "slide-out-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "soft-float": "soft-float 5s ease-in-out infinite",
        "mesh-shift": "mesh-shift 16s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
