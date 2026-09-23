"use client";

import { useReducedMotion } from "motion/react";
import { useState } from "react";

export function PortfolioOrbit() {
  const reducedMotion = useReducedMotion();
  const [rotation, setRotation] = useState({ x: -12, y: 18 });

  return <div className="portfolio-orbit" aria-hidden="true" onPointerMove={(event) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setRotation({ x: -14 + ((event.clientY - rect.top) / rect.height - .5) * -12, y: 18 + ((event.clientX - rect.left) / rect.width - .5) * 22 });
  }}>
    <div className="orbit-scene" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
      <div className="orbit-core">A</div>
      <span className="orbit-card orbit-card-a">Understand</span>
      <span className="orbit-card orbit-card-b">Build</span>
      <span className="orbit-card orbit-card-c">Improve</span>
      <i className="orbit-ring orbit-ring-a" /><i className="orbit-ring orbit-ring-b" />
    </div>
  </div>;
}
