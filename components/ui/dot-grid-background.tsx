"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Uniforms = { [key: string]: { value: number[] | number[][] | number; type: string } };

// Fixed full-viewport background layer wrapping CanvasRevealEffect — drop this once at the
// page level, behind all content. zIndex 0 + pointer-events none so it doesn't intercept clicks.
export const DotGridBackground = () => (
  <div
    aria-hidden
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
    }}
  >
    {/* DEBUG: bright dots + no gradient overlay so we can confirm the shader is actually
        painting. The default opacities (0.08–0.16) plus the from-black gradient were
        crushing the dots invisible. Dial these back once visibility is confirmed. */}
    <CanvasRevealEffect
      colors={[[180, 180, 210]]}
      opacities={[0.3, 0.3, 0.35, 0.4, 0.4, 0.45, 0.5, 0.5, 0.55, 0.6]}
      showGradient={false}
    />
  </div>
);

export const CanvasRevealEffect = ({
  animationSpeed = 3,
  opacities = [0.08, 0.08, 0.08, 0.1, 0.1, 0.12, 0.12, 0.14, 0.14, 0.16],
  colors = [[120, 120, 140]],
  containerClassName,
  dotSize = 2,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) => {
  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors ?? [[120, 120, 140]]}
          dotSize={dotSize ?? 2}
          opacities={opacities}
          shader={`
            ${reverse ? "u_reverse_active" : "false"}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
          center={["x", "y"]}
        />
      </div>
      {showGradient && <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />}
    </div>
  );
};

interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
  center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = "",
  center = ["x", "y"],
}) => {
  const uniforms = React.useMemo(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
    if (colors.length === 2) colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    else if (colors.length === 3) colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
    return {
      u_colors: { value: colorsArray.map((c) => [c[0] / 255, c[1] / 255, c[2] / 255]), type: "uniform3fv" },
      u_opacities: { value: opacities, type: "uniform1fv" },
      u_total_size: { value: totalSize, type: "uniform1f" },
      u_dot_size: { value: dotSize, type: "uniform1f" },
      u_reverse: { value: shader.includes("u_reverse_active") ? 1 : 0, type: "uniform1i" },
    };
  }, [colors, opacities, totalSize, dotSize, shader]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;
        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;
        out vec4 fragColor;
        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) { return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x); }
        void main() {
            vec2 st = fragCoord.xy;
            ${center.includes("x") ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));" : ""}
            ${center.includes("y") ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));" : ""}
            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);
            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
            vec3 color = u_colors[int(show_offset * 6.0)];
            // one-time center-out intro reveal
            float animation_speed_factor = 0.5;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);
            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
            opacity *= step(timing_offset_intro, u_time * animation_speed_factor);
            opacity *= clamp((1.0 - step(timing_offset_intro + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
      maxFps={30}
    />
  );
};

interface ShaderProps { source: string; uniforms: Uniforms; maxFps?: number }

const ShaderMaterial = ({ source, uniforms, maxFps = 30 }: ShaderProps) => {
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);
  const prefersReducedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedRef.current = mql.matches;
    const onChange = (e: MediaQueryListEvent) => {
      prefersReducedRef.current = e.matches;
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Drive u_time so the intro reveal completes once, then hold + add a faint shimmer.
  //
  // The shader gates each dot with: step(timing_offset_intro, u_time * 0.5), where
  // timing_offset_intro = dist_from_center_in_grid_cells * 0.01 + (random * 0.15).
  // For a 1920×1080 viewport with totalSize 20, max dist is ~110 grid cells, so max
  // timing_offset_intro ≈ 1.25 → u_time must reach > 2.5 to reveal corner dots. For 4K
  // it's ~2.35 → needs u_time > 4.7. The original hold at u_time ≈ 2.0 left every dot
  // outside the center radius hidden, which is why the page looked plain black.
  // Hold at HOLD_VALUE = 6 so corners stay revealed across common viewports, and ramp
  // effective from 0 → HOLD_VALUE over REVEAL_DURATION so the reveal still plays once.
  // For prefers-reduced-motion: snap to HOLD_VALUE, no shimmer.
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const material: any = ref.current.material;
    const REVEAL_DURATION = 2.0;  // seconds of real time for the intro reveal
    const HOLD_VALUE = 6.0;       // u_time at rest — safely past every dot's timing_offset + 0.1
    const SHIMMER_AMP = 0.15;     // barely-perceptible oscillation around HOLD_VALUE
    let effective: number;
    if (prefersReducedRef.current) {
      effective = HOLD_VALUE;
    } else if (t < REVEAL_DURATION) {
      effective = (t / REVEAL_DURATION) * HOLD_VALUE; // linear ramp 0 → HOLD_VALUE
    } else {
      effective = HOLD_VALUE + Math.sin((t - REVEAL_DURATION) * 0.3) * SHIMMER_AMP;
    }
    material.uniforms.u_time.value = effective;
  });

  const getUniforms = () => {
    const prepared: any = {};
    for (const name in uniforms) {
      const u: any = uniforms[name];
      switch (u.type) {
        case "uniform1f": prepared[name] = { value: u.value, type: "1f" }; break;
        case "uniform1i": prepared[name] = { value: u.value, type: "1i" }; break;
        case "uniform1fv": prepared[name] = { value: u.value, type: "1fv" }; break;
        case "uniform3fv":
          prepared[name] = { value: u.value.map((v: number[]) => new THREE.Vector3().fromArray(v)), type: "3fv" };
          break;
        default: break;
      }
    }
    prepared["u_time"] = { value: 0, type: "1f" };
    prepared["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return prepared;
  };

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        precision mediump float;
        in vec2 coordinates;
        uniform vec2 u_resolution;
        out vec2 fragCoord;
        void main(){
          gl_Position = vec4(position.x, position.y, 0.0, 1.0);
          fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
          fragCoord.y = u_resolution.y - fragCoord.y;
        }`,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });
  }, [size.width, size.height, source]);

  return (
    <mesh ref={ref as any}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const Shader: React.FC<ShaderProps> = ({ source, uniforms, maxFps = 30 }) => {
  return (
    <Canvas className="absolute inset-0 h-full w-full">
      <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
    </Canvas>
  );
};
