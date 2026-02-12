import { type PlayerCardWithPlayer } from "@shared/schema";
import { Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const rarityConfig = {
  common: {
    gradient: "from-zinc-600 via-zinc-500 to-zinc-600",
    border: "border-zinc-500/40",
    label: "Common",
    labelBg: "bg-zinc-600",
    accent: "text-zinc-300",
    slabBg: "#b0b0b0",
  },
  rare: {
    gradient: "from-blue-700 via-blue-500 to-blue-700",
    border: "border-blue-400/50",
    label: "Rare",
    labelBg: "bg-blue-600",
    accent: "text-blue-300",
    slabBg: "#2563eb",
  },
  unique: {
    gradient: "from-purple-700 via-fuchsia-500 to-purple-700",
    border: "border-purple-400/50",
    label: "Unique",
    labelBg: "bg-purple-600",
    accent: "text-purple-300",
    slabBg: "#7c3aed",
  },
  epic: {
    gradient: "from-slate-900 via-indigo-950 to-slate-900",
    border: "border-indigo-400/40",
    label: "Epic",
    labelBg: "bg-indigo-900",
    accent: "text-indigo-300",
    slabBg: "#1e1b4b",
  },
  legendary: {
    gradient: "from-amber-700 via-yellow-400 to-amber-700",
    border: "border-yellow-400/60",
    label: "Legendary",
    labelBg: "bg-gradient-to-r from-amber-600 to-yellow-500",
    accent: "text-yellow-300",
    slabBg: "#d97706",
  },
};

function ScoreBar({ scores }: { scores: number[] }) {
  return (
    <div className="flex items-end gap-0.5 h-6" data-testid="score-bar">
      {scores.map((score, i) => (
        <div
          key={i}
          className="w-3 rounded-sm transition-all"
          style={{
            height: `${Math.max(15, (score / 100) * 100)}%`,
            backgroundColor:
              score >= 70
                ? "hsl(150, 60%, 45%)"
                : score >= 40
                  ? "hsl(45, 93%, 47%)"
                  : "hsl(0, 72%, 51%)",
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
  const rarity = rarityConfig[card.rarity];
  const sizeClasses = {
    sm: "w-36 h-52",
    md: "w-48 h-72",
    lg: "w-56 h-80",
  };

  const imageIndex = ((card.playerId - 1) % 6) + 1;
  const imageUrl = card.player?.imageUrl || `/images/player-${imageIndex}.png`;

  return (
    <div
      className={`card-slab ${sizeClasses[size]} ${selectable ? "hover:scale-105" : ""} ${selected ? "scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
      style={{ background: rarity.slabBg, perspective: "600px" }}
      onClick={onClick}
      data-testid={`player-card-${card.id}`}
    >
      <div
        className={`relative overflow-hidden rounded-xl ${rarity.border} border-2 h-full bg-gradient-to-b ${rarity.gradient}`}
        style={{
          boxShadow: "inset 0 0 15px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 z-10" />

        <img
          src={imageUrl}
          alt={card.player?.name || "Player"}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5)) drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
          }}
        />

        <div className="absolute top-1.5 left-1.5 z-20 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-lg leading-none drop-shadow-lg">
              {card.player?.overall || 0}
            </span>
          </div>
          <span className="text-white/80 text-[10px] font-semibold uppercase tracking-wider drop-shadow">
            {card.player?.position}
          </span>
        </div>

        <div className="absolute top-1.5 right-1.5 z-20">
          <Badge
            className={`${rarity.labelBg} text-white text-[9px] px-1.5 py-0 border-0 no-default-hover-elevate no-default-active-elevate`}
          >
            {rarity.label}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 p-2">
          <h3
            className="text-white font-bold text-sm truncate"
            style={{
              textShadow: "0 2px 0 rgba(0,0,0,0.7), 0 -1px 0 rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.4)",
            }}
          >
            {card.player?.name || "Unknown"}
          </h3>
          <p
            className="text-white/70 text-[10px] truncate"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
          >
            {card.player?.team} &middot; {card.player?.nationality}
          </p>

          <div className="flex items-center justify-between mt-1.5 gap-1">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-white/90 text-[10px] font-medium">
                Lv.{card.level}
              </span>
            </div>
            <ScoreBar scores={card.last5Scores as number[]} />
          </div>

          {showPrice && card.forSale && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-green-400 text-xs font-bold">
                ${card.price?.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="absolute -top-1 -right-1 z-30 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <Shield className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
