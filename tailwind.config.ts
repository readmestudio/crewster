import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: "#FAFAF8",
        lime: {
          DEFAULT: "#E2F579",
          hover: "#D4E86A",
        },
        mint: "#A8E6CF",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6B6B",
        "subtle-gray": "#E5E5E5",
        "hover-gray": "#F5F5F5",
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      fontSize: {
        'hero': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'full': '100px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
