import { useRef, useState, useMemo, useCallback, Suspense, Component, type ReactNode, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { type PlayerCardWithPlayer, type EplPlayer } from "@shared/schema";
import { Shield } from "lucide-react";

type RarityKey = "common" | "rare" | "unique" | "epic" | "legendary";

const rarityStyles: Record<RarityKey, {
  gradient: string;
  base: number;
  label: string;
  glow: string;
  textColor: string;
  accentColor: string;
  labelBg: string;
}> = {
  common: {
    gradient: "linear-gradient(145deg, #5a6577 0%, #8e9aaf 30%, #a8b5c4 50%, #8e9aaf 70%, #5a6577 100%)",
    base: 0x8e9aaf, label: "COMMON", glow: "0 10px 40px rgba(120,140,165,0.3)",
    textColor: "#cbd5e1", accentColor: "#b8c4d4", labelBg: "rgba(100,120,140,0.85)",
  },
  rare: {
    gradient: "linear-gradient(145deg, #7f1d1d 0%, #b91c1c 30%, #dc2626 50%, #b91c1c 70%, #7f1d1d 100%)",
    base: 0xb91c1c, label: "RARE", glow: "0 10px 50px rgba(220,38,38,0.35)",
    textColor: "#fca5a5", accentColor: "#fca5a5", labelBg: "rgba(185,28,28,0.9)",
  },
  unique: {
    gradient: "linear-gradient(145deg, #4c1d95 0%, #6d28d9 30%, #a855f7 50%, #6d28d9 70%, #4c1d95 100%)",
    base: 0x6d28d9, label: "UNIQUE", glow: "0 10px 50px rgba(124,58,237,0.35)",
    textColor: "#e9d5ff", accentColor: "#e9d5ff", labelBg: "linear-gradient(135deg, #6d28d9, #db2777)",
  },
  epic: {
    gradient: "linear-gradient(145deg, #0f0f2e 0%, #1a1a3e 30%, #312e81 50%, #1a1a3e 70%, #0f0f2e 100%)",
    base: 0x1a1a3e, label: "EPIC", glow: "0 10px 50px rgba(79,70,229,0.25)",
    textColor: "#a5b4fc", accentColor: "#a5b4fc", labelBg: "linear-gradient(135deg, #1e1b4b, #312e81)",
  },
  legendary: {
    gradient: "linear-gradient(145deg, #78350f 0%, #b45309 30%, #d97706 50%, #f59e0b 60%, #b45309 80%, #78350f 100%)",
    base: 0xb45309, label: "LEGENDARY", glow: "0 10px 60px rgba(245,158,11,0.4)",
    textColor: "#fef3c7", accentColor: "#fef3c7", labelBg: "linear-gradient(135deg, #92400e, #d97706)",
  },
};

const voronoiSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" opacity="0.18"><defs><filter id="v"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="400" height="600" filter="url(#v)"/></svg>`;
const voronoiBg = `url("data:image/svg+xml,${encodeURIComponent(voronoiSvg)}")`;

let activeCardId: number | null = null;
let deactivateActiveCard: (() => void) | null = null;

function requestWebglActivation(cardId: number, activate: () => void, deactivate: () => void): boolean {
  if (activeCardId !== null && activeCardId !== cardId && deactivateActiveCard) {
    deactivateActiveCard();
  }
  activeCardId = cardId;
  deactivateActiveCard = deactivate;
  activate();
  return true;
}

function releaseWebgl(cardId: number) {
  if (activeCardId === cardId) {
    activeCardId = null;
    deactivateActiveCard = null;
  }
}

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
}

class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, {hasError: boolean}> {
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

function CardBody({ rarity, mouse, playerImageUrl, hovered }: {
  rarity: RarityKey; mouse: React.RefObject<{x: number; y: number}>;
  playerImageUrl: string; hovered: boolean;
}) {
  const cardRef = useRef<THREE.Group>(null);
  const colors = rarityStyles[rarity];

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 2, h = 3, r = 0.25;
    shape.moveTo(-w/2+r, -h/2); shape.lineTo(w/2-r, -h/2);
    shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2+r); shape.lineTo(w/2, h/2-r);
    shape.quadraticCurveTo(w/2, h/2, w/2-r, h/2); shape.lineTo(-w/2+r, h/2);
    shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2-r); shape.lineTo(-w/2, -h/2+r);
    shape.quadraticCurveTo(-w/2, -h/2, -w/2+r, -h/2);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.15, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 8,
    });
    geo.center();
    return geo;
  }, []);

  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.base, metalness: 0.9, roughness: 0.3 }), [colors.base]);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(colors.base).multiplyScalar(0.35), metalness: 0.7, roughness: 0.25 }), [colors.base]);

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [webglActive, setWebglActive] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rarity = (card.rarity as RarityKey) || "common";
  const style = rarityStyles[rarity];

  const sizeMap = { sm: { w: 170, h: 250 }, md: { w: 220, h: 320 }, lg: { w: 270, h: 390 } };
  const s = sizeMap[size];

  const imageIndex = ((card.playerId - 1) % 6) + 1;
  const fallbackImage = card.player?.imageUrl || `/images/player-${imageIndex}.png`;
  const imageUrl = sorareImageUrl || fallbackImage;

  const serialText = card.serialNumber && card.maxSupply
    ? `#${String(card.serialNumber).padStart(3, "0")}/${card.maxSupply}`
    : card.serialId || "";

  const dsColor = (card.decisiveScore || 35) >= 80 ? "#4ade80" : (card.decisiveScore || 35) >= 60 ? "#facc15" : "#94a3b8";

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const [webglFailed, setWebglFailed] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    if (webglFailed) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      requestWebglActivation(
        card.id,
        () => setWebglActive(true),
        () => setWebglActive(false),
      );
    }, 150);
  }, [card.id, webglFailed]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: 0, y: 0 };
    setHovered(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setWebglActive(false);
      releaseWebgl(card.id);
    }, 300);
  }, [card.id]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      releaseWebgl(card.id);
    };
  }, [card.id]);

  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [imgOffX, setImgOffX] = useState(0);
  const [imgOffY, setImgOffY] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (webglActive) return;
    let running = true;
    const animate = () => {
      if (!running) return;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      setRotY(prev => prev + (mx * 15 - prev) * 0.15);
      setRotX(prev => prev + (my * -10 - 5 - prev) * 0.15);
      setImgOffX(prev => prev + ((hovered ? mx * 4 : 0) - prev) * 0.1);
      setImgOffY(prev => prev + ((hovered ? my * -3 : 0) - prev) * 0.1);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [hovered, webglActive]);

  const textOverlay = (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: size === "sm" ? "10px 12px 8px" : size === "lg" ? "16px 18px 14px" : "12px 14px 10px",
      zIndex: 10,
    }}>
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
            color: style.accentColor, letterSpacing: "0.15em", marginTop: 2,
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
            color: style.accentColor, letterSpacing: "0.18em", marginTop: 2,
            background: style.labelBg, borderRadius: 4, padding: "1px 6px",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}>
            {style.label}
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
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: s.w, height: s.h, position: "relative",
        cursor: selectable ? "pointer" : "default",
        perspective: "800px",
        ...(selected ? { outline: "3px solid hsl(250,85%,65%)", outlineOffset: "3px", borderRadius: 14 } : {}),
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={`player-card-${card.id}`}
    >
      {webglActive ? (
        <CanvasErrorBoundary
          fallback={<div style={{ width: "100%", height: "100%", borderRadius: 14, background: style.gradient }} />}
          onError={() => { setWebglActive(false); setWebglFailed(true); releaseWebgl(card.id); }}
        >
          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 45 }}
            dpr={[1, 1.5]}
            style={{ width: "100%", height: "100%", borderRadius: 14, pointerEvents: "none" }}
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={3} />
            <directionalLight position={[-3, 2, 4]} intensity={1} />
            <pointLight position={[0, 0, 4]} intensity={0.5} />
            <CardBody rarity={rarity} mouse={mouseRef} playerImageUrl={imageUrl} hovered={hovered} />
          </Canvas>
        </CanvasErrorBoundary>
      ) : (
        <div style={{
          width: "100%", height: "100%", borderRadius: 14,
          background: style.gradient, overflow: "hidden",
          boxShadow: `${style.glow}, inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3)`,
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: "preserve-3d",
          transition: hovered ? "none" : "transform 0.4s ease-out",
        }}>
          <div style={{
            position: "absolute", inset: 3, borderRadius: 11,
            border: "1px solid rgba(255,255,255,0.08)",
            pointerEvents: "none", zIndex: 2,
          }} />

          <div style={{
            position: "absolute", inset: 0, borderRadius: 14,
            backgroundImage: voronoiBg, backgroundSize: "cover",
            mixBlendMode: "overlay", opacity: 0.5, pointerEvents: "none",
          }} />

          <div style={{
            position: "absolute", inset: 0, borderRadius: 14,
            background: `linear-gradient(${135 + rotY * 2}deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.06) 100%)`,
            pointerEvents: "none", zIndex: 1,
            transition: hovered ? "none" : "background 0.4s ease-out",
          }} />

          <div style={{
            position: "absolute",
            top: "8%", left: "10%", width: "80%", height: "60%",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "contain", backgroundPosition: "center",
            backgroundRepeat: "no-repeat", opacity: 0.85,
            transform: `translate(${imgOffX}px, ${imgOffY}px)`,
            transition: hovered ? "none" : "transform 0.3s ease-out",
            pointerEvents: "none",
          }} />

          <div style={{
            position: "absolute", inset: 0, borderRadius: 14,
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none",
          }} />
        </div>
      )}

      {textOverlay}

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
