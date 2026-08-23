import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        // Used by Groundbreakable Leads (/leads) headings for a premium,
        // editorial feel distinct from the investor dashboard's plain sans.
        serif: ["Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
