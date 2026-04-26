const config = {
  content: [],
  theme: {
    extend: {
      // Font families reference CSS variables set via next/font in RECIPE-023.
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      // Border radius scale — full color and type tokens added in RECIPE-022.
      borderRadius: {
        sm: "2px",
        md: "4px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
}

export default config
