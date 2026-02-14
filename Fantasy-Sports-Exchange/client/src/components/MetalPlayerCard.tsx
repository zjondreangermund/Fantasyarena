import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, PerspectiveCamera, ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";
import { type PlayerCardWithPlayer } from "../../../shared/schema";

// Rarity color configurations
const RARITY_COLORS = {
  common: {
    primary: '#C0C0C0',      // Silver
    metalness: 0.95,
    roughness: 0.2,
    emissive: '#888888',
    emissiveIntensity: 0.2,
  },
  rare: {
    primary: '#DC143C',       // Crimson Red
    metalness: 0.9,
    roughness: 0.25,
    emissive: '#8B0000',
    emissiveIntensity: 0.3,
  },
  unique: {
    primary: '#FF00FF',       // Rainbow base (will be animated)
    metalness: 0.85,
    roughness: 0.3,
    emissive: '#FF00FF',
    emissiveIntensity: 0.4,
    rainbow: true,
  },
  epic: {
    primary: '#1a1a1a',       // Black with subtle shine
    metalness: 1.0,
    roughness: 0.15,
    emissive: '#2a2a2a',
    emissiveIntensity: 0.5,
  },
  legendary: {
    primary: '#FFD700',       // Gold
    metalness: 1.0,
    roughness: 0.1,
    emissive: '#FFA500',
    emissiveIntensity: 0.6,
  },
};

// Rainbow shader for Unique cards
const RainbowMaterial = () => {
  const materialRef = useRef<any>();
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const shaderData = React.useMemo(() => ({
    uniforms: { 
      time: { value: 0 },
      metalness: { value: 0.85 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float time;
      uniform float metalness;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        // Create rainbow effect
        float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
        float rainbow = fract(angle / 6.28318 + time * 0.2);
        
        vec3 color1 = vec3(1.0, 0.0, 0.0); // Red
        vec3 color2 = vec3(1.0, 0.5, 0.0); // Orange
        vec3 color3 = vec3(1.0, 1.0, 0.0); // Yellow
        vec3 color4 = vec3(0.0, 1.0, 0.0); // Green
        vec3 color5 = vec3(0.0, 0.5, 1.0); // Blue
        vec3 color6 = vec3(0.5, 0.0, 1.0); // Purple
        
        vec3 finalColor;
        if (rainbow < 0.166) {
          finalColor = mix(color1, color2, rainbow / 0.166);
        } else if (rainbow < 0.333) {
          finalColor = mix(color2, color3, (rainbow - 0.166) / 0.166);
        } else if (rainbow < 0.5) {
          finalColor = mix(color3, color4, (rainbow - 0.333) / 0.166);
        } else if (rainbow < 0.666) {
          finalColor = mix(color4, color5, (rainbow - 0.5) / 0.166);
        } else if (rainbow < 0.833) {
          finalColor = mix(color5, color6, (rainbow - 0.666) / 0.166);
        } else {
          finalColor = mix(color6, color1, (rainbow - 0.833) / 0.166);
        }
        
        // Add metallic shine
        float shine = pow(max(0.0, vNormal.z), 3.0);
        finalColor = finalColor * 0.7 + shine * 0.3;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }`
  }), []);

  return <shaderMaterial ref={materialRef} args={[shaderData]} />;
};

const DEFAULT_OVERALL_RATING = 85;

// Card mesh component
function CardMesh({ card, hovered }: { card: PlayerCardWithPlayer; hovered: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Animate on hover
  useFrame(() => {
    if (meshRef.current) {
      const targetRotation = hovered ? 0.15 : 0;
      meshRef.current.rotation.y += (targetRotation - meshRef.current.rotation.y) * 0.1;
    }
  });

  // Create card shape
  const cardShape = React.useMemo(() => {
    const shape = new THREE.Shape();
    const w = 2.2, h = 3.2, r = 0.15;
    shape.moveTo(-w/2 + r, -h/2);
    shape.lineTo(w/2 - r, -h/2);
    shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
    shape.lineTo(w/2, h/2 - r);
    shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
    shape.lineTo(-w/2 + r, h/2);
    shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
    shape.lineTo(-w/2, -h/2 + r);
    shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
    return shape;
  }, []);

  const rarityConfig = RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common;
  
  // Calculate stats with multiplier
  const statMultiplier = card.statMultiplier || 1.0;
  const baseStats = {
    PAC: Math.round(75 * statMultiplier),
    SHO: Math.round(70 * statMultiplier),
    PAS: Math.round(72 * statMultiplier),
    DEF: Math.round(68 * statMultiplier),
    PHY: Math.round(78 * statMultiplier),
    DRI: Math.round(73 * statMultiplier),
  };

  return (
    <group ref={meshRef} rotation={[0, 0, -0.087]}>  {/* -5 degrees = -0.087 radians */}
      {/* Main card body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <extrudeGeometry args={[cardShape, { 
          depth: 0.08, 
          bevelEnabled: true, 
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelSegments: 5,
        }]} />
        {rarityConfig.rainbow ? (
          <RainbowMaterial />
        ) : (
          <meshPhysicalMaterial 
            color={rarityConfig.primary}
            metalness={rarityConfig.metalness}
            roughness={rarityConfig.roughness}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={rarityConfig.emissive}
            emissiveIntensity={rarityConfig.emissiveIntensity}
          />
        )}
      </mesh>

      {/* Engraved text - Player name */}
      <Text
        position={[0, 1.2, 0.05]}
        fontSize={0.25}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        outlineWidth={0.01}
        outlineColor="#ffffff"
      >
        {card.player.name.toUpperCase()}
      </Text>

      {/* Position badge */}
      <Text
        position={[0, 0.85, 0.05]}
        fontSize={0.18}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fontWeight={600}
      >
        {card.player.position}
      </Text>

      {/* Stats - Left column */}
      <Text
        position={[-0.7, 0.3, 0.05]}
        fontSize={0.14}
        color="#000000"
        anchorX="left"
        anchorY="top"
        fontWeight={500}
      >
        {`PAC ${baseStats.PAC}\nSHO ${baseStats.SHO}\nPAS ${baseStats.PAS}`}
      </Text>

      {/* Stats - Right column */}
      <Text
        position={[0.3, 0.3, 0.05]}
        fontSize={0.14}
        color="#000000"
        anchorX="left"
        anchorY="top"
        fontWeight={500}
      >
        {`DEF ${baseStats.DEF}\nPHY ${baseStats.PHY}\nDRI ${baseStats.DRI}`}
      </Text>

      {/* Rarity badge */}
      <Text
        position={[0, -1.2, 0.05]}
        fontSize={0.16}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
      >
        {card.rarity.toUpperCase()}
      </Text>

      {/* Overall rating */}
      <mesh position={[0, -0.4, 0.05]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
      <Text
        position={[0, -0.4, 0.06]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight={900}
      >
        {card.player.overall || DEFAULT_OVERALL_RATING}
      </Text>

      {/* Level indicator */}
      {card.level > 1 && (
        <Text
          position={[-0.9, 1.3, 0.05]}
          fontSize={0.12}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          LVL {card.level}
        </Text>
      )}

      {/* Serial number */}
      {card.serialId && (
        <Text
          position={[0, -1.5, 0.05]}
          fontSize={0.1}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          fontWeight={400}
        >
          {card.serialId}
        </Text>
      )}
    </group>
  );
}

export default function MetalPlayerCard({ card }: { card: PlayerCardWithPlayer }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className="w-full h-full min-h-[400px] cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas shadows camera={{ position: [0, 0, 6], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        
        {/* Lighting setup for metallic effect */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#ffffff" />
        <spotLight 
          position={[0, 5, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.8}
          castShadow
        />
        
        {/* Environment for reflections */}
        <Environment preset="city" />

        <Float 
          speed={1.5} 
          rotationIntensity={0.2} 
          floatIntensity={0.3}
          enabled={!hovered}
        >
          <CardMesh card={card} hovered={hovered} />
        </Float>
        
        {/* Contact shadows for depth */}
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.6} 
          scale={8} 
          blur={2} 
          far={4}
          color="#000000"
        />
      </Canvas>
    </div>
  );
}
