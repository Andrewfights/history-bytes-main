import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
      },
    },
    extend: {
      fontFamily: {
        editorial: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Premium Obsidian Neutrals
        obsidian: {
          900: '#0A0A0B',
          850: '#0D0E10',
          800: '#111214',
          750: '#15171A',
          700: '#1A1C1F',
        },
        charcoal: {
          650: '#23262B',
          600: '#2A2D31',
          550: '#333740',
        },
        // Metallic Gold
        gold: {
          primary: '#C6A24F',
          highlight: '#E8C979',
          deep: '#B88A2E',
        },
        ivory: '#F5F2EA',
        // Existing token mappings
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "8px",
        xl: "24px",
      },
      boxShadow: {
        'elev1': '0 8px 24px rgba(0,0,0,0.35)',
        'elev2': '0 12px 32px rgba(0,0,0,0.45)',
        'elev3': '0 24px 60px rgba(0,0,0,0.60)',
        'gold-glow': '0 10px 24px rgba(198,162,79,0.25)',
        'gold-glow-strong': '0 14px 34px rgba(198,162,79,0.35)',
        'inset-hairline': '0 0 0 1px rgba(255,255,255,0.08) inset',
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
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px hsl(53 91% 65% / 0.3)" },
          "50%": { boxShadow: "0 0 25px hsl(53 91% 65% / 0.5)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 8px hsl(53 91% 65% / 0.2), 0 0 16px hsl(53 91% 65% / 0.1)"
          },
          "50%": {
            boxShadow: "0 0 16px hsl(53 91% 65% / 0.4), 0 0 32px hsl(53 91% 65% / 0.2)"
          },
        },
        "shine": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-up": "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "shine": "shine 0.6s ease-out",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
