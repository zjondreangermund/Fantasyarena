import { useRef, useState, useMemo, useCallback, Suspense, Component, type ReactNode, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { type PlayerCardWithPlayer, type EplPlayer } from "@shared/schema";
import { Shield } from "lucide-react";

type RarityKey = "common" | "rare" | "unique" | "epic" | "legendary";

const rarityStyles: Record<RarityKey, {
  base: number;
  label: string;
  glow: string;
  accentColor: string;
  labelBg: string;
}> = {
  common: {
    base: 0x8e9aaf, label: "COMMON", glow: "0 8px 32px rgba(120,140,165,0.25)",
    accentColor: "#b8c4d4", labelBg: "rgba(100,120,140,0.85)",
  },
  rare: {
    base: 0xb91c1c, label: "RARE", glow: "0 8px 40px rgba(220,38,38,0.3)",
    accentColor: "#fca5a5", labelBg: "rgba(185,28,28,0.9)",
  },
  unique: {
    base: 0x6d28d9, label: "UNIQUE", glow: "0 8px 40px rgba(124,58,237,0.3)",
    accentColor: "#e9d5ff", labelBg: "linear-gradient(135deg, #6d28d9, #db2777)",
  },
  epic: {
    base: 0x1a1a3e, label: "EPIC", glow: "0 8px 40px rgba(79,70,229,0.2)",
    accentColor: "#a5b4fc", labelBg: "linear-gradient(135deg, #1e1b4b, #312e81)",
  },
  legendary: {
    base: 0xb45309, label: "LEGENDARY", glow: "0 8px 48px rgba(245,158,11,0.35)",
    accentColor: "#fef3c7", labelBg: "linear-gradient(135deg, #92400e, #d97706)",
  },
};

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
}

class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function PlayerImage({ url, hovered }: { url: string; hovered: boolean }) {
  const texture = useLoader(THREE.TextureLoader, url);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, hovered ? 0.04 : 0, 0.1);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, hovered ? 0.03 : 0, 0.1);
    }
  });
  return (
    <mesh ref={ref} position={[0, 0.1, 0.09]}>
      <planeGeometry args={[1.7, 2.0]} />
      <meshStandardMaterial map={texture} transparent opacity={0.88} />
    </mesh>
  );
}

function CardMesh({ rarity, mouse, playerImageUrl, hovered }: {
  rarity: RarityKey;
  mouse: React.RefObject<{ x: number; y: number }>;
  playerImageUrl: string;
  hovered: boolean;
}) {
  const cardRef = useRef<THREE.Group>(null);
  const colors = rarityStyles[rarity];

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 2, h = 3, r = 0.25;
    shape.moveTo(-w / 2 + r, -h / 2); shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.15, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 8,
    });
    geo.center();
    return geo;
  }, []);

  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: colors.base, metalness: 0.9, roughness: 0.3,
  }), [colors.base]);

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.base).multiplyScalar(0.35), metalness: 0.7, roughness: 0.25,
  }), [colors.base]);

  const crystalMat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      vec2 voronoi(vec2 x){
        vec2 p=floor(x),f=fract(x); float res=8.0,id=0.0;
        for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
          vec2 b=vec2(float(i),float(j)),r=b-f+hash(p+b); float d=dot(r,r);
          if(d<res){res=d;id=hash(p+b);}
        } return vec2(sqrt(res),id);
      }
      void main(){
        vec2 v=voronoi(vUv*12.0); float facet=v.y*0.3+0.7; float edge=smoothstep(0.02,0.06,v.x);
        float ef=smoothstep(0.0,0.08,vUv.x)*smoothstep(0.0,0.08,vUv.y)*smoothstep(1.0,0.92,vUv.x)*smoothstep(1.0,0.92,vUv.y);
        vec3 c=vec3(facet*edge)*ef; gl_FragColor=vec4(c,0.22*ef);
      }`,
  }), []);

  const baseTiltX = -5 * (Math.PI / 180);
  useFrame(() => {
    if (cardRef.current && mouse.current) {
      cardRef.current.rotation.y = mouse.current.x * 0.4;
      cardRef.current.rotation.x = baseTiltX + (-mouse.current.y * 0.4);
    }
  });

  return (
    <group ref={cardRef}>
      <mesh geometry={geometry} scale={[1.03, 1.03, 1.03]} material={frameMat} />
      <mesh geometry={geometry} material={baseMat} />
      <Suspense fallback={null}>
        <PlayerImage url={playerImageUrl} hovered={hovered} />
      </Suspense>
      <mesh geometry={geometry} renderOrder={1}>
        <primitive object={crystalMat} attach="material" />
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
  const rating = player.rating ? parseFloat(player.rating) : 0;
  const overall = Math.min(99, Math.round(60 + rating * 3 + goals * 0.5 + assists * 0.3));
  return {
    id: player.id, playerId: player.id, ownerId: null, rarity,
    serialId: null, serialNumber: null,
    maxSupply: rarity === "common" ? 0 : rarity === "rare" ? 100 : rarity === "unique" ? 1 : rarity === "epic" ? 10 : 5,
    level: 1, xp: 0, decisiveScore: 35, last5Scores: [0, 0, 0, 0, 0],
    forSale: false, price: 0, acquiredAt: new Date(),
    player: {
      id: player.id, name: player.name, team: player.team || "Unknown",
      league: "Premier League", position: eplPositionShort(player.position),
      nationality: player.nationality || "Unknown", age: player.age || 0,
      overall, imageUrl: player.photo || "/images/player-1.png",
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
  sorareImageUrl?: string | null;
}

export default function Card3D({
  card, size = "md", selected = false, selectable = false,
  onClick, showPrice = false, sorareImageUrl,
}: Card3DProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const rarity = (card.rarity as RarityKey) || "common";
  const rs = rarityStyles[rarity];

  const sizeMap = { sm: { w: 170, h: 250 }, md: { w: 220, h: 320 }, lg: { w: 270, h: 390 } };
  const s = sizeMap[size];
  const pad = size === "sm" ? "10px 12px 8px" : size === "lg" ? "16px 18px 14px" : "12px 14px 10px";

  const imageIndex = ((card.playerId - 1) % 6) + 1;
  const fallbackImage = card.player?.imageUrl || `/images/player-${imageIndex}.png`;
  const imageUrl = sorareImageUrl || fallbackImage;

  const serialText = card.serialNumber && card.maxSupply
    ? `#${String(card.serialNumber).padStart(3, "0")}/${card.maxSupply}`
    : card.serialId || "";

  const dsColor = (card.decisiveScore || 35) >= 80 ? "#4ade80" : (card.decisiveScore || 35) >= 60 ? "#facc15" : "#94a3b8";

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: 0, y: 0 };
    setHovered(false);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="card-wrapper"
      style={{
        width: s.w, height: s.h,
        perspective: "1000px",
        position: "relative",
        cursor: selectable ? "pointer" : "default",
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={`player-card-${card.id}`}
    >
      {/* card-3d: the ONLY element that gets 3D transforms from Three.js */}
      <div
        className="card-3d"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          borderRadius: 14,
        }}
      >
        {/* metal-surface: Three.js WebGL canvas renders the metallic 3D card */}
        {!webglFailed ? (
          <CanvasErrorBoundary
            fallback={<FallbackCard rarity={rarity} imageUrl={imageUrl} />}
            onError={() => setWebglFailed(true)}
          >
            <Canvas
              camera={{ position: [0, 0, 4.5], fov: 45 }}
              dpr={[1, 1.5]}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                borderRadius: 14, pointerEvents: "none",
              }}
              gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
              onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={3} />
              <directionalLight position={[-3, 2, 4]} intensity={1} />
              <pointLight position={[0, 0, 4]} intensity={0.5} />
              <CardMesh rarity={rarity} mouse={mouseRef} playerImageUrl={imageUrl} hovered={hovered} />
            </Canvas>
          </CanvasErrorBoundary>
        ) : (
          <FallbackCard rarity={rarity} imageUrl={imageUrl} />
        )}

        {/* card-content: engraved on the card surface, inside card-3d */}
        <div
          className="card-content"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: pad,
            zIndex: 10,
            pointerEvents: "none",
            borderRadius: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{
                fontSize: size === "sm" ? 28 : size === "lg" ? 40 : 34,
                fontWeight: 900, color: "#fff",
                textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5)",
                lineHeight: 1, fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
              }}>
                {card.player?.overall || 0}
              </div>
              <div style={{
                fontSize: size === "sm" ? 10 : 12, fontWeight: 800,
                color: rs.accentColor, letterSpacing: "0.15em", marginTop: 2,
                textShadow: "0 1px 4px rgba(0,0,0,0.6)",
              }}>
                {card.player?.position || "N/A"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {serialText && (
                <div style={{
                  fontSize: size === "sm" ? 8 : 10, fontWeight: 700,
                  color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em",
                  textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                }}>
                  {serialText}
                </div>
              )}
              <div style={{
                fontSize: size === "sm" ? 8 : 9, fontWeight: 800,
                color: rs.accentColor, letterSpacing: "0.18em", marginTop: 2,
                background: rs.labelBg, borderRadius: 4, padding: "1px 6px",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}>
                {rs.label}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: size === "sm" ? 13 : size === "lg" ? 18 : 15,
              fontWeight: 900, color: "#fff", letterSpacing: "0.08em",
              textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)",
              textTransform: "uppercase", fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
            }}>
              {(card.player?.name || "Unknown").substring(0, 16)}
            </div>
            <div style={{
              fontSize: size === "sm" ? 9 : size === "lg" ? 12 : 10,
              fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em",
              textTransform: "uppercase", marginTop: 1,
              textShadow: "0 1px 4px rgba(0,0,0,0.7)",
            }}>
              {(card.player?.team || "Unknown").substring(0, 20)}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: size === "sm" ? 10 : 14, marginTop: 3 }}>
              <span style={{
                fontSize: size === "sm" ? 9 : 10, fontWeight: 800, color: "#facc15",
                letterSpacing: "0.05em", textShadow: "0 1px 3px rgba(0,0,0,0.6)",
              }}>
                LV.{card.level || 1}
              </span>
              <span style={{
                fontSize: size === "sm" ? 9 : 10, fontWeight: 800, color: dsColor,
                letterSpacing: "0.05em", textShadow: "0 1px 3px rgba(0,0,0,0.6)",
              }}>
                DS {card.decisiveScore || 35}
              </span>
            </div>
          </div>
        </div>

        {showPrice && card.forSale && (
          <div style={{
            position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", borderRadius: 6,
            padding: "2px 10px", zIndex: 20, pointerEvents: "none",
          }}>
            <span style={{
              color: "#4ade80", fontSize: 14, fontWeight: 900,
              fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
            }}>
              N${card.price?.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {selected && (
        <div style={{
          position: "absolute", top: -4, right: -4, zIndex: 30,
          width: 20, height: 20, background: "hsl(250,85%,65%)", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield style={{ width: 12, height: 12, color: "#fff" }} />
        </div>
      )}
    </div>
  );
}

function FallbackCard({ rarity, imageUrl }: { rarity: RarityKey; imageUrl: string }) {
  const baseColors: Record<RarityKey, string> = {
    common: "linear-gradient(145deg, #5a6577, #8e9aaf 50%, #5a6577)",
    rare: "linear-gradient(145deg, #7f1d1d, #dc2626 50%, #7f1d1d)",
    unique: "linear-gradient(145deg, #4c1d95, #a855f7 50%, #4c1d95)",
    epic: "linear-gradient(145deg, #0f0f2e, #312e81 50%, #0f0f2e)",
    legendary: "linear-gradient(145deg, #78350f, #d97706 50%, #78350f)",
  };
  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: 14,
      background: baseColors[rarity], overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "8%", left: "10%", width: "80%", height: "60%",
        backgroundImage: `url(${imageUrl})`, backgroundSize: "contain",
        backgroundPosition: "center", backgroundRepeat: "no-repeat", opacity: 0.85,
      }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: 14,
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)",
      }} />
    </div>
  );
}
