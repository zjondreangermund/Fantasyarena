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

function generateLast5Scores(player: EplPlayer): number[] {
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const apps = player.appearances ?? 0;
  const rating = player.rating ? parseFloat(player.rating) : 6.0;

  const baseScore = Math.round(rating * 10 + goals * 3 + assists * 2);
  const seed = player.apiId || 1;

  return Array.from({ length: 5 }, (_, i) => {
    const variation = ((seed * (i + 1) * 7 + i * 13) % 30) - 15;
    return Math.max(10, Math.min(100, baseScore + variation));
  });
}

function calculateTotalXP(player: EplPlayer): number {
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const apps = player.appearances ?? 0;
  const minutes = player.minutes ?? 0;
  return goals * 100 + assists * 60 + apps * 30 + Math.floor(minutes / 10);
}

const rarityStyles: Record<CardRarity, {
  face: string;
  sideColor: string;
  border: string;
  glow: string;
  label: string;
  labelBg: string;
  textAccent: string;
  headerBg: string;
  patternOpacity: string;
  sideGradient: string;
}> = {
  common: {
    face: "linear-gradient(160deg, #8e9aaf 0%, #b8c4d4 30%, #a0aec0 60%, #8e9aaf 100%)",
    sideColor: "#6b7a8d",
    border: "rgba(180,195,215,0.6)",
    glow: "0 4px 20px rgba(160,174,192,0.25)",
    label: "COMMON",
    labelBg: "rgba(120,140,160,0.85)",
    textAccent: "#e2e8f0",
    headerBg: "linear-gradient(135deg, rgba(120,140,160,0.95) 0%, rgba(160,174,192,0.85) 100%)",
    patternOpacity: "0.04",
    sideGradient: "linear-gradient(180deg, #9faab8 0%, #6b7a8d 50%, #5a6979 100%)",
  },
  rare: {
    face: "linear-gradient(160deg, #991b1b 0%, #dc2626 30%, #ef4444 50%, #dc2626 70%, #991b1b 100%)",
    sideColor: "#7f1d1d",
    border: "rgba(239,68,68,0.6)",
    glow: "0 4px 30px rgba(239,68,68,0.35), 0 0 60px rgba(220,38,38,0.15)",
    label: "RARE",
    labelBg: "rgba(185,28,28,0.9)",
    textAccent: "#fecaca",
    headerBg: "linear-gradient(135deg, rgba(153,27,27,0.95) 0%, rgba(220,38,38,0.85) 100%)",
    patternOpacity: "0.06",
    sideGradient: "linear-gradient(180deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)",
  },
  unique: {
    face: "linear-gradient(160deg, #7c3aed 0%, #a855f7 20%, #ec4899 40%, #f97316 60%, #eab308 80%, #22c55e 100%)",
    sideColor: "#6d28d9",
    border: "rgba(168,85,247,0.6)",
    glow: "0 4px 35px rgba(168,85,247,0.35), 0 0 70px rgba(236,72,153,0.15)",
    label: "UNIQUE",
    labelBg: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    textAccent: "#e9d5ff",
    headerBg: "linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(236,72,153,0.85) 100%)",
    patternOpacity: "0.08",
    sideGradient: "linear-gradient(180deg, #a855f7 0%, #7c3aed 30%, #ec4899 60%, #6d28d9 100%)",
  },
  epic: {
    face: "linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 50%, #1a1a2e 70%, #0a0a0a 100%)",
    sideColor: "#0f0f23",
    border: "rgba(100,100,140,0.5)",
    glow: "0 4px 30px rgba(100,100,180,0.25), 0 0 60px rgba(50,50,100,0.15)",
    label: "EPIC",
    labelBg: "linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)",
    textAccent: "#c4b5fd",
    headerBg: "linear-gradient(135deg, rgba(15,15,40,0.97) 0%, rgba(45,45,90,0.92) 100%)",
    patternOpacity: "0.06",
    sideGradient: "linear-gradient(180deg, #2d2d5e 0%, #1a1a2e 50%, #0a0a0a 100%)",
  },
  legendary: {
    face: "linear-gradient(160deg, #92400e 0%, #d97706 20%, #fbbf24 40%, #f59e0b 60%, #d97706 80%, #92400e 100%)",
    sideColor: "#78350f",
    border: "rgba(251,191,36,0.6)",
    glow: "0 4px 40px rgba(251,191,36,0.4), 0 0 80px rgba(245,158,11,0.2)",
    label: "LEGENDARY",
    labelBg: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
    textAccent: "#fef3c7",
    headerBg: "linear-gradient(135deg, rgba(146,64,14,0.95) 0%, rgba(217,119,6,0.85) 100%)",
    patternOpacity: "0.1",
    sideGradient: "linear-gradient(180deg, #fbbf24 0%, #d97706 40%, #92400e 70%, #78350f 100%)",
  },
};

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
  const rarity = forceRarity || assignRarity(player);
  const style = rarityStyles[rarity];
  const posShort = getPositionShort(player.position);
  const last5 = generateLast5Scores(player);
  const totalXP = calculateTotalXP(player);
  const { level, currentXP, xpNeeded } = calculateLevel(totalXP);
  const multiplier = getLevelMultiplier(level);

  const sizeMap = {
    sm: { w: 170, h: 250, side: 8, imgSize: 100, nameSize: "text-xs", statSize: "text-[8px]" },
    md: { w: 210, h: 310, side: 10, imgSize: 125, nameSize: "text-sm", statSize: "text-[9px]" },
    lg: { w: 250, h: 370, side: 12, imgSize: 155, nameSize: "text-base", statSize: "text-[10px]" },
  };
  const s = sizeMap[size];

  const xpPercent = Math.round((currentXP / xpNeeded) * 100);

  return (
    <div
      className="relative group cursor-pointer"
      style={{ width: s.w + s.side, height: s.h + 4, perspective: "1000px" }}
      onClick={onClick}
    >
      <div
        className="relative transition-transform duration-500 group-hover:scale-[1.04]"
        style={{
          width: s.w + s.side,
          height: s.h,
          transformStyle: "preserve-3d",
          transform: "rotateY(-3deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: s.w,
            height: s.h,
            background: style.face,
            borderRadius: "12px",
            border: `2px solid ${style.border}`,
            boxShadow: style.glow,
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: "absolute", inset: 0,
              background: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,${style.patternOpacity}) 8px, rgba(255,255,255,${style.patternOpacity}) 16px)`,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "4px 8px", background: style.headerBg, position: "relative", zIndex: 5,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 9, letterSpacing: "0.08em" }}>
              2024-25
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {player.teamLogo && (
                <img src={player.teamLogo} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
              )}
              <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 9 }}>
                #{player.number || "—"}
              </span>
            </div>
          </div>

          <div style={{ position: "absolute", top: 22, left: 6, zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 20, lineHeight: 1, textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>
              {player.rating ? parseFloat(player.rating).toFixed(1) : "—"}
            </span>
            <span style={{
              background: style.labelBg, color: style.textAccent,
              fontWeight: 800, fontSize: 7, letterSpacing: "0.1em",
              padding: "2px 5px", borderRadius: 3,
            }}>
              {style.label}
            </span>
            <span style={{
              color: "#fff", fontWeight: 700, fontSize: 8,
              background: "rgba(0,0,0,0.4)", padding: "1px 4px", borderRadius: 2,
            }}>
              {posShort}
            </span>
          </div>

          <div style={{
            position: "absolute", top: 22, right: 6, zIndex: 5,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "rgba(0,0,0,0.35)", borderRadius: 4, padding: "3px 5px",
          }}>
            <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: 11 }}>Lv.{level}</span>
            <div style={{
              width: 28, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)", overflow: "hidden",
            }}>
              <div style={{
                width: `${xpPercent}%`, height: "100%", borderRadius: 2,
                background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
              }} />
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 6, fontWeight: 600 }}>
              {currentXP}/{xpNeeded}
            </span>
          </div>

          <div style={{
            position: "absolute",
            left: "50%", transform: "translateX(-50%)",
            top: 20, width: s.imgSize, height: s.imgSize + 10,
            zIndex: 3, overflow: "hidden", borderRadius: 8,
          }}>
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                style={{
                  width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center",
                  filter: "contrast(1.05) saturate(1.1)",
                }}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.3)",
              }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 36, fontWeight: 900 }}>
                  {player.name?.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5,
            background: "linear-gradient(0deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.4) 80%, transparent 100%)",
            padding: "30px 8px 6px 8px",
          }}>
            <h3
              className={`text-white font-black ${s.nameSize} text-center uppercase tracking-wider leading-tight`}
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
            >
              {player.lastname || player.name?.split(" ").slice(-1)[0] || "Unknown"}
            </h3>
            {player.firstname && (
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 8, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {player.firstname}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 8 }}>
                AGE <strong style={{ color: "#fff" }}>{player.age || "—"}</strong>
              </span>
              <span style={{ color: style.textAccent, fontWeight: 700, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {player.position || "Unknown"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 8 }}>
                {player.nationality?.substring(0, 3).toUpperCase() || ""}
              </span>
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
              marginTop: 5, padding: "3px 0",
            }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 7, marginRight: 2 }}>L5</span>
              {last5.map((score, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                }}>
                  <div style={{
                    width: size === "sm" ? 18 : size === "md" ? 22 : 26,
                    height: size === "sm" ? 16 : size === "md" ? 18 : 20,
                    borderRadius: 3,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: score >= 70 ? "rgba(34,197,94,0.3)" : score >= 40 ? "rgba(234,179,8,0.3)" : "rgba(239,68,68,0.3)",
                    border: `1px solid ${score >= 70 ? "rgba(34,197,94,0.4)" : score >= 40 ? "rgba(234,179,8,0.4)" : "rgba(239,68,68,0.4)"}`,
                  }}>
                    <span style={{
                      color: score >= 70 ? "#4ade80" : score >= 40 ? "#fbbf24" : "#f87171",
                      fontWeight: 800, fontSize: size === "sm" ? 8 : 9,
                    }}>
                      {Math.round(score * multiplier)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2,
              marginTop: 4, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
              {[
                { label: "APPS", value: player.appearances ?? 0 },
                { label: "GOALS", value: player.goals ?? 0 },
                { label: "AST", value: player.assists ?? 0 },
                { label: "MIN", value: player.minutes ? Math.round(player.minutes / 60) + "h" : "0" },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 6, display: "block", fontWeight: 600 }}>{label}</span>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 9 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.04) 100%)",
              zIndex: 10,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: 2,
            left: 0,
            width: s.side,
            height: s.h - 4,
            background: style.sideGradient,
            borderRadius: "4px 0 0 4px",
            zIndex: 1,
            transform: "skewY(2deg)",
            transformOrigin: "top right",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: s.side - 2,
            right: 0,
            height: s.side - 2,
            background: `linear-gradient(90deg, ${style.sideColor} 0%, ${style.sideColor}88 100%)`,
            borderRadius: "0 0 8px 4px",
            zIndex: 1,
            transform: "skewX(-2deg)",
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}

export { assignRarity, calculateLevel, getLevelMultiplier, POINTS_PER_LEVEL, LEVEL_BONUS, type CardRarity };
