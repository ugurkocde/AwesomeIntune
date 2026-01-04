"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  rotate?: number;
}

export function FloatingCard({
  children,
  className = "",
  delay = 0,
  duration = 6,
  y = 20,
  rotate = 3,
}: FloatingCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50, rotateX: 20 }}
      animate={{
        opacity: 1,
        y: [0, -y, 0],
        rotateX: [0, rotate, 0],
        rotateY: [0, -rotate, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        y: {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        rotateX: {
          duration: duration * 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        rotateY: {
          duration: duration * 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 1,
        },
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {children}
    </motion.div>
  );
}
