"use client";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMobile, setIsMobile] = useState(true);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Outer ring with more lag
  const ringSpringConfig = { damping: 20, stiffness: 200, mass: 0.8 };
  const ringX = useSpring(cursorX, ringSpringConfig);
  const ringY = useSpring(cursorY, ringSpringConfig);

  const addParticle = useCallback((x: number, y: number) => {
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.3,
    };
    setParticles((prev) => [...prev.slice(-20), newParticle]);
  }, []);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    let frameCount = 0;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      // Add particle every few frames for trail effect
      frameCount++;
      if (frameCount % 3 === 0) {
        addParticle(e.clientX, e.clientY);
      }

      // Check if hovering over clickable element
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        (target.closest("a") ?? false) ||
        (target.closest("button") ?? false) ||
        (target.closest("[role='button']") ?? false) ||
        window.getComputedStyle(target).cursor === "pointer";
      setIsPointer(!!isClickable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", checkMobile);
    };
  }, [cursorX, cursorY, addParticle]);

  // Clean up old particles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles((prev) => prev.slice(-15));
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <>
      {/* Hide default cursor via CSS */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>

      {/* Particle trail */}
      <div className="pointer-events-none fixed inset-0 z-[9998]">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: particle.opacity, scale: 1 }}
              animate={{ opacity: 0, scale: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                background: "var(--accent-primary)",
                boxShadow: "0 0 10px var(--accent-primary), 0 0 20px var(--accent-primary)",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed z-[9999]"
        style={{
          left: ringX,
          top: ringY,
          x: "-50%",
          y: "-50%",
        }}
      >
        <motion.div
          animate={{
            width: isPointer ? 50 : 40,
            height: isPointer ? 50 : 40,
            opacity: isVisible ? 1 : 0,
            scale: isClicking ? 0.8 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-full"
          style={{
            border: "1px solid rgba(0, 212, 255, 0.3)",
            background: isPointer
              ? "radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)"
              : "transparent",
          }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed z-[10000]"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: "-50%",
          y: "-50%",
        }}
      >
        <motion.div
          animate={{
            width: isPointer ? 8 : 6,
            height: isPointer ? 8 : 6,
            opacity: isVisible ? 1 : 0,
            scale: isClicking ? 1.5 : 1,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="rounded-full"
          style={{
            background: "var(--accent-primary)",
            boxShadow: "0 0 15px var(--accent-primary), 0 0 30px var(--accent-primary), 0 0 45px rgba(0, 212, 255, 0.5)",
          }}
        />
      </motion.div>

      {/* Click ripple effect */}
      <AnimatePresence>
        {isClicking && (
          <motion.div
            className="pointer-events-none fixed z-[9997]"
            style={{
              left: cursorX.get(),
              top: cursorY.get(),
              x: "-50%",
              y: "-50%",
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 100, height: 100, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                border: "2px solid var(--accent-primary)",
                background: "radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
