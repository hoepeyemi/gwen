"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

const SIZE = 600; // Increased size for better coverage

export function isWebGLContext(canvas: HTMLCanvasElement) {
  const contexts = [
    "webgl",
    "experimental-webgl",
    "webgl2",
    "experimental-webgl2",
  ];

  for (const contextType of contexts) {
    try {
      if (canvas.getContext(contextType as any)) {
        return true;
      }
    } catch (e) {}
  }
  return false;
}

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preferReducedMotion, setPreferReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;

    if (!isWebGLContext(canvasRef.current)) {
      setHasWebGL(false);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setPreferReducedMotion(reducedMotion);

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: SIZE * 2,
      height: SIZE * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 0.8,
      mapSamples: 30000,
      mapBrightness: 1.5,
      mapBaseBrightness: 0.05,
      baseColor: [0.1, 0.15, 0.3],
      markerColor: [0.6, 0.8, 1.0],
      glowColor: [0.2, 0.3, 0.8],
      opacity: 0.7, // Reduced opacity for better text readability
      markers: [
        // Location markers
        { location: [37.7749, -122.4194], size: 0.04 }, // San Francisco
        { location: [40.7128, -74.006], size: 0.04 }, // New York
        { location: [51.5074, -0.1278], size: 0.04 }, // London
        { location: [48.8566, 2.3522], size: 0.04 }, // Paris
        { location: [35.6762, 139.6503], size: 0.04 }, // Tokyo
        { location: [-33.8688, 151.2093], size: 0.04 }, // Sydney
        { location: [55.7558, 37.6173], size: 0.04 }, // Moscow
        { location: [19.4326, -99.1332], size: 0.04 }, // Mexico City
        { location: [-22.9068, -43.1729], size: 0.04 }, // Rio de Janeiro
        { location: [30.0444, 31.2357], size: 0.04 }, // Cairo
      ],
      onRender: (state) => {
        // Slow down the rotation speed for a more subtle effect
        const rotationSpeed = preferReducedMotion ? 0 : 0.002;
        state.phi = state.phi + rotationSpeed;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center opacity-90">
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          style={{
            width: SIZE,
            height: SIZE,
            maxWidth: "100%",
            aspectRatio: "1",
          }}
        />
      ) : (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          <p>
            We can&apos;t show the globe because WebGL needs to be enabled in
            your browser. Check your browser settings and reload the page.
          </p>
        </div>
      )}
    </div>
  );
}
