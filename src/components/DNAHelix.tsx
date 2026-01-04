"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  angle: number;
  strand: 0 | 1;
  delay: number;
}

export function DNAHelix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 30, stiffness: 100 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), springConfig);

  // Generate particles for the helix
  useEffect(() => {
    const newParticles: Particle[] = [];
    const numParticles = 20;

    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: i * 2,
        angle: (i / numParticles) * Math.PI * 4,
        strand: 0,
        delay: i * 0.1,
      });
      newParticles.push({
        id: i * 2 + 1,
        angle: (i / numParticles) * Math.PI * 4,
        strand: 1,
        delay: i * 0.1,
      });
    }

    setParticles(newParticles);
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      className="relative h-80 w-40"
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateZ: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Particles */}
        {particles.map((particle) => {
          const radius = 50;
          const x = Math.cos(particle.angle) * radius * (particle.strand === 0 ? 1 : -1);
          const z = Math.sin(particle.angle) * radius * (particle.strand === 0 ? 1 : -1);
          const y = ((particle.angle / (Math.PI * 4)) * 280) - 140;

          return (
            <motion.div
              key={particle.id}
              className="absolute left-1/2 top-1/2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Particle glow */}
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  background: particle.strand === 0
                    ? "var(--accent-primary)"
                    : "var(--signal-purple)",
                  boxShadow: particle.strand === 0
                    ? "0 0 20px var(--accent-primary), 0 0 40px var(--accent-primary)"
                    : "0 0 20px var(--signal-purple), 0 0 40px var(--signal-purple)",
                }}
              />
            </motion.div>
          );
        })}

        {/* Connecting lines between strands */}
        {particles.filter((p) => p.strand === 0).map((particle, i) => {
          if (i % 2 !== 0) return null;

          const radius = 50;
          const x1 = Math.cos(particle.angle) * radius;
          const z1 = Math.sin(particle.angle) * radius;
          const _x2 = -x1;
          const _z2 = -z1;
          const y = ((particle.angle / (Math.PI * 4)) * 280) - 140;

          return (
            <motion.div
              key={`line-${particle.id}`}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) translate3d(0, ${y}px, 0)`,
                transformStyle: "preserve-3d",
              }}
            >
              <motion.div
                className="h-px origin-center"
                style={{
                  width: radius * 2,
                  background: "linear-gradient(90deg, var(--accent-primary), transparent 30%, transparent 70%, var(--signal-purple))",
                  transform: `rotateY(${(particle.angle * 180) / Math.PI}deg)`,
                  opacity: 0.3,
                }}
                animate={{
                  opacity: [0.1, 0.4, 0.1],
                }}
                transition={{
                  duration: 2,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          );
        })}

        {/* Central axis glow */}
        <div
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2), transparent)",
          }}
        />
      </motion.div>

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.15), rgba(139, 92, 246, 0.1), transparent)",
        }}
      />
    </motion.div>
  );
}

// Orbital version - tools orbiting a central point
export function OrbitalConstellation({ toolCount }: { toolCount: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 30, stiffness: 100 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [20, -20]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-30, 30]), springConfig);

  // Generate orbits
  const orbits = [
    { radius: 80, particles: 6, speed: 30, color: "var(--accent-primary)" },
    { radius: 130, particles: 8, speed: 45, color: "var(--signal-purple)" },
    { radius: 180, particles: 10, speed: 60, color: "var(--accent-secondary)" },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(Math.max(0, Math.min(1, x)));
      mouseY.set(Math.max(0, Math.min(1, y)));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      className="relative h-[400px] w-[400px]"
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Central core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary), var(--signal-purple))",
              boxShadow: "0 0 60px var(--accent-primary), 0 0 120px rgba(0, 212, 255, 0.5)",
            }}
            animate={{
              boxShadow: [
                "0 0 60px var(--accent-primary), 0 0 120px rgba(0, 212, 255, 0.3)",
                "0 0 80px var(--accent-primary), 0 0 150px rgba(0, 212, 255, 0.5)",
                "0 0 60px var(--accent-primary), 0 0 120px rgba(0, 212, 255, 0.3)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="font-display text-2xl font-bold text-white">
              {toolCount}
            </span>
          </motion.div>
        </div>

        {/* Orbits */}
        {orbits.map((orbit, orbitIndex) => (
          <motion.div
            key={orbitIndex}
            className="absolute left-1/2 top-1/2"
            style={{
              width: orbit.radius * 2,
              height: orbit.radius * 2,
              marginLeft: -orbit.radius,
              marginTop: -orbit.radius,
              transformStyle: "preserve-3d",
            }}
            animate={{ rotateZ: 360 }}
            transition={{
              duration: orbit.speed,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Orbit ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `1px solid ${orbit.color}20`,
              }}
            />

            {/* Particles on orbit */}
            {Array.from({ length: orbit.particles }, (_, i) => {
              const angle = (i / orbit.particles) * Math.PI * 2;
              const x = Math.cos(angle) * orbit.radius;
              const y = Math.sin(angle) * orbit.radius;

              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  }}
                  animate={{ rotateZ: -360 }}
                  transition={{
                    duration: orbit.speed,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <motion.div
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: orbit.color,
                      boxShadow: `0 0 10px ${orbit.color}, 0 0 20px ${orbit.color}`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        ))}

        {/* Connection lines from particles to center */}
        <svg className="absolute inset-0 h-full w-full opacity-20">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--accent-primary)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.15), transparent)",
        }}
      />
    </motion.div>
  );
}
