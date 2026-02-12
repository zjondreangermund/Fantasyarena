import { type EplPlayer } from "@shared/schema";

type CardRarity = "common" | "rare" | "unique" | "epic" | "legendary";

const rarityStyles: Record<CardRarity, {
  bg: string;
  border: string;
  glow: string;
  label: string;
  labelBg: string;
  textAccent: string;
  headerBg: string;
  patternOpacity: string;
}> = {
  common: {
    bg: "linear-gradient(160deg, #8e9aaf 0%, #b8c4d4 30%, #a0aec0 60%, #8e9aaf 100%)",
    border: "rgba(180,195,215,0.6)",
    glow: "0 0 20px rgba(160,174,192,0.3)",
    label: "COMMON",
    labelBg: "rgba(120,140,160,0.8)",
    textAccent: "#e2e8f0",
    headerBg: "linear-gradient(135deg, rgba(120,140,160,0.9) 0%, rgba(160,174,192,0.8) 100%)",
    patternOpacity: "0.05",
  },
  rare: {
    bg: "linear-gradient(160deg, #991b1b 0%, #dc2626 30%, #ef4444 50%, #dc2626 70%, #991b1b 100%)",
    border: "rgba(239,68,68,0.7)",
    glow: "0 0 30px rgba(239,68,68,0.4), 0 0 60px rgba(220,38,38,0.2)",
    label: "RARE",
    labelBg: "rgba(185,28,28,0.9)",
    textAccent: "#fecaca",
    headerBg: "linear-gradient(135deg, rgba(153,27,27,0.9) 0%, rgba(220,38,38,0.8) 100%)",
    patternOpacity: "0.08",
  },
  unique: {
    bg: "linear-gradient(160deg, #7c3aed 0%, #a855f7 20%, #ec4899 40%, #f97316 60%, #eab308 80%, #22c55e 100%)",
    border: "rgba(168,85,247,0.7)",
    glow: "0 0 35px rgba(168,85,247,0.4), 0 0 70px rgba(236,72,153,0.2)",
    label: "UNIQUE",
    labelBg: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    textAccent: "#e9d5ff",
    headerBg: "linear-gradient(135deg, rgba(124,58,237,0.9) 0%, rgba(236,72,153,0.8) 100%)",
    patternOpacity: "0.1",
  },
  epic: {
    bg: "linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 50%, #1a1a2e 70%, #0a0a0a 100%)",
    border: "rgba(100,100,140,0.6)",
    glow: "0 0 30px rgba(100,100,180,0.3), 0 0 60px rgba(50,50,100,0.2)",
    label: "EPIC",
    labelBg: "linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)",
    textAccent: "#c4b5fd",
    headerBg: "linear-gradient(135deg, rgba(15,15,40,0.95) 0%, rgba(45,45,90,0.9) 100%)",
    patternOpacity: "0.08",
  },
  legendary: {
    bg: "linear-gradient(160deg, #92400e 0%, #d97706 20%, #fbbf24 40%, #f59e0b 60%, #d97706 80%, #92400e 100%)",
    border: "rgba(251,191,36,0.7)",
    glow: "0 0 40px rgba(251,191,36,0.5), 0 0 80px rgba(245,158,11,0.3)",
    label: "LEGENDARY",
    labelBg: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
    textAccent: "#fef3c7",
    headerBg: "linear-gradient(135deg, rgba(146,64,14,0.9) 0%, rgba(217,119,6,0.8) 100%)",
    patternOpacity: "0.12",
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
    Goalkeeper: "GK",
    Defender: "DEF",
    Midfielder: "MID",
    Attacker: "FWD",
  };
  return map[pos] || pos.substring(0, 3).toUpperCase();
}

interface EPLPlayerCardProps {
  player: EplPlayer;
  size?: "sm" | "md" | "lg";
  forceRarity?: CardRarity;
  onClick?: () => void;
  animate?: boolean;
}

export default function EPLPlayerCard({
  player,
  size = "md",
  forceRarity,
  onClick,
  animate = false,
}: EPLPlayerCardProps) {
  const rarity = forceRarity || assignRarity(player);
  const style = rarityStyles[rarity];
  const posShort = getPositionShort(player.position);

  const sizeMap = {
    sm: { w: 160, h: 230, imgH: 110, fontSize: "text-xs", nameFontSize: "text-sm" },
    md: { w: 200, h: 290, imgH: 140, fontSize: "text-xs", nameFontSize: "text-base" },
    lg: { w: 240, h: 350, imgH: 170, fontSize: "text-sm", nameFontSize: "text-lg" },
  };
  const s = sizeMap[size];

  return (
    <div
      className={`relative group cursor-pointer ${animate ? "animate-float" : ""}`}
      style={{
        width: s.w,
        height: s.h,
        perspective: "800px",
      }}
      onClick={onClick}
    >
      <div
        className="relative w-full h-full rounded-xl overflow-hidden transition-all duration-500 group-hover:scale-105"
        style={{
          background: style.bg,
          border: `2px solid ${style.border}`,
          boxShadow: style.glow,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,${style.patternOpacity}) 10px, rgba(255,255,255,${style.patternOpacity}) 20px)`,
          }}
        />

        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 z-10"
          style={{ background: style.headerBg }}
        >
          <div className="flex items-center gap-1">
            <span className="text-white/90 font-bold text-[10px] tracking-wider">2024-25</span>
          </div>
          <div className="flex items-center gap-1">
            {player.teamLogo && (
              <img src={player.teamLogo} alt="" className="w-4 h-4 object-contain" />
            )}
            <span className="text-white/80 font-semibold text-[10px]">
              #{player.number || "—"}
            </span>
          </div>
        </div>

        <div className="absolute top-7 left-2 z-10 flex flex-col items-center gap-0.5">
          <span className="text-white font-black text-xl leading-none drop-shadow-lg">
            {player.rating ? parseFloat(player.rating).toFixed(1) : "—"}
          </span>
          <span
            className="font-bold text-[9px] tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: style.labelBg, color: style.textAccent }}
          >
            {style.label}
          </span>
        </div>

        <div
          className="absolute top-7 right-2 z-10 flex flex-col items-center gap-0.5 px-1.5 py-1 rounded"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <span className="text-white/90 font-bold text-[10px]">{posShort}</span>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 z-5"
          style={{
            top: 28,
            width: s.imgH + 20,
            height: s.imgH + 20,
          }}
        >
          <div
            className="w-full h-full rounded-lg overflow-hidden flex items-end justify-center"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)",
              border: `1px solid ${style.border}`,
            }}
          >
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                className="w-full h-full object-cover object-top"
                style={{ filter: "contrast(1.05) saturate(1.1)" }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/20">
                <span className="text-white/40 text-3xl font-bold">
                  {player.name?.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{
            background: "linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)",
            padding: "40px 10px 10px 10px",
          }}
        >
          <h3
            className={`text-white font-black ${s.nameFontSize} leading-tight text-center tracking-wide uppercase`}
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
          >
            {player.lastname || player.name?.split(" ").slice(-1)[0] || "Unknown"}
          </h3>
          {player.firstname && (
            <p className="text-white/60 text-[10px] text-center uppercase tracking-wider">
              {player.firstname}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <span className="text-white/60 text-[10px]">AGE</span>
              <span className="text-white font-bold text-[11px]">{player.age || "—"}</span>
            </div>
            <div className="text-center">
              <span className={`font-bold ${s.fontSize} uppercase tracking-wider`} style={{ color: style.textAccent }}>
                {player.position || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/60 text-[10px]">{player.nationality?.substring(0, 3).toUpperCase() || ""}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-white/10">
            <div className="text-center">
              <span className="text-white/50 text-[8px] block">APPS</span>
              <span className="text-white font-bold text-[11px]">{player.appearances ?? 0}</span>
            </div>
            <div className="text-center">
              <span className="text-white/50 text-[8px] block">GOALS</span>
              <span className="text-white font-bold text-[11px]">{player.goals ?? 0}</span>
            </div>
            <div className="text-center">
              <span className="text-white/50 text-[8px] block">AST</span>
              <span className="text-white font-bold text-[11px]">{player.assists ?? 0}</span>
            </div>
            <div className="text-center">
              <span className="text-white/50 text-[8px] block">MIN</span>
              <span className="text-white font-bold text-[11px]">{player.minutes ? Math.round(player.minutes / 60) + "h" : "0"}</span>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
          }}
        />
      </div>
    </div>
  );
}

export { assignRarity, type CardRarity };
