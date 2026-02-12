import Card3D from "./Card3D";
import { useSorarePlayer } from "@/hooks/use-sorare";
import { type PlayerCardWithPlayer } from "@shared/schema";

interface PlayerCardProps {
  card: PlayerCardWithPlayer;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  showPrice?: boolean;
  sorareImageUrl?: string | null;
}

function splitPlayerName(name: string): { firstName: string; lastName: string } | null {
  if (!name || name.includes(".")) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return null;
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function PlayerCard(props: PlayerCardProps) {
  const nameParts = props.card.player?.name ? splitPlayerName(props.card.player.name) : null;
  const { data: sorareData } = useSorarePlayer(
    nameParts?.firstName,
    nameParts?.lastName
  );

  const sorareImage = props.sorareImageUrl || sorareData?.imageUrl || null;

  return <Card3D {...props} sorareImageUrl={sorareImage} />;
}
