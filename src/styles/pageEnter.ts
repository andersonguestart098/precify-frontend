/** Entrance motion for page content. Pages that keep a fixed header (greeting) apply it below that header only. */
export const pageEnterSx = {
  animation: "pageEnter 260ms cubic-bezier(.2,.8,.2,1) both",
  "@keyframes pageEnter": { from: { opacity: .55, transform: "translateY(5px)" }, to: { opacity: 1, transform: "translateY(0)" } },
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
} as const;
