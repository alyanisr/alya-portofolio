"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return <motion.div initial={reducedMotion ? false : { opacity: 0, y: 16 }} whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.42, delay }}>{children}</motion.div>;
}
