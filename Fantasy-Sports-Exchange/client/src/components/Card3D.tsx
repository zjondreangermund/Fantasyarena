import { Canvas, useFrame } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import * as THREE from "three"
import { useRef } from "react"

function CardMesh({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const x = (state.mouse.x * Math.PI) / 8
    const y = (state.mouse.y * Math.PI) / 8

    meshRef.current.rotation.y = x
    meshRef.current.rotation.x = -y
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2.2, 3.2, 0.15]} />
      <meshPhysicalMaterial
        color={color}
        metalness={1}
        roughness={0.25}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  )
}

export default function Card3D({ rarity }: { rarity: string }) {
  const rarityColors: Record<string, string> = {
    common: "#1e1e1e",
    rare: "#b30000",
    legendary: "#b8860b",
    unique: "#4b0082"
  }

  return (
    <div style={{ width: 260, height: 380 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <Environment preset="studio" />
        <CardMesh color={rarityColors[rarity] || "#333"} />
      </Canvas>
    </div>
  )
}
