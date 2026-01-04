"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  // Smooth spring animation for the progress
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Glow intensity increases as you scroll
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 1]);

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[100] h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: glowOpacity,
          boxShadow: "0 0 20px var(--accent-primary), 0 0 40px var(--accent-primary)",
        }}
      />

      {/* Leading edge glow */}
      <motion.div
        className="absolute right-0 top-0 h-full w-20"
        style={{
          background: "linear-gradient(90deg, transparent, var(--accent-primary))",
          opacity: glowOpacity,
          filter: "blur(8px)",
        }}
      />
    </motion.div>
  );
}
