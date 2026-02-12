import { Text, useTexture } from "@react-three/drei";
import { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type PlayerCardWithPlayer, type EplPlayer } from "@shared/schema";
import { Zap, Shield } from "lucide-react";

type RarityKey = "common" | "rare" | "unique" | "epic" | "legendary";

const rarityColors: Record<RarityKey, {
  base: number;
  accent: string;
  label: string;
  labelBg: string;
  glow: string;
  textAccent: string;
}> = {
  common: {
    base: 0x8e9aaf,
    accent: "#b8c4d4",
    label: "COMMON",
    labelBg: "rgba(100,120,140,0.9)",
    glow: "rgba(120,140,165,0.3)",
    textAccent: "#cbd5e1",
  },
  rare: {
    base: 0xb91c1c,
    accent: "#dc2626",
    label: "RARE",
    labelBg: "rgba(185,28,28,0.95)",
    glow: "rgba(220,38,38,0.35)",
    textAccent: "#fca5a5",
  },
  unique: {
    base: 0x6d28d9,
    accent: "#a855f7",
    label: "UNIQUE",
    labelBg: "linear-gradient(135deg, #6d28d9, #db2777)",
    glow: "rgba(124,58,237,0.35)",
    textAccent: "#e9d5ff",
  },
  epic: {
    base: 0x1a1a3e,
    accent: "#6366f1",
    label: "EPIC",
    labelBg: "linear-gradient(135deg, #1e1b4b, #312e81)",
    glow: "rgba(79,70,229,0.25)",
    textAccent: "#a5b4fc",
  },
  legendary: {
    base: 0xb45309,
    accent: "#d97706",
    label: "LEGENDARY",
    labelBg: "linear-gradient(135deg, #92400e, #d97706)",
    glow: "rgba(245,158,11,0.4)",
    textAccent: "#fef3c7",
  },
};

function ScoreBar({ scores }: { scores: number[] }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 18 }}>
      {scores.map((score, i) => (
        <div
          key={i}
          style={{
            width: 5,
            borderRadius: 2,
            height: `${Math.max(15, (score / 100) * 100)}%`,
            backgroundColor:
              score >= 70 ? "hsl(150,60%,45%)" : score >= 40 ? "hsl(45,93%,47%)" : "hsl(0,72%,51%)",
            opacity: 0.6 + (i / scores.length) * 0.4,
          }}
        />
      ))}
    </div>
  );
}

function CardMesh({ rarity, mouse, playerImageUrl, rating, hovered }: { rarity: RarityKey; mouse: React.RefObject<{x: number; y: number}>; playerImageUrl: string; rating: number; hovered: boolean }) {
  const cardRef = useRef<THREE.Group>(null);
  const imageRef = useRef<THREE.Mesh>(null);

  const colors = rarityColors[rarity];
  const playerTexture = useTexture(playerImageUrl);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = 2;
    const height = 3;
    const radius = 0.25;

    shape.moveTo(-width / 2 + radius, -height / 2);
    shape.lineTo(width / 2 - radius, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
    shape.lineTo(width / 2, height / 2 - radius);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
    shape.lineTo(-width / 2 + radius, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 8,
    });
    geo.center();
    return geo;
  }, []);

  const baseMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: colors.base,
      metalness: 0.9,
      roughness: 0.3,
    });
  }, [colors.base]);

  const crystalMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        vec2 voronoi(vec2 x) {
          vec2 p = floor(x);
          vec2 f = fract(x);
          float res = 8.0;
          float id = 0.0;
          for(int j = -1; j <= 1; j++) {
            for(int i = -1; i <= 1; i++) {
              vec2 b = vec2(float(i), float(j));
              vec2 r = b - f + hash(p + b);
              float d = dot(r, r);
              if(d < res) {
                res = d;
                id = hash(p + b);
              }
            }
          }
          return vec2(sqrt(res), id);
        }

        void main(){
          vec2 v = voronoi(vUv * 12.0);
          float facet = v.y * 0.3 + 0.7;
          float edge = smoothstep(0.02, 0.06, v.x);
          float edgeFade = smoothstep(0.0, 0.08, vUv.x) *
                           smoothstep(0.0, 0.08, vUv.y) *
                           smoothstep(1.0, 0.92, vUv.x) *
                           smoothstep(1.0, 0.92, vUv.y);
          vec3 color = vec3(facet * edge);
          color *= edgeFade;
          gl_FragColor = vec4(color, 0.22 * edgeFade);
        }
      `,
    });
  }, []);

  const baseTiltX = -5 * (Math.PI / 180);

  useFrame(() => {
    if (cardRef.current && mouse.current) {
      cardRef.current.rotation.y = mouse.current.x * 0.4;
      cardRef.current.rotation.x = baseTiltX + (-mouse.current.y * 0.4);
    }

    if (imageRef.current) {
      imageRef.current.position.x = THREE.MathUtils.lerp(
        imageRef.current.position.x,
        hovered ? 0.03 : 0,
        0.1
      );
      imageRef.current.position.y = THREE.MathUtils.lerp(
        imageRef.current.position.y,
        hovered ? 0.02 : 0,
        0.1
      );
    }
  });

  return (
    <group ref={cardRef}>
      <mesh geometry={geometry} scale={[1.02, 1.02, 1.02]}>
        <meshStandardMaterial color={new THREE.Color(colors.base).multiplyScalar(0.4)} metalness={0.6} roughness={0.3} />
      </mesh>

      <mesh geometry={geometry} material={baseMaterial} />

      <mesh ref={imageRef} position={[0, 0, 0.08]}>
        <planeGeometry args={[1.8, 2.6]} />
        <meshStandardMaterial map={playerTexture} transparent />
      </mesh>

      <Text
        position={[-0.75, 1.2, 0.09]}
        fontSize={0.35}
        anchorX="left"
        anchorY="middle"
      >
        <meshPhysicalMaterial
          metalness={1}
          roughness={0.25}
          color="#cccccc"
        />
        {rating.toString()}
      </Text>

      <mesh geometry={geometry} renderOrder={1}>
        <primitive object={crystalMaterial} attach="material" />
      </mesh>
    </group>
  );
}

function eplAssignRarity(player: EplPlayer): RarityKey {
  const rating = player.rating ? parseFloat(player.rating) : 0;
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const apps = player.appearances ?? 0;
  if (rating >= 7.5 || goals >= 15) return "legendary";
  if (rating >= 7.2 || goals >= 10 || (goals + assists) >= 15) return "epic";
  if (rating >= 7.0 || goals >= 5 || assists >= 8) return "unique";
  if (rating >= 6.8 || apps >= 15 || (goals + assists) >= 5) return "rare";
  return "common";
}

function eplPositionShort(pos: string | null): string {
  if (!pos) return "N/A";
  const map: Record<string, string> = { Goalkeeper: "GK", Defender: "DEF", Midfielder: "MID", Attacker: "FWD" };
  return map[pos] || pos.substring(0, 3).toUpperCase();
}

export function eplPlayerToCard(player: EplPlayer): PlayerCardWithPlayer {
  const rarity = eplAssignRarity(player);
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const apps = player.appearances ?? 0;
  const rating = player.rating ? parseFloat(player.rating) : 0;
  const overall = Math.min(99, Math.round(60 + rating * 3 + goals * 0.5 + assists * 0.3));
  return {
    id: player.id,
    playerId: player.id,
    ownerId: null,
    rarity,
    serialId: null,
    serialNumber: null,
    maxSupply: rarity === "common" ? 0 : rarity === "rare" ? 100 : rarity === "unique" ? 1 : rarity === "epic" ? 10 : 5,
    level: 1,
    xp: 0,
    decisiveScore: 35,
    last5Scores: [0, 0, 0, 0, 0],
    forSale: false,
    price: 0,
    acquiredAt: new Date(),
    player: {
      id: player.id,
      name: player.name,
      team: player.team || "Unknown",
      league: "Premier League",
      position: eplPositionShort(player.position),
      nationality: player.nationality || "Unknown",
      age: player.age || 0,
      overall,
      imageUrl: player.photo || "/images/player-1.png",
    },
  } as PlayerCardWithPlayer;
}

interface Card3DProps {
  card: PlayerCardWithPlayer;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  showPrice?: boolean;
}

export default function Card3D({
  card,
  size = "md",
  selected = false,
  selectable = false,
  onClick,
  showPrice = false,
}: Card3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const rarity = (card.rarity as RarityKey) || "common";
  const colors = rarityColors[rarity];

  const sizeMap = {
    sm: { w: 170, h: 250, fontSize: 0.75 },
    md: { w: 220, h: 320, fontSize: 0.9 },
    lg: { w: 270, h: 390, fontSize: 1.1 },
  };
  const s = sizeMap[size];

  const imageIndex = ((card.playerId - 1) % 6) + 1;
  const imageUrl = card.player?.imageUrl || `/images/player-${imageIndex}.png`;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current = { x, y };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: 0, y: 0 };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: s.w,
        height: s.h,
        position: "relative",
        cursor: selectable ? "pointer" : "default",
        ...(selected ? {
          outline: "3px solid hsl(250,85%,65%)",
          outlineOffset: "3px",
          borderRadius: 14,
        } : {}),
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={(e) => { handleMouseLeave(); setHovered(false); }}
      data-testid={`player-card-${card.id}`}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 14,
          pointerEvents: "none",
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={3} />
        <directionalLight position={[-3, 2, 4]} intensity={1} />
        <pointLight position={[0, 0, 4]} intensity={0.5} />
        <CardMesh rarity={rarity} mouse={mouseRef} playerImageUrl={imageUrl} rating={card.player?.overall || 0} hovered={hovered} />
      </Canvas>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{
          padding: `${8 * s.fontSize}px ${10 * s.fontSize}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          zIndex: 2,
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}>
            <span style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 28 * s.fontSize,
              lineHeight: 1,
              textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.15)",
              fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
            }}>
              {card.player?.overall || 0}
            </span>
            <span style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              color: colors.textAccent,
              fontWeight: 800,
              fontSize: 8 * s.fontSize,
              letterSpacing: "0.12em",
              padding: `2px ${5 * s.fontSize}px`,
              borderRadius: 3,
            }}>
              {card.player?.position || "N/A"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            {card.serialNumber && card.maxSupply ? (
              <span style={{
                color: "rgba(255,255,255,0.35)",
                fontWeight: 900,
                fontSize: 7 * s.fontSize,
                fontFamily: "'Inter',monospace",
                letterSpacing: "0.05em",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              }}>
                #{String(card.serialNumber).padStart(3, "0")}/{card.maxSupply}
              </span>
            ) : card.serialId ? (
              <span style={{
                color: "rgba(255,255,255,0.3)",
                fontWeight: 800,
                fontSize: 6 * s.fontSize,
                fontFamily: "'Inter',monospace",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              }}>
                {card.serialId}
              </span>
            ) : null}

            <div style={{
              width: 22 * s.fontSize,
              height: 22 * s.fontSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              borderRadius: "50%",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08)",
            }}>
              <span style={{
                color: "rgba(255,255,255,0.7)",
                fontWeight: 900,
                fontSize: 11 * s.fontSize,
                fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
              }}>
                {card.player?.team?.charAt(0) || "?"}
              </span>
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute",
          top: 32 * s.fontSize,
          left: 10 * s.fontSize,
          zIndex: 2,
        }}>
          <span style={{
            background: colors.labelBg,
            color: colors.textAccent,
            fontWeight: 900,
            fontSize: 7 * s.fontSize,
            letterSpacing: "0.12em",
            padding: `2px ${5 * s.fontSize}px`,
            borderRadius: 3,
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}>
            {colors.label}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{
          position: "relative",
          width: "55%",
          aspectRatio: "4/5",
          margin: "-10% auto 0",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: `
            inset 0 0 15px rgba(0,0,0,0.6),
            inset 0 4px 15px rgba(0,0,0,0.5),
            0 6px 20px rgba(0,0,0,0.5)
          `,
          zIndex: 1,
        }}>
          <img
            src={imageUrl}
            alt={card.player?.name || "Player"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              filter: "contrast(1.08) saturate(1.12) drop-shadow(0 8px 16px rgba(0,0,0,0.6))",
            }}
          />
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
            pointerEvents: "none",
          }} />
        </div>

        <div style={{
          background: "linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.5) 85%, transparent 100%)",
          padding: `${10 * s.fontSize}px ${10 * s.fontSize}px ${8 * s.fontSize}px`,
          zIndex: 2,
          marginTop: "-8%",
          paddingTop: `${18 * s.fontSize}px`,
        }}>
          <h3 style={{
            color: "#fff",
            fontWeight: 900,
            fontSize: 15 * s.fontSize,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            lineHeight: 1.05,
            fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.4)",
            marginBottom: 2,
          }}>
            {card.player?.name || "Unknown"}
          </h3>
          <p style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 7.5 * s.fontSize,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontFamily: "'Inter',system-ui,sans-serif",
            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
            marginBottom: 4,
          }}>
            {card.player?.team} &middot; {card.player?.nationality}
          </p>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4 * s.fontSize,
            paddingTop: 4 * s.fontSize,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              borderRadius: 4,
              padding: `${2 * s.fontSize}px ${4 * s.fontSize}px`,
            }}>
              <Zap style={{ width: 10 * s.fontSize, height: 10 * s.fontSize, color: "#facc15" }} />
              <span style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 8.5 * s.fontSize,
                fontWeight: 800,
                fontFamily: "'Inter',system-ui,sans-serif",
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
              }}>
                Lv.{card.level}
              </span>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              borderRadius: 4,
              padding: `${2 * s.fontSize}px ${4 * s.fontSize}px`,
            }}>
              <span style={{
                color: card.decisiveScore && card.decisiveScore >= 80 ? "#4ade80" : card.decisiveScore && card.decisiveScore >= 60 ? "#facc15" : "rgba(255,255,255,0.7)",
                fontSize: 8.5 * s.fontSize,
                fontWeight: 900,
                fontFamily: "'Inter',monospace",
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
              }}>
                {card.decisiveScore || 35}
              </span>
            </div>

            <ScoreBar scores={card.last5Scores as number[]} />
          </div>

          {showPrice && card.forSale && (
            <div style={{ marginTop: 4, textAlign: "center" }}>
              <span style={{
                color: "#4ade80",
                fontSize: 11 * s.fontSize,
                fontWeight: 900,
                fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
                textShadow: "0 0 8px rgba(74,222,128,0.3), 1px 1px 2px rgba(0,0,0,0.8)",
              }}>
                N${card.price?.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div style={{
          position: "absolute",
          top: -4,
          right: -4,
          zIndex: 30,
          width: 20,
          height: 20,
          background: "hsl(250,85%,65%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Shield style={{ width: 12, height: 12, color: "#fff" }} />
        </div>
      )}
    </div>
  );
}
