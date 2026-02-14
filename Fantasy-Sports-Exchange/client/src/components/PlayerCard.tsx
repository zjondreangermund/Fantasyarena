import MetalPlayerCard from "./MetalPlayerCard";
import { type PlayerCardWithPlayer } from "../../../shared/schema";

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
  return (
    <div 
      onClick={props.onClick} 
      className={`${props.selectable ? 'cursor-pointer' : ''} ${props.selected ? 'ring-4 ring-primary rounded-xl' : ''} transition-all`}
    >
      <MetalPlayerCard card={props.card} />
    </div>
  );
}
