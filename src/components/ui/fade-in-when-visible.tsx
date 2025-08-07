"use client";
import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface FadeInWhenVisibleProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

function FadeInWhenVisible({ children, delay = 0, direction = "up" }: FadeInWhenVisibleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ 
        opacity: isInView ? 1 : 0, 
        y: isInView ? 0 : directions[direction].y || 0,
        x: isInView ? 0 : directions[direction].x || 0
      }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
}

export default FadeInWhenVisible;