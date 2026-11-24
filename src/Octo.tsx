import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';

// Procedural 3D octopus mascot (simplified recreation of the channel's purple-octopus-with-laptop look).
// No external assets => no asset licence issues. Pure function of frame (no useFrame).
const BODY = '#9b3fe0', BODY2 = '#7f2fc4', SUCKER = '#ffb36b', CHEEK = '#ff6fa8';
const N = 28;

const bez = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, s: number) =>
  a.clone().multiplyScalar((1 - s) * (1 - s)).addScaledVector(b, 2 * (1 - s) * s).addScaledVector(c, s * s);

const Segs: React.FC<{pts: THREE.Vector3[]; color: string; r0: number; suckers?: boolean}> = ({pts, color, r0, suckers = true}) => (
  <>
    {pts.map((p, j) => {
      const s = j / (pts.length - 1);
      const r = r0 * (1 - s * 0.86) + 0.02;
      const nxt = pts[Math.min(j + 1, pts.length - 1)], prv = pts[Math.max(j - 1, 0)];
      const tang = nxt.clone().sub(prv).normalize();
      // underside direction: perpendicular to tangent, biased toward +z/down (toward viewer)
      const side = new THREE.Vector3().crossVectors(tang, new THREE.Vector3(1, 0, 0)).normalize();
      if (side.z < 0) side.negate();
      return (
        <React.Fragment key={j}>
          <mesh position={p} scale={r}><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={color} roughness={0.42} /></mesh>
          {suckers && j % 2 === 1 && s > 0.12 && s < 0.95 ? (
            <mesh position={p.clone().addScaledVector(side, r * 0.88)} scale={r * 0.42} lookAt={undefined}>
              <sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color={SUCKER} roughness={0.35} emissive={SUCKER} emissiveIntensity={0.15} />
            </mesh>
          ) : null}
        </React.Fragment>
      );
    })}
  </>
);

const Tentacle: React.FC<{i: number; t: number}> = ({i, t}) => {
  const a = (i / 8) * Math.PI * 2 + 0.4;
  const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
  const tan = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
  const front = i === 1 || i === 2;
  const pts: THREE.Vector3[] = [];
  if (front) {
    // typing arms: base -> keyboard, tip taps keys
    const sx = i === 1 ? 1 : -1;
    const A = new THREE.Vector3(sx * 0.55, -0.85, 0.85);
    const tap = Math.max(0, Math.sin(t * 9 + i * 2)) * 0.12;
    const C = new THREE.Vector3(sx * 0.7 + Math.sin(t * 2 + i) * 0.1, -1.95 + tap, 2.15);
    const B = new THREE.Vector3(sx * 1.5, -1.2, 1.6);
    for (let j = 0; j < N; j++) pts.push(bez(A, B, C, j / (N - 1)));
  } else {
    const wave = i === 4; // one arm waves hello
    for (let j = 0; j < N; j++) {
      const s = j / (N - 1);
      const ph = t * 3 - s * 5 + i * 0.9;
      const reach = 0.8 + s * 1.6;
      const lateral = Math.sin(ph) * 0.42 * s;
      let y = -0.8 - s * 1.45 + Math.cos(ph * 0.8) * 0.18 * s + Math.pow(s, 3) * 0.8 * (0.5 + 0.5 * Math.sin(t * 2 + i));
      if (wave) y = -0.8 + s * 1.8;
      const p = dir.clone().multiplyScalar(reach * (wave ? 0.8 : 1)).addScaledVector(tan, wave ? Math.sin(t * 6 - s * 3) * 0.5 * s : lateral);
      pts.push(new THREE.Vector3(p.x, y, p.z));
    }
  }
  return <Segs pts={pts} color={i % 2 ? BODY2 : BODY} r0={0.36} />;
};

const Laptop: React.FC<{t: number}> = ({t}) => (
  <group position={[0, -2.55, 3.0]} rotation={[0, Math.PI, 0]}>
    <mesh position={[0, 0, 0.75]}><boxGeometry args={[2.5, 0.09, 1.6]} /><meshStandardMaterial color="#c9d3e6" metalness={0.7} roughness={0.3} /></mesh>
    <mesh position={[0, 0.06, 0.8]}><boxGeometry args={[2.2, 0.03, 1.2]} /><meshStandardMaterial color="#27304a" roughness={0.6} /></mesh>
    <group position={[0, 0.05, 0]} rotation={[0.32, 0, 0]}>
      <mesh position={[0, 0.55, 0]}><boxGeometry args={[2.5, 1.1, 0.08]} /><meshStandardMaterial color="#5b6684" metalness={0.7} roughness={0.35} /></mesh>
      <mesh position={[0, 0.55, -0.05]} rotation={[0, Math.PI, 0]}><circleGeometry args={[0.22, 24]} /><meshStandardMaterial color="#2de2c8" emissive="#2de2c8" emissiveIntensity={0.9} /></mesh>
      <mesh position={[0, 0.55, 0.045]}><planeGeometry args={[2.3, 0.95]} /><meshStandardMaterial color="#0a6e7a" emissive="#1fc7b0" emissiveIntensity={0.55 + Math.sin(t * 3) * 0.1} /></mesh>
      {[0, 1, 2, 3].map((k) => <mesh key={k} position={[-0.7 + (k % 2) * 0.2 + ((k * 7) % 3) * 0.1, 1.15 - k * 0.26, 0.055]}><planeGeometry args={[0.9 + ((k * 5) % 4) * 0.2, 0.09]} /><meshBasicMaterial color="#064e5a" /></mesh>)}
    </group>
    <pointLight position={[0, 1.2, 1.2]} intensity={14} color="#2de2c8" />
  </group>
);

export const OctoCharacter: React.FC<{camZ?: number}> = ({camZ = 16.5}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const enter = spring({frame, fps, config: {damping: 11, stiffness: 90, mass: 0.8}});
  const bob = Math.sin(t * 2.2) * 0.12;
  const squash = 1 + Math.sin(t * 4.4) * 0.02;
  const bp = frame % 66;
  const blink = bp < 5 ? Math.abs(bp - 2.5) / 2.5 : 1;
  // look: alternates between laptop screen (down) and camera
  const phase = Math.sin(t * 0.9);
  const lookX = Math.sin(t * 1.3) * 0.06, lookY = phase > 0.2 ? -0.07 : 0.02;
  const happy = 0.5 + 0.5 * Math.sin(t * 2.2); // smile width
  const brow = 0.04 + 0.05 * Math.max(0, Math.sin(t * 1.1));
  return (
    <ThreeCanvas width={width} height={height} camera={{position: [0, 0.2, camZ], fov: 38}}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 7]} intensity={2.2} />
      <pointLight position={[-5, 2, 4]} intensity={50} color="#6fb6ff" />
      <pointLight position={[5, -1, 3]} intensity={30} color="#ff9bd0" />
      <group scale={enter * 1.15} position={[0, bob + 0.9, 0]} rotation={[0.08, Math.sin(t * 0.8) * 0.2, Math.sin(t * 1.1) * 0.03]}>
        <group scale={[1, squash, 1]}>
          <mesh position={[0, 0.8, 0]} scale={[1.3, 1.4, 1.25]}><sphereGeometry args={[1, 56, 44]} /><meshStandardMaterial color={BODY} roughness={0.38} /></mesh>
          {/* head spots */}
          {[[-0.5, 1.9, 0.9, 0.12], [0.35, 2.0, 0.85, 0.09], [0.7, 1.7, 1.0, 0.07]].map((s, k) => <mesh key={k} position={[s[0], s[1], s[2]]} scale={s[3]}><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color={SUCKER} /></mesh>)}
          {[-1, 1].map((sx) => <mesh key={sx} position={[sx * 0.9, 0.25, 1.05]} scale={[0.24, 0.15, 0.08]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={CHEEK} /></mesh>)}
          {[-1, 1].map((sx) => (
            <group key={sx} position={[sx * 0.52, 0.85, 1.05]}>
              <mesh scale={[0.36, 0.46 * Math.max(blink, 0.08), 0.2]}><sphereGeometry args={[1, 24, 20]} /><meshStandardMaterial color="#fff" roughness={0.2} /></mesh>
              <mesh position={[lookX, lookY, 0.17]} scale={[0.2, 0.27 * Math.max(blink, 0.08), 0.08]}><sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color="#14123a" roughness={0.1} /></mesh>
              <mesh position={[lookX + 0.07, lookY + 0.1, 0.25]} scale={0.055}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
              {/* eyebrow */}
              <mesh position={[0, 0.66 + brow, 0.1]} rotation={[0, 0, sx * -0.06]} scale={[0.34, 0.06, 0.06]}><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color={BODY2} /></mesh>
            </group>
          ))}
          {/* open smile: dark half-disc + tongue */}
          <group position={[0, 0.18, 1.2]} scale={[0.7 + 0.35 * happy, 0.7 + 0.5 * happy, 1]}>
            <mesh rotation={[0, 0, Math.PI]} scale={[1, 1, 0.4]}><circleGeometry args={[0.3, 24, 0, Math.PI]} /><meshStandardMaterial color="#3a0a4a" side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, -0.12, 0.01]} scale={[1, 0.6, 1]}><circleGeometry args={[0.13, 16, 0, Math.PI]} /><meshBasicMaterial color="#ff6f8f" /></mesh>
          </group>
          {new Array(8).fill(0).map((_, i) => <Tentacle key={i} i={i} t={t} />)}
        </group>
        <Laptop t={t} />
      </group>
    </ThreeCanvas>
  );
};

export const OctoScene: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(110% 80% at 50% 30%, #1b3a8a 0%, #0b1740 70%)'}}>
    <OctoCharacter />
  </AbsoluteFill>
);
