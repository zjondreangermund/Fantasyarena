import { useRef, useEffect, useCallback } from "react";
import { type PlayerCardWithPlayer } from "@shared/schema";
import { Zap } from "lucide-react";
import { Shield } from "lucide-react";

type RarityKey = "common" | "rare" | "unique" | "epic" | "legendary";

const rarityTheme: Record<RarityKey, {
  face: string;
  edgeDark: string;
  edgeMid: string;
  border: string;
  glow: string;
  label: string;
  labelBg: string;
  accent: string;
  studioGlow: string;
}> = {
  common: {
    face: "linear-gradient(160deg, #8e9aaf 0%, #b8c4d4 25%, #a0aec0 50%, #8e9aaf 75%, #7a8899 100%)",
    edgeDark: "#5a6575",
    edgeMid: "#6b7a8d",
    border: "rgba(200,210,225,0.5)",
    glow: "0 10px 40px rgba(120,140,165,0.3)",
    label: "COMMON",
    labelBg: "rgba(100,120,140,0.9)",
    accent: "#cbd5e1",
    studioGlow: "",
  },
  rare: {
    face: "linear-gradient(160deg, #b91c1c 0%, #dc2626 20%, #ef4444 45%, #dc2626 65%, #b91c1c 90%, #991b1b 100%)",
    edgeDark: "#6f1010",
    edgeMid: "#991b1b",
    border: "rgba(248,113,113,0.5)",
    glow: "0 10px 50px rgba(220,38,38,0.35), 0 0 80px rgba(239,68,68,0.12)",
    label: "RARE",
    labelBg: "rgba(185,28,28,0.95)",
    accent: "#fca5a5",
    studioGlow: "",
  },
  unique: {
    face: "linear-gradient(160deg, #6d28d9 0%, #7c3aed 15%, #a855f7 30%, #ec4899 50%, #f97316 70%, #eab308 85%, #22c55e 100%)",
    edgeDark: "#4c1d95",
    edgeMid: "#6d28d9",
    border: "rgba(168,85,247,0.5)",
    glow: "0 10px 50px rgba(124,58,237,0.35), 0 0 80px rgba(236,72,153,0.12)",
    label: "UNIQUE",
    labelBg: "linear-gradient(135deg, #6d28d9 0%, #db2777 100%)",
    accent: "#e9d5ff",
    studioGlow: "radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.35) 0%, rgba(168,85,247,0.1) 35%, transparent 65%)",
  },
  epic: {
    face: "linear-gradient(160deg, #0f0f23 0%, #1a1a3e 20%, #22225a 40%, #1a1a3e 60%, #0f0f23 80%, #0a0a18 100%)",
    edgeDark: "#050510",
    edgeMid: "#0f0f23",
    border: "rgba(99,102,241,0.35)",
    glow: "0 10px 50px rgba(79,70,229,0.25), 0 0 80px rgba(99,102,241,0.1)",
    label: "EPIC",
    labelBg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    accent: "#a5b4fc",
    studioGlow: "",
  },
  legendary: {
    face: "linear-gradient(160deg, #92400e 0%, #b45309 15%, #d97706 30%, #fbbf24 50%, #f59e0b 65%, #d97706 80%, #92400e 100%)",
    edgeDark: "#5c2d06",
    edgeMid: "#78350f",
    border: "rgba(252,211,77,0.6)",
    glow: "0 10px 60px rgba(245,158,11,0.4), 0 0 100px rgba(251,191,36,0.15)",
    label: "LEGENDARY",
    labelBg: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
    accent: "#fef3c7",
    studioGlow: "radial-gradient(ellipse at 50% 40%, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0.12) 35%, transparent 65%)",
  },
};

const LION_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' opacity='0.06'%3E%3Cpath d='M50 5 C30 5 15 20 15 40 C15 55 25 65 30 70 L25 85 L30 90 L35 82 L40 95 L45 88 L50 100 L55 88 L60 95 L65 82 L70 90 L75 85 L70 70 C75 65 85 55 85 40 C85 20 70 5 50 5Z M35 35 C38 35 40 37 40 40 C40 43 38 45 35 45 C32 45 30 43 30 40 C30 37 32 35 35 35Z M65 35 C68 35 70 37 70 40 C70 43 68 45 65 45 C62 45 60 43 60 40 C60 37 62 35 65 35Z M40 55 C40 55 45 62 50 62 C55 62 60 55 60 55' fill='white' stroke='none'/%3E%3C/svg%3E")`;

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const GEO_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.06)' stroke-width='0.5'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z'/%3E%3Cpath d='M30 10L50 30L30 50L10 30Z'/%3E%3Cpath d='M0 0L30 0L15 15Z'/%3E%3Cpath d='M60 0L60 30L45 15Z'/%3E%3Cpath d='M60 60L30 60L45 45Z'/%3E%3Cpath d='M0 60L0 30L15 45Z'/%3E%3C/g%3E%3C/svg%3E")`;

function ScoreBar({ scores }: { scores: number[]; }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20 }}>
      {scores.map((score, i) => (
        <div
          key={i}
          style={{
            width: 6,
            borderRadius: 2,
            height: `${Math.max(15, (score / 100) * 100)}%`,
            backgroundColor:
              score >= 70 ? "hsl(150, 60%, 45%)" : score >= 40 ? "hsl(45, 93%, 47%)" : "hsl(0, 72%, 51%)",
            opacity: 0.6 + (i / scores.length) * 0.4,
          }}
        />
      ))}
    </div>
  );
}

interface PlayerCardProps {
  card: PlayerCardWithPlayer;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  showPrice?: boolean;
}

export default function PlayerCard({
  card,
  size = "md",
  selected = false,
  selectable = false,
  onClick,
  showPrice = false,
}: PlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const rarity = (card.rarity as RarityKey) || "common";
  const theme = rarityTheme[rarity];

  const sizeMap = {
    sm: { w: 170, h: 250, edge: 8, radius: 12, fontSize: 0.75 },
    md: { w: 210, h: 310, edge: 10, radius: 14, fontSize: 0.9 },
    lg: { w: 260, h: 380, edge: 12, radius: 16, fontSize: 1.1 },
  };
  const s = sizeMap[size];
  const totalW = s.w + s.edge;
  const totalH = s.h + s.edge;

  const imageIndex = ((card.playerId - 1) % 6) + 1;
  const imageUrl = card.player?.imageUrl || `/images/player-${imageIndex}.png`;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current || !innerRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    innerRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY - 5}deg) scale3d(1.04,1.04,1.04)`;
    if (shineRef.current) {
      shineRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.18) 0%, transparent 55%)`;
      shineRef.current.style.opacity = "1";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!innerRef.current) return;
    innerRef.current.style.transform = "rotateX(0deg) rotateY(-5deg) scale3d(1,1,1)";
    if (shineRef.current) shineRef.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div
      ref={cardRef}
      className="cursor-pointer"
      style={{
        width: totalW,
        height: totalH,
        perspective: "800px",
        transition: "transform 0.2s ease",
        ...(selectable ? { cursor: "pointer" } : {}),
        ...(selected ? {
          outline: "3px solid hsl(250, 85%, 65%)",
          outlineOffset: "3px",
          borderRadius: s.radius,
        } : {}),
      }}
      onClick={onClick}
      data-testid={`player-card-${card.id}`}
    >
      <div
        ref={innerRef}
        style={{
          width: totalW,
          height: totalH,
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.2s ease-out",
          transform: "rotateY(-5deg)",
        }}
      >
        {/* RIGHT EDGE */}
        <div style={{
          position: "absolute",
          top: 4,
          right: 0,
          width: s.edge,
          height: s.h - 8,
          background: `linear-gradient(180deg, ${theme.edgeMid} 0%, ${theme.edgeDark} 40%, ${theme.edgeDark} 100%)`,
          borderRadius: `0 ${s.radius - 2}px ${s.radius - 2}px 0`,
          transform: `translateZ(-${s.edge}px)`,
          boxShadow: `inset -2px 0 6px rgba(0,0,0,0.4), inset 1px 0 2px rgba(255,255,255,0.05)`,
          zIndex: 0,
        }} />

        {/* BOTTOM EDGE */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 4,
          right: 4,
          height: s.edge,
          background: `linear-gradient(90deg, ${theme.edgeDark} 0%, ${theme.edgeMid} 30%, ${theme.edgeDark} 100%)`,
          borderRadius: `0 0 ${s.radius - 2}px ${s.radius - 2}px`,
          transform: `translateZ(-${s.edge}px)`,
          boxShadow: `inset 0 -2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.05)`,
          zIndex: 0,
        }} />

        {/* MAIN CARD FACE */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: s.w,
          height: s.h,
          borderRadius: s.radius,
          background: theme.face,
          border: `2px solid ${theme.border}`,
          borderRight: `${s.edge}px solid ${theme.edgeMid}`,
          borderBottom: `${s.edge}px solid ${theme.edgeDark}`,
          boxShadow: `
            ${theme.glow},
            inset 0 0 15px rgba(255,255,255,0.2),
            inset 0 1px 0 rgba(255,255,255,0.3),
            inset 0 -1px 0 rgba(0,0,0,0.2)
          `,
          overflow: "hidden",
          zIndex: 2,
        }}>
          {/* BRUSHED METAL NOISE TEXTURE */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: NOISE_SVG,
            backgroundSize: "128px 128px",
            pointerEvents: "none",
            zIndex: 1,
            mixBlendMode: "overlay",
          }} />

          {/* GEOMETRIC DIAMOND PATTERN */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: GEO_PATTERN,
            backgroundSize: "60px 60px",
            pointerEvents: "none",
            zIndex: 1,
          }} />

          {/* GLASS SHINE overlay */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 25%, transparent 50%, rgba(255,255,255,0.02) 75%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }} />

          {/* PREMIER LEAGUE LION WATERMARK */}
          <div style={{
            position: "absolute",
            top: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70%",
            height: "55%",
            backgroundImage: LION_SVG,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            pointerEvents: "none",
            zIndex: 1,
          }} />

          {/* STUDIO GLOW */}
          {theme.studioGlow && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: theme.studioGlow,
              pointerEvents: "none",
              zIndex: 2,
            }} />
          )}

          {/* HOVER SHINE */}
          <div
            ref={shineRef}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 20,
              opacity: 0,
              transition: "opacity 0.3s ease",
              mixBlendMode: "overlay",
            }}
          />

          {/* HEADER BAR */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${4 * s.fontSize}px ${8 * s.fontSize}px`,
            background: "rgba(0,0,0,0.25)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
            zIndex: 5,
          }}>
            <span style={{
              color: "rgba(255,255,255,0.8)",
              fontWeight: 700,
              fontSize: 9 * s.fontSize,
              letterSpacing: "0.08em",
            }}>
              {card.player?.league || "Fantasy"}
            </span>
            <span style={{
              background: theme.labelBg,
              color: theme.accent,
              fontWeight: 900,
              fontSize: 7 * s.fontSize,
              letterSpacing: "0.12em",
              padding: `2px ${5 * s.fontSize}px`,
              borderRadius: 3,
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}>
              {theme.label}
            </span>
          </div>

          {/* RATING + POSITION — top left */}
          <div style={{
            position: "absolute",
            top: 28 * s.fontSize,
            left: 8 * s.fontSize,
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}>
            <span style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 26 * s.fontSize,
              lineHeight: 1,
              textShadow: "2px 2px 2px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.15)",
              fontFamily: "'Inter', 'Arial Black', system-ui, sans-serif",
              fontStretch: "condensed",
            }}>
              {card.player?.overall || 0}
            </span>
            <span style={{
              background: "rgba(0,0,0,0.4)",
              color: theme.accent,
              fontWeight: 800,
              fontSize: 8 * s.fontSize,
              letterSpacing: "0.12em",
              padding: `1px ${5 * s.fontSize}px`,
              borderRadius: 3,
            }}>
              {card.player?.position || "N/A"}
            </span>
            <span style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 7 * s.fontSize,
              letterSpacing: "0.1em",
              marginTop: 2,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}>
              Lv.{card.level}
            </span>
          </div>

          {/* RECESSED IMAGE WINDOW */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -52%) translateZ(40px)",
            transformStyle: "preserve-3d",
            width: "62%",
            aspectRatio: "4/5",
            zIndex: 3,
            borderRadius: 10 * s.fontSize,
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
            border: `2px solid rgba(255,255,255,0.1)`,
            boxShadow: `
              inset 0 0 15px rgba(0,0,0,0.6),
              inset 0 4px 15px rgba(0,0,0,0.5),
              inset 0 -2px 10px rgba(0,0,0,0.3),
              inset 3px 0 10px rgba(0,0,0,0.25),
              inset -3px 0 10px rgba(0,0,0,0.25),
              0 8px 25px rgba(0,0,0,0.4)
            `,
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              borderRadius: 10 * s.fontSize,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3)",
              pointerEvents: "none",
              zIndex: 3,
            }} />

            <img
              src={imageUrl}
              alt={card.player?.name || "Player"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                filter: "contrast(1.08) saturate(1.12) drop-shadow(0 10px 20px rgba(0,0,0,0.6))",
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
              zIndex: 2,
            }} />
          </div>

          {/* DARK BOTTOM HALF — darkens where name sits */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            background: "linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.5) 65%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 4,
          }} />

          {/* BOTTOM INFO PANEL */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 5,
            padding: `${30 * s.fontSize}px ${10 * s.fontSize}px ${8 * s.fontSize}px`,
          }}>
            <h3 style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 16 * s.fontSize,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              lineHeight: 1.05,
              fontFamily: "'Inter', 'Arial Black', system-ui, sans-serif",
              fontStretch: "condensed",
              textShadow: "2px 2px 2px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4), 0 -1px 0 rgba(255,255,255,0.06)",
              marginBottom: 2,
            }}>
              {card.player?.name || "Unknown"}
            </h3>
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 8 * s.fontSize,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontFamily: "'Inter', 'Arial Black', system-ui, sans-serif",
              fontStretch: "condensed",
              textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
              marginBottom: 4,
            }}>
              {card.player?.team} &middot; {card.player?.nationality}
            </p>

            {/* Level + Score bar row */}
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
                gap: 4,
                background: "rgba(0,0,0,0.3)",
                borderRadius: 4,
                padding: `${2 * s.fontSize}px ${5 * s.fontSize}px`,
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.05)",
              }}>
                <Zap style={{ width: 10 * s.fontSize, height: 10 * s.fontSize, color: "#facc15" }} />
                <span style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 9 * s.fontSize,
                  fontWeight: 800,
                  fontFamily: "'Inter', 'Arial Black', system-ui, sans-serif",
                  fontStretch: "condensed",
                  textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
                }}>
                  Lv.{card.level}
                </span>
              </div>
              <ScoreBar scores={card.last5Scores as number[]} />
            </div>

            {showPrice && card.forSale && (
              <div style={{
                marginTop: 4,
                textAlign: "center",
              }}>
                <span style={{
                  color: "#4ade80",
                  fontSize: 11 * s.fontSize,
                  fontWeight: 900,
                  fontFamily: "'Inter', 'Arial Black', system-ui, sans-serif",
                  textShadow: "0 0 8px rgba(74,222,128,0.3), 1px 1px 1px rgba(0,0,0,0.5)",
                }}>
                  N${card.price?.toFixed(2)}
                </span>
              </div>
            )}
          </div>
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
          background: "hsl(250, 85%, 65%)",
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
