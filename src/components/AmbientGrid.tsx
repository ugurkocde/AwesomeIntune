"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GridNode {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export function AmbientGrid() {
  const [nodes, setNodes] = useState<GridNode[]>([]);

  useEffect(() => {
    // Generate random nodes for the ambient effect
    const generatedNodes: GridNode[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
    setNodes(generatedNodes);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Base SVG Grid Pattern */}
      <svg
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.04 }}
      >
        <defs>
          <pattern
            id="ambient-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-accent"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ambient-grid)" />
      </svg>

      {/* Animated Glow Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            background: "var(--accent-primary)",
            boxShadow: "0 0 20px var(--accent-primary), 0 0 40px var(--accent-glow)",
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: node.duration,
            delay: node.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Connecting Lines (subtle) */}
      <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.02 }}>
        {nodes.slice(0, 6).map((node, i) => {
          const nextNode = nodes[(i + 1) % nodes.length];
          if (!nextNode) return null;
          return (
            <motion.line
              key={`line-${node.id}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${nextNode.x}%`}
              y2={`${nextNode.y}%`}
              stroke="var(--accent-primary)"
              strokeWidth="1"
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4,
                delay: node.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>

      {/* Gradient Overlays for Depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, transparent 0%, var(--bg-primary) 100%),
            radial-gradient(ellipse 80% 50% at 50% 100%, transparent 0%, var(--bg-primary) 100%)
          `,
        }}
      />

      {/* Side Fades */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, var(--bg-primary) 0%, transparent 15%, transparent 85%, var(--bg-primary) 100%)
          `,
        }}
      />
    </div>
  );
}
