import { useRef, useEffect, useCallback } from "react";
import { type EplPlayer } from "@shared/schema";

type CardRarity = "common" | "rare" | "unique" | "epic" | "legendary";

const POINTS_PER_LEVEL = 1000;
const LEVEL_BONUS = 0.05;

function calculateLevel(totalXP: number): { level: number; currentXP: number; xpNeeded: number } {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= POINTS_PER_LEVEL) {
    remaining -= POINTS_PER_LEVEL;
    level++;
  }
  return { level, currentXP: remaining, xpNeeded: POINTS_PER_LEVEL };
}

function getLevelMultiplier(level: number): number {
  return 1 + (level - 1) * LEVEL_BONUS;
}

function calculateTotalXP(player: EplPlayer): number {
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const apps = player.appearances ?? 0;
  const minutes = player.minutes ?? 0;
  return goals * 100 + assists * 60 + apps * 30 + Math.floor(minutes / 10);
}

function assignRarity(player: EplPlayer): CardRarity {
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

function getPositionShort(pos: string | null): string {
  if (!pos) return "N/A";
  const map: Record<string, string> = {
    Goalkeeper: "GK", Defender: "DEF", Midfielder: "MID", Attacker: "FWD",
  };
  return map[pos] || pos.substring(0, 3).toUpperCase();
}

interface EPLPlayerCardProps {
  player: EplPlayer;
  size?: "sm" | "md" | "lg";
  forceRarity?: CardRarity;
  onClick?: () => void;
}

export default function EPLPlayerCard({
  player,
  size = "md",
  forceRarity,
  onClick,
}: EPLPlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const rarity = forceRarity || assignRarity(player);
  const posShort = getPositionShort(player.position);
  const totalXP = calculateTotalXP(player);
  const { level } = calculateLevel(totalXP);
  const rating = player.rating ? parseFloat(player.rating).toFixed(1) : "—";

  const sizeMap = {
    sm: { w: 200, h: 290 },
    md: { w: 260, h: 370 },
    lg: { w: 310, h: 440 },
  };
  const s = sizeMap[size];

  const rarityAccent: Record<CardRarity, string> = {
    common: "rgba(180,195,215,0.5)",
    rare: "rgba(239,68,68,0.5)",
    unique: "rgba(168,85,247,0.5)",
    epic: "rgba(100,100,180,0.5)",
    legendary: "rgba(251,191,36,0.5)",
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current || !innerRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    innerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05,1.05,1.05)`;

    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0,255,133,0.25) 0%, transparent 60%)`;
    }
    if (shineRef.current) {
      shineRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2) 0%, transparent 50%)`;
      shineRef.current.style.opacity = "1";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!innerRef.current) return;
    innerRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    if (glowRef.current) glowRef.current.style.background = "transparent";
    if (shineRef.current) shineRef.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const stats = [
    { label: "PAC", value: Math.min(99, 55 + (player.goals ?? 0) * 2 + (player.assists ?? 0)) },
    { label: "SHO", value: Math.min(99, 40 + (player.goals ?? 0) * 4) },
    { label: "PAS", value: Math.min(99, 50 + (player.assists ?? 0) * 4 + (player.appearances ?? 0)) },
    { label: "DEF", value: Math.min(99, player.position === "Defender" || player.position === "Goalkeeper" ? 70 + (player.appearances ?? 0) : 35 + (player.appearances ?? 0)) },
    { label: "PHY", value: Math.min(99, 55 + Math.floor((player.minutes ?? 0) / 200)) },
  ];

  return (
    <div
      ref={cardRef}
      className="cursor-pointer"
      style={{ width: s.w, height: s.h, perspective: "1000px" }}
      onClick={onClick}
    >
      <div
        ref={innerRef}
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 18,
            background: `linear-gradient(135deg, #3d195b 0%, #1a0a2e 40%, #0d0520 60%, #3d195b 100%)`,
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${rarityAccent[rarity]}, transparent 40%, ${rarityAccent[rarity]})`,
            zIndex: 0,
            opacity: 0.6,
          }}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 16,
            overflow: "hidden",
            background: "linear-gradient(160deg, rgba(61,25,91,0.85) 0%, rgba(26,10,46,0.9) 30%, rgba(13,5,32,0.95) 60%, rgba(61,25,91,0.85) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(0,255,133,0.15)",
            boxShadow: `0 8px 32px rgba(61,25,91,0.4), 0 0 60px rgba(0,255,133,0.08), inset 0 1px 0 rgba(255,255,255,0.1)`,
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <div
            ref={glowRef}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              pointerEvents: "none",
              zIndex: 2,
              transition: "background 0.2s ease",
            }}
          />

          <div
            ref={shineRef}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              pointerEvents: "none",
              zIndex: 10,
              opacity: 0,
              transition: "opacity 0.3s ease",
            }}
          />

          <div style={{
            position: "absolute",
            top: size === "sm" ? 10 : 14,
            left: size === "sm" ? 10 : 14,
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}>
            <span style={{
              color: "#00ff85",
              fontWeight: 900,
              fontSize: size === "sm" ? 28 : size === "md" ? 36 : 44,
              lineHeight: 1,
              textShadow: "0 0 20px rgba(0,255,133,0.4), 0 2px 4px rgba(0,0,0,0.5)",
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "-0.02em",
            }}>
              {rating}
            </span>
            <span style={{
              color: "#00ff85",
              fontWeight: 800,
              fontSize: size === "sm" ? 11 : size === "md" ? 13 : 15,
              letterSpacing: "0.15em",
              textShadow: "0 0 10px rgba(0,255,133,0.3)",
            }}>
              {posShort}
            </span>
            {player.teamLogo && (
              <img
                src={player.teamLogo}
                alt=""
                style={{
                  width: size === "sm" ? 22 : size === "md" ? 28 : 34,
                  height: size === "sm" ? 22 : size === "md" ? 28 : 34,
                  objectFit: "contain",
                  marginTop: 4,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                }}
              />
            )}
          </div>

          <div style={{
            position: "absolute",
            top: size === "sm" ? 10 : 14,
            right: size === "sm" ? 10 : 14,
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: "rgba(0,255,133,0.08)",
            border: "1px solid rgba(0,255,133,0.2)",
            borderRadius: 8,
            padding: "4px 8px",
          }}>
            <span style={{
              color: "#00ff85",
              fontWeight: 900,
              fontSize: size === "sm" ? 12 : 14,
              textShadow: "0 0 10px rgba(0,255,133,0.3)",
            }}>
              Lv.{level}
            </span>
          </div>

          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -55%) translateZ(30px)",
            transformStyle: "preserve-3d",
            width: size === "sm" ? "60%" : "65%",
            aspectRatio: "3/4",
            zIndex: 3,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 15px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,133,0.1)",
          }}>
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                  filter: "contrast(1.1) saturate(1.15)",
                }}
              />
            ) : (
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, rgba(61,25,91,0.8), rgba(13,5,32,0.9))",
              }}>
                <span style={{ color: "rgba(0,255,133,0.3)", fontSize: size === "sm" ? 44 : 56, fontWeight: 900 }}>
                  {player.name?.charAt(0)}
                </span>
              </div>
            )}

            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: "linear-gradient(transparent, rgba(13,5,32,0.95))",
              pointerEvents: "none",
            }} />
          </div>

          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 5,
            background: "linear-gradient(0deg, rgba(13,5,32,0.98) 0%, rgba(13,5,32,0.95) 40%, rgba(13,5,32,0.7) 70%, transparent 100%)",
            padding: size === "sm" ? "40px 12px 10px" : "50px 16px 14px",
          }}>
            <h3 style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: size === "sm" ? 15 : size === "md" ? 19 : 22,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              lineHeight: 1.1,
              marginBottom: 2,
            }}>
              {player.lastname || player.name?.split(" ").slice(-1)[0] || "Unknown"}
            </h3>
            {player.firstname && (
              <p style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: size === "sm" ? 8 : 10,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                marginBottom: size === "sm" ? 6 : 10,
              }}>
                {player.firstname}
              </p>
            )}

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: size === "sm" ? 3 : 4,
              padding: size === "sm" ? "6px 0 0" : "8px 0 0",
              borderTop: "1px solid rgba(0,255,133,0.15)",
            }}>
              {stats.map(({ label, value }) => (
                <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <span style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: size === "sm" ? 7 : size === "md" ? 8 : 9,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                  }}>
                    {label}
                  </span>
                  <div style={{
                    width: "100%",
                    height: size === "sm" ? 3 : 4,
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${value}%`,
                      height: "100%",
                      borderRadius: 2,
                      background: value >= 80
                        ? "linear-gradient(90deg, #00ff85, #00cc6a)"
                        : value >= 60
                        ? "linear-gradient(90deg, #00ff85, #7cff85)"
                        : "linear-gradient(90deg, rgba(0,255,133,0.5), rgba(0,255,133,0.3))",
                      boxShadow: value >= 70 ? "0 0 8px rgba(0,255,133,0.4)" : "none",
                      transition: "width 0.6s ease-out",
                    }} />
                  </div>
                  <span style={{
                    color: value >= 80 ? "#00ff85" : "#fff",
                    fontWeight: 800,
                    fontSize: size === "sm" ? 9 : size === "md" ? 11 : 13,
                    textShadow: value >= 80 ? "0 0 8px rgba(0,255,133,0.4)" : "none",
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            position: "absolute",
            inset: 0,
            background: `repeating-conic-gradient(rgba(255,255,255,0.01) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px`,
            pointerEvents: "none",
            zIndex: 1,
            opacity: 0.5,
          }} />
        </div>
      </div>
    </div>
  );
}

export { assignRarity, calculateLevel, getLevelMultiplier, POINTS_PER_LEVEL, LEVEL_BONUS, type CardRarity };
