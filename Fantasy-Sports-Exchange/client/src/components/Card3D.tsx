import { useRef, useState, useCallback, useMemo } from "react";
import { type PlayerCardWithPlayer, type EplPlayer } from "@shared/schema";
import { Shield } from "lucide-react";

type RarityKey = "common" | "rare" | "unique" | "epic" | "legendary";

const rarityStyles: Record<RarityKey, {
  gradient: string;
  border: string;
  glow: string;
  label: string;
  labelBg: string;
  textColor: string;
  accentColor: string;
  edgeDark: string;
  edgeMid: string;
}> = {
  common: {
    gradient: "linear-gradient(145deg, #5a6577 0%, #8e9aaf 30%, #a8b5c4 50%, #8e9aaf 70%, #5a6577 100%)",
    border: "#8e9aaf",
    glow: "0 10px 40px rgba(120,140,165,0.3)",
    label: "COMMON",
    labelBg: "rgba(100,120,140,0.85)",
    textColor: "#cbd5e1",
    accentColor: "#b8c4d4",
    edgeDark: "#5a6575",
    edgeMid: "#6b7a8d",
  },
  rare: {
    gradient: "linear-gradient(145deg, #7f1d1d 0%, #b91c1c 30%, #dc2626 50%, #b91c1c 70%, #7f1d1d 100%)",
    border: "#dc2626",
    glow: "0 10px 50px rgba(220,38,38,0.35), 0 0 80px rgba(239,68,68,0.12)",
    label: "RARE",
    labelBg: "rgba(185,28,28,0.9)",
    textColor: "#fca5a5",
    accentColor: "#fca5a5",
    edgeDark: "#6f1010",
    edgeMid: "#991b1b",
  },
  unique: {
    gradient: "linear-gradient(145deg, #4c1d95 0%, #6d28d9 30%, #a855f7 50%, #6d28d9 70%, #4c1d95 100%)",
    border: "#a855f7",
    glow: "0 10px 50px rgba(124,58,237,0.35), 0 0 80px rgba(236,72,153,0.12)",
    label: "UNIQUE",
    labelBg: "linear-gradient(135deg, #6d28d9, #db2777)",
    textColor: "#e9d5ff",
    accentColor: "#e9d5ff",
    edgeDark: "#4c1d95",
    edgeMid: "#6d28d9",
  },
  epic: {
    gradient: "linear-gradient(145deg, #0f0f2e 0%, #1a1a3e 30%, #312e81 50%, #1a1a3e 70%, #0f0f2e 100%)",
    border: "#6366f1",
    glow: "0 10px 50px rgba(79,70,229,0.25), 0 0 80px rgba(99,102,241,0.1)",
    label: "EPIC",
    labelBg: "linear-gradient(135deg, #1e1b4b, #312e81)",
    textColor: "#a5b4fc",
    accentColor: "#a5b4fc",
    edgeDark: "#050510",
    edgeMid: "#0f0f23",
  },
  legendary: {
    gradient: "linear-gradient(145deg, #78350f 0%, #b45309 30%, #d97706 50%, #f59e0b 60%, #b45309 80%, #78350f 100%)",
    border: "#f59e0b",
    glow: "0 10px 60px rgba(245,158,11,0.4), 0 0 100px rgba(251,191,36,0.15)",
    label: "LEGENDARY",
    labelBg: "linear-gradient(135deg, #92400e, #d97706)",
    textColor: "#fef3c7",
    accentColor: "#fef3c7",
    edgeDark: "#5c2d06",
    edgeMid: "#78350f",
  },
};

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
  sorareImageUrl?: string | null;
}

export default function Card3D({
  card,
  size = "md",
  selected = false,
  selectable = false,
  onClick,
  showPrice = false,
  sorareImageUrl,
}: Card3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: -5, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  const rarity = (card.rarity as RarityKey) || "common";
  const styles = rarityStyles[rarity];

  const edge = 12;
  const sizeMap = {
    sm: { w: 170, h: 250, fontSize: 0.75 },
    md: { w: 220, h: 320, fontSize: 1 },
    lg: { w: 270, h: 390, fontSize: 1.2 },
  };
  const s = sizeMap[size];
  const totalW = s.w + edge;
  const totalH = s.h + edge;

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
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setRotation({ x: -5 + y * 15, y: x * 15 });
    setImageOffset({ x: x * 3, y: -y * 3 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotation({ x: -5, y: 0 });
    setImageOffset({ x: 0, y: 0 });
    setHovered(false);
  }, []);

  const playerName = card.player?.name || "Unknown";
  const teamName = card.player?.team || "Unknown";
  const position = card.player?.position || "N/A";
  const rating = card.player?.overall || 0;
  const level = card.level || 1;
  const decisiveScore = card.decisiveScore || 35;

  const voronoiSvg = useMemo(() => {
    const points = Array.from({ length: 30 }, (_, i) => ({
      x: ((i * 137.508) % 100),
      y: ((i * 73.247 + 17) % 100),
    }));
    const paths = points.map((p, i) => {
      const neighbors = points
        .filter((_, j) => j !== i)
        .sort((a, b) => {
          const da = Math.hypot(a.x - p.x, a.y - p.y);
          const db = Math.hypot(b.x - p.x, b.y - p.y);
          return da - db;
        })
        .slice(0, 5);
      const midpoints = neighbors.map(n => ({
        x: (p.x + n.x) / 2,
        y: (p.y + n.y) / 2,
      }));
      const center = {
        x: midpoints.reduce((s, m) => s + m.x, 0) / midpoints.length,
        y: midpoints.reduce((s, m) => s + m.y, 0) / midpoints.length,
      };
      const sorted = midpoints.sort((a, b) =>
        Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x)
      );
      return `M${sorted[0].x},${sorted[0].y} ${sorted.slice(1).map(m => `L${m.x},${m.y}`).join(" ")} Z`;
    });
    return paths;
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: totalW,
        height: totalH,
        perspective: 800,
        cursor: selectable ? "pointer" : "default",
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      data-testid={`player-card-${card.id}`}
    >
      <div
        style={{
          width: totalW,
          height: totalH,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: hovered ? "transform 0.05s ease-out" : "transform 0.4s ease-out",
        }}
      >
        {/* RIGHT EDGE */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: edge,
          height: s.h,
          background: `linear-gradient(180deg, ${styles.edgeMid} 0%, ${styles.edgeDark} 40%, ${styles.edgeDark} 100%)`,
          borderRadius: `0 14px 14px 0`,
          transform: `translateZ(-${edge}px)`,
          boxShadow: `inset -2px 0 6px rgba(0,0,0,0.4), inset 1px 0 2px rgba(255,255,255,0.05)`,
          zIndex: 0,
        }} />

        {/* BOTTOM EDGE */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: edge,
          background: `linear-gradient(90deg, ${styles.edgeDark} 0%, ${styles.edgeMid} 30%, ${styles.edgeDark} 100%)`,
          borderRadius: `0 0 14px 14px`,
          transform: `translateZ(-${edge}px)`,
          boxShadow: `inset 0 -2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.05)`,
          zIndex: 0,
        }} />

        {/* MAIN CARD FACE */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: s.w,
            height: s.h,
            borderRadius: 14,
            background: styles.gradient,
            boxShadow: selected
              ? `0 0 0 3px hsl(250,85%,65%), ${styles.glow}, inset 0px 1px 1px rgba(255,255,255,0.4), inset 0px -1px 1px rgba(0,0,0,0.4)`
              : `${styles.glow}, inset 0px 1px 1px rgba(255,255,255,0.4), inset 0px -1px 1px rgba(0,0,0,0.4)`,
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              boxShadow: `inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.3), inset 2px 0 4px rgba(255,255,255,0.1), inset -2px 0 4px rgba(0,0,0,0.1)`,
              borderRadius: 14,
              pointerEvents: "none",
              zIndex: 10,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "50%",
              transform: `translate(calc(-50% + ${imageOffset.x}px), ${imageOffset.y}px)`,
              width: "78%",
              height: "55%",
              overflow: "hidden",
              borderRadius: 8,
              transition: hovered ? "transform 0.05s ease-out" : "transform 0.3s ease-out",
            }}
          >
            <img
              src={imageUrl}
              alt={playerName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                filter: "contrast(1.05) brightness(0.95)",
              }}
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = "1";
                  img.src = `/images/player-${imageIndex}.png`;
                }
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: "4%",
              left: "6%",
              zIndex: 5,
            }}
          >
            <div
              style={{
                fontSize: Math.round(28 * s.fontSize),
                fontWeight: 900,
                color: "#e0e0e0",
                fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
                lineHeight: 1,
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                letterSpacing: "-0.02em",
              }}
            >
              {rating}
            </div>
            <div
              style={{
                fontSize: Math.round(11 * s.fontSize),
                fontWeight: 800,
                color: styles.textColor,
                fontFamily: "'Inter',system-ui,sans-serif",
                letterSpacing: "0.15em",
                marginTop: 2,
                textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              {position}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: "4%",
              right: "6%",
              textAlign: "right",
              zIndex: 5,
            }}
          >
            {serialText && (
              <div
                style={{
                  fontSize: Math.round(9 * s.fontSize),
                  fontWeight: 600,
                  color: "#999999",
                  fontFamily: "'Inter',monospace,system-ui",
                  letterSpacing: "0.08em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                {serialText}
              </div>
            )}
            <div
              style={{
                fontSize: Math.round(8 * s.fontSize),
                fontWeight: 800,
                color: styles.textColor,
                fontFamily: "'Inter',system-ui,sans-serif",
                letterSpacing: "0.15em",
                marginTop: 2,
                textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              {styles.label}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "6%",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 5,
              padding: "0 8%",
            }}
          >
            <div
              style={{
                fontSize: Math.round(16 * s.fontSize),
                fontWeight: 900,
                color: "#ffffff",
                fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {playerName}
            </div>
            <div
              style={{
                fontSize: Math.round(10 * s.fontSize),
                fontWeight: 600,
                color: "#aaaaaa",
                fontFamily: "'Inter',system-ui,sans-serif",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: 2,
                textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {teamName}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: Math.round(16 * s.fontSize),
                marginTop: Math.round(4 * s.fontSize),
              }}
            >
              <span
                style={{
                  fontSize: Math.round(9 * s.fontSize),
                  fontWeight: 800,
                  color: "#facc15",
                  fontFamily: "'Inter',system-ui,sans-serif",
                  letterSpacing: "0.05em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                LV.{level}
              </span>
              <span
                style={{
                  fontSize: Math.round(9 * s.fontSize),
                  fontWeight: 800,
                  color: dsColor,
                  fontFamily: "'Inter',system-ui,sans-serif",
                  letterSpacing: "0.05em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                DS {decisiveScore}
              </span>
            </div>
          </div>

          <svg
            viewBox="0 0 100 100"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.08,
              pointerEvents: "none",
              zIndex: 4,
            }}
            preserveAspectRatio="none"
          >
            {voronoiSvg.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="white"
                strokeWidth="0.3"
              />
            ))}
          </svg>

          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              background: hovered
                ? `radial-gradient(circle at ${50 + rotation.y * 2}% ${50 - rotation.x * 2}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
                : "none",
              pointerEvents: "none",
              zIndex: 6,
              transition: "background 0.1s ease-out",
            }}
          />
        </div>
      </div>

      {showPrice && card.forSale && (
        <div style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          borderRadius: 6,
          padding: "2px 10px",
          zIndex: 10,
          pointerEvents: "none",
        }}>
          <span style={{
            color: "#4ade80",
            fontSize: 14,
            fontWeight: 900,
            fontFamily: "'Inter','Arial Black',system-ui,sans-serif",
          }}>
            N${card.price?.toFixed(2)}
          </span>
        </div>
      )}

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
