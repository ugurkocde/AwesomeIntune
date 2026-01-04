"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerating progress
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    // Complete loading after animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[10001] flex items-center justify-center"
          style={{ background: "var(--bg-primary)" }}
        >
          {/* Background grid animation */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
              animate={{
                backgroundPosition: ["0px 0px", "50px 50px"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          {/* Radial glow */}
          <motion.div
            className="absolute h-[600px] w-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo animation */}
            <div className="relative mb-12">
              {/* Orbiting particles */}
              {Array.from({ length: 3 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: 120 + i * 40,
                    height: 120 + i * 40,
                    marginLeft: -(60 + i * 20),
                    marginTop: -(60 + i * 20),
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: 6 - i,
                      height: 6 - i,
                      background: "var(--accent-primary)",
                      boxShadow: "0 0 10px var(--accent-primary), 0 0 20px var(--accent-primary)",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                </motion.div>
              ))}

              {/* Center logo */}
              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2))",
                  border: "1px solid rgba(0, 212, 255, 0.3)",
                  boxShadow: "0 0 40px rgba(0, 212, 255, 0.3), inset 0 0 40px rgba(0, 212, 255, 0.1)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 40px rgba(0, 212, 255, 0.3), inset 0 0 40px rgba(0, 212, 255, 0.1)",
                    "0 0 60px rgba(0, 212, 255, 0.5), inset 0 0 60px rgba(0, 212, 255, 0.2)",
                    "0 0 40px rgba(0, 212, 255, 0.3), inset 0 0 40px rgba(0, 212, 255, 0.1)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.span
                  className="font-display text-4xl font-bold"
                  style={{ color: "var(--accent-primary)" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  AI
                </motion.span>
              </motion.div>
            </div>

            {/* Text reveal */}
            <motion.div className="mb-8 overflow-hidden">
              <motion.h1
                className="font-display text-3xl font-bold tracking-tight md:text-4xl"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="text-gradient">AWESOME</span>{" "}
                <span style={{ color: "var(--text-primary)" }}>INTUNE</span>
              </motion.h1>
            </motion.div>

            {/* Progress bar */}
            <div className="relative w-64">
              <div
                className="h-0.5 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(255, 255, 255, 0.1)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                    boxShadow: "0 0 20px var(--accent-primary)",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Progress text */}
              <motion.div
                className="mt-4 text-center text-sm font-medium"
                style={{ color: "var(--text-tertiary)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.span
                  key={Math.floor(progress)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {progress < 30 && "Initializing..."}
                  {progress >= 30 && progress < 60 && "Loading tools..."}
                  {progress >= 60 && progress < 90 && "Almost ready..."}
                  {progress >= 90 && "Welcome"}
                </motion.span>
              </motion.div>
            </div>
          </div>

          {/* Corner decorations */}
          {[
            { top: 0, left: 0, rotate: 0 },
            { top: 0, right: 0, rotate: 90 },
            { bottom: 0, right: 0, rotate: 180 },
            { bottom: 0, left: 0, rotate: 270 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute h-32 w-32"
              style={{
                ...pos,
                transform: `rotate(${pos.rotate}deg)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <motion.path
                  d="M 0 0 L 50 0 L 50 5 L 5 5 L 5 50 L 0 50 Z"
                  fill="none"
                  stroke="rgba(0, 212, 255, 0.3)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
          ))}

          {/* Exit curtains */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-20"
            initial={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "var(--bg-primary)",
              transformOrigin: "bottom",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
