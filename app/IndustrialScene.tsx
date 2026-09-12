"use client";

import { ContactShadows, Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Cable({ offset, color }: { offset: number; color: string }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.8, 1.5 + offset, -1.6),
        new THREE.Vector3(-1.2, 0.3 + offset, -0.2),
        new THREE.Vector3(0.4, 1.45 + offset, 0.2),
        new THREE.Vector3(2.8, 0.25 + offset, -1.3),
      ]),
    [offset],
  );

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.024, 8, false]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.24} />
    </mesh>
  );
}

function WarehouseFrame() {
  return (
    <group position={[0, 0.3, -1.65]}>
      {[-2.5, -1.25, 0, 1.25, 2.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.1, 3.7, 0.12]} />
            <meshStandardMaterial color="#263244" metalness={0.86} roughness={0.32} />
          </mesh>
          <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.1, 1.55, 0.12]} />
            <meshStandardMaterial color="#263244" metalness={0.86} roughness={0.32} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -1.28, 0]}>
        <boxGeometry args={[6.8, 0.08, 0.16]} />
        <meshStandardMaterial color="#182230" metalness={0.75} roughness={0.38} />
      </mesh>
    </group>
  );
}

function ProductAssembly() {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const time = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = time * 0.2 + pointer.x * 0.28;
      group.current.rotation.x = -0.14 + pointer.y * 0.1;
      group.current.position.y = Math.sin(time * 0.9) * 0.09;
    }
    if (halo.current) {
      halo.current.rotation.z = -time * 0.42;
      halo.current.scale.setScalar(1 + Math.sin(time * 1.4) * 0.04);
    }
  });

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      <mesh ref={halo} position={[0, 0.16, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.34, 0.025, 12, 96]} />
        <meshBasicMaterial color="#78d9ff" transparent opacity={0.78} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[0.22, 0.13, -0.2]}>
        <boxGeometry args={[2.62, 0.28, 0.28]} />
        <meshStandardMaterial color="#5d738a" metalness={0.93} roughness={0.2} />
      </mesh>
      <mesh position={[0.08, 0.56, -0.12]} rotation={[0.22, 0.13, -0.2]}>
        <boxGeometry args={[2.13, 0.16, 0.16]} />
        <meshStandardMaterial color="#1d2a3c" metalness={0.92} roughness={0.18} />
      </mesh>
      <mesh position={[-0.9, -0.48, 0.1]} rotation={[0.22, 0.13, -0.2]}>
        <boxGeometry args={[0.2, 1.34, 0.2]} />
        <meshStandardMaterial color="#f17f32" emissive="#6c2100" emissiveIntensity={0.7} metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0.88, -0.48, 0.1]} rotation={[0.22, 0.13, -0.2]}>
        <boxGeometry args={[0.2, 1.34, 0.2]} />
        <meshStandardMaterial color="#4bd2e9" emissive="#003c57" emissiveIntensity={0.8} metalness={0.62} roughness={0.22} />
      </mesh>
      {[-0.96, -0.36, 0.36, 0.96].map((x) => (
        <mesh key={x} position={[x, 0.25, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.125, 0.03, 12, 28]} />
          <meshStandardMaterial color="#c8d4dd" metalness={1} roughness={0.18} />
        </mesh>
      ))}
      <lineSegments position={[0, 0.03, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.95, 1.72, 1.7)]} />
        <lineBasicMaterial color="#66dcf2" transparent opacity={0.32} />
      </lineSegments>
    </group>
  );
}

function MovingSpotlight() {
  const light = useRef<THREE.SpotLight>(null);
  useFrame(({ clock }) => {
    if (!light.current) return;
    const time = clock.getElapsedTime();
    light.current.position.x = Math.sin(time * 0.42) * 3.4;
    light.current.position.z = 2.1 + Math.cos(time * 0.38) * 0.85;
  });
  return <spotLight ref={light} position={[3, 4.5, 2.2]} intensity={28} angle={0.42} penumbra={0.86} color="#a4eaff" castShadow />;
}

function IndustrialWorld() {
  return (
    <>
      <fog attach="fog" args={["#07101b", 4.8, 10]} />
      <ambientLight intensity={0.55} color="#7fa0bc" />
      <directionalLight position={[-4, 4, 3]} intensity={2.2} color="#f7af79" />
      <pointLight position={[-2.8, 0.8, 2]} intensity={10} distance={6} color="#2cd7f4" />
      <MovingSpotlight />
      <WarehouseFrame />
      <Cable offset={0.2} color="#1b354d" />
      <Cable offset={-0.4} color="#344c63" />
      <Float speed={1.3} rotationIntensity={0.1} floatIntensity={0.22}>
        <ProductAssembly />
      </Float>
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#101d2b" metalness={0.75} roughness={0.34} />
      </mesh>
      <ContactShadows position={[0, -1.07, 0]} opacity={0.72} scale={8} blur={2.8} far={4.2} color="#00050a" />
      <Sparkles count={95} scale={[6, 3.6, 5]} size={1.6} speed={0.22} opacity={0.56} color="#b8eaff" />
    </>
  );
}

export default function IndustrialScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 5.2], fov: 42 }}
      dpr={[1, 1.7]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      shadows
    >
      <IndustrialWorld />
    </Canvas>
  );
}
