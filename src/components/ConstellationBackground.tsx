"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Node {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  baseX: number;
  baseY: number;
}

interface ConstellationBackgroundProps {
  nodeCount?: number;
  connectionDistance?: number;
}

export function ConstellationBackground({
  nodeCount = 25,
  connectionDistance = 150,
}: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Check for reduced motion preference and mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate responsive node count based on screen area
  const getResponsiveNodeCount = useCallback(
    (width: number, height: number) => {
      const area = width * height;
      const baseArea = 1920 * 1080; // Reference desktop size
      const density = area / baseArea;

      // Scale node count, with minimum of 12 for mobile
      const scaledCount = Math.max(12, Math.round(nodeCount * density));
      // Cap at original count for large screens
      return Math.min(scaledCount, nodeCount);
    },
    [nodeCount]
  );

  const initNodes = useCallback(
    (width: number, height: number, count: number) => {
      const nodes: Node[] = [];

      // Use grid-based distribution with randomness for even spread
      const cols = Math.ceil(Math.sqrt(count * (width / height)));
      const rows = Math.ceil(count / cols);
      const cellWidth = width / cols;
      const cellHeight = height / rows;

      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        // Position within cell with randomness (60% variance within cell)
        const x = (col + 0.2 + Math.random() * 0.6) * cellWidth;
        const y = (row + 0.2 + Math.random() * 0.6) * cellHeight;

        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          radius: Math.random() * 2 + 1.5,
          opacity: Math.random() * 0.4 + 0.3,
        });
      }
      return nodes;
    },
    []
  );

  const drawNetwork = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      mx: number,
      my: number,
      isReducedMotion: boolean,
      isMobileView: boolean
    ) => {
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const time = Date.now() * 0.0005;

      // Update node positions
      nodes.forEach((node) => {
        if (isReducedMotion) {
          // Static positions for reduced motion
          node.x = node.baseX;
          node.y = node.baseY;
        } else {
          // Gentle sine wave motion
          const offsetX = Math.sin(time + node.baseX * 0.01) * 20;
          const offsetY = Math.cos(time + node.baseY * 0.01) * 20;

          node.x = node.baseX + offsetX;
          node.y = node.baseY + offsetY;

          // Mouse influence (skip on mobile for performance)
          if (!isMobileView) {
            const dx = mx - width / 2;
            const dy = my - height / 2;
            node.x += dx * 0.04 * (node.radius / 4);
            node.y += dy * 0.04 * (node.radius / 4);
          }
        }
      });

      // Draw connections (use simpler distance check)
      const connDist = isMobileView ? connectionDistance * 0.8 : connectionDistance;
      const connDistSq = connDist * connDist; // Avoid sqrt for performance

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const nodeI = nodes[i];
        if (!nodeI) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeJ = nodes[j];
          if (!nodeJ) continue;
          const dx = nodeI.x - nodeJ.x;
          const dy = nodeI.y - nodeJ.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            const distance = Math.sqrt(distSq);
            const opacity = (1 - distance / connDist) * 0.15;
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(nodeI.x, nodeI.y);
            ctx.lineTo(nodeJ.x, nodeJ.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        if (isMobileView) {
          // Simplified rendering for mobile - no gradient glow
          ctx.fillStyle = `rgba(0, 212, 255, ${node.opacity})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Full rendering with gradient glow for desktop
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            node.radius * 3
          );
          gradient.addColorStop(0, `rgba(0, 212, 255, ${node.opacity * 0.8})`);
          gradient.addColorStop(0.5, `rgba(0, 212, 255, ${node.opacity * 0.2})`);
          gradient.addColorStop(1, "rgba(0, 212, 255, 0)");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgba(0, 212, 255, ${node.opacity})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    },
    [connectionDistance]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR at 2 for performance
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Reinitialize with responsive node count
      const count = getResponsiveNodeCount(rect.width, rect.height);
      nodesRef.current = initNodes(rect.width, rect.height, count);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Frame rate limiting for mobile (30fps) vs desktop (60fps)
    const targetFps = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFps;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastFrameRef.current;

      if (elapsed >= frameInterval) {
        lastFrameRef.current = timestamp - (elapsed % frameInterval);
        const rect = canvas.getBoundingClientRect();
        drawNetwork(
          ctx,
          rect.width,
          rect.height,
          springX.get(),
          springY.get(),
          prefersReducedMotion,
          isMobile
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    initNodes,
    drawNetwork,
    springX,
    springY,
    prefersReducedMotion,
    isMobile,
    getResponsiveNodeCount,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return; // Skip mouse tracking on mobile
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: "block" }}
      />
    </motion.div>
  );
}
