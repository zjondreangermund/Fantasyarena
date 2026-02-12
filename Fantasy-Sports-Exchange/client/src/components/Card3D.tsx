import { useRef, useState, useCallback, useEffect } from "react";
import { type PlayerCardWithPlayer, type EplPlayer } from "@shared/schema";
import { Shield } from "lucide-react";

type RarityKey = "common" | "rare" | "unique" | "epic" | "legendary";

const rarityStyles: Record<RarityKey, {
  gradient: string;
  label: string;
  glow: string;
  accentColor: string;
  labelBg: string;
}> = {
  common: {
    gradient: "linear-gradient(145deg, #5a6577 0%, #8e9aaf 30%, #a8b5c4 50%, #8e9aaf 70%, #5a6577 100%)",
    label: "COMMON", glow: "0 8px 32px rgba(120,140,165,0.25)",
    accentColor: "#b8c4d4", labelBg: "rgba(100,120,140,0.85)",
  },
  rare: {
    gradient: "linear-gradient(145deg, #7f1d1d 0%, #b91c1c 30%, #dc2626 50%, #b91c1c 70%, #7f1d1d 100%)",
    label: "RARE", glow: "0 8px 40px rgba(220,38,38,0.3)",
    accentColor: "#fca5a5", labelBg: "rgba(185,28,28,0.9)",
  },
  unique: {
    gradient: "linear-gradient(145deg, #4c1d95 0%, #6d28d9 30%, #a855f7 50%, #6d28d9 70%, #4c1d95 100%)",
    label: "UNIQUE", glow: "0 8px 40px rgba(124,58,237,0.3)",
    accentColor: "#e9d5ff", labelBg: "linear-gradient(135deg, #6d28d9, #db2777)",
  },
  epic: {
    gradient: "linear-gradient(145deg, #0f0f2e 0%, #1a1a3e 30%, #312e81 50%, #1a1a3e 70%, #0f0f2e 100%)",
    label: "EPIC", glow: "0 8px 40px rgba(79,70,229,0.2)",
    accentColor: "#a5b4fc", labelBg: "linear-gradient(135deg, #1e1b4b, #312e81)",
  },
  legendary: {
    gradient: "linear-gradient(145deg, #78350f 0%, #b45309 30%, #d97706 50%, #f59e0b 60%, #b45309 80%, #78350f 100%)",
    label: "LEGENDARY", glow: "0 8px 48px rgba(245,158,11,0.35)",
    accentColor: "#fef3c7", labelBg: "linear-gradient(135deg, #92400e, #d97706)",
  },
};

const voronoiSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" opacity="0.18"><defs><filter id="v"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="400" height="600" filter="url(#v)"/></svg>`;
const voronoiBg = `url("data:image/svg+xml,${encodeURIComponent(voronoiSvg)}")`;

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
  const [rotX, setRotX] = useState(-5);
  const [rotY, setRotY] = useState(0);
  const [imgOffX, setImgOffX] = useState(0);
  const [imgOffY, setImgOffY] = useState(0);
  const [hovered, setHovered] = useState(false);
  const rafRef = useRef<number>(0);

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

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const targetRotY = hovered ? mx * 18 : 0;
      const targetRotX = hovered ? my * -12 - 5 : -5;
      const targetImgX = hovered ? mx * 5 : 0;
      const targetImgY = hovered ? my * -4 : 0;
      setRotY(prev => prev + (targetRotY - prev) * 0.12);
      setRotX(prev => prev + (targetRotX - prev) * 0.12);
      setImgOffX(prev => prev + (targetImgX - prev) * 0.1);
      setImgOffY(prev => prev + (targetImgY - prev) * 0.1);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [hovered]);

  const shimmerAngle = 135 + rotY * 3;

  return (
    <div
      ref={wrapperRef}
      className="card-wrapper"
      style={{
        width: s.w, height: s.h,
        perspective: "1000px",
        cursor: selectable ? "pointer" : "default",
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={`player-card-${card.id}`}
    >
      {/* card-3d: the ONLY element that rotates */}
      <div
        className="card-3d"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: hovered ? "none" : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
          borderRadius: 14,
        }}
      >
        {/* metal-surface: gradient background */}
        <div
          className="metal-surface"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 14,
            background: rs.gradient,
            boxShadow: `${rs.glow}, inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)`,
            overflow: "hidden",
          }}
        >
          {/* inner frame bevel */}
          <div style={{
            position: "absolute", inset: 3, borderRadius: 11,
            border: "1px solid rgba(255,255,255,0.1)",
            pointerEvents: "none", zIndex: 2,
          }} />

          {/* voronoi crystal texture */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 14,
            backgroundImage: voronoiBg, backgroundSize: "cover",
            mixBlendMode: "overlay", opacity: 0.5, pointerEvents: "none",
          }} />

          {/* metallic shimmer that moves with tilt */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 14,
            background: `linear-gradient(${shimmerAngle}deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 20%, transparent 45%, transparent 55%, rgba(255,255,255,0.04) 80%, rgba(255,255,255,0.18) 100%)`,
            pointerEvents: "none", zIndex: 3,
          }} />

          {/* player image */}
          <div style={{
            position: "absolute",
            top: "8%", left: "10%", width: "80%", height: "58%",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "contain", backgroundPosition: "center",
            backgroundRepeat: "no-repeat", opacity: 0.88,
            transform: `translate(${imgOffX}px, ${imgOffY}px)`,
            transition: hovered ? "none" : "transform 0.4s ease-out",
            pointerEvents: "none", zIndex: 1,
          }} />

          {/* vignette edge darkening */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 14,
            background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)",
            pointerEvents: "none", zIndex: 4,
          }} />
        </div>

        {/* card-content: engraved text - part of the rotating card-3d */}
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
          {/* top row: rating + serial/rarity */}
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

          {/* bottom: name, team, stats */}
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

        {/* holo-layer: holographic shine on top of everything */}
        <div
          className="holo-layer"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 14,
            background: hovered
              ? `linear-gradient(${shimmerAngle + 90}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 70%)`
              : "none",
            pointerEvents: "none",
            zIndex: 11,
            transition: hovered ? "none" : "background 0.4s ease-out",
          }}
        />

        {/* price tag */}
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

      {/* selected badge sits outside the 3D rotation */}
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
