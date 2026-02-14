import PlayerCard from "./threeplayercards";
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

export default function PlayerCard(props: PlayerCardProps) {
  return <Card3D {...props} />;
}
