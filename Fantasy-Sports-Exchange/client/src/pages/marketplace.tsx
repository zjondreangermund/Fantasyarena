import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PlayerCard from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { type PlayerCardWithPlayer, type Wallet } from "@shared/schema";
import { Search, Filter, ShoppingCart, Tag, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";

export default function MarketplacePage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [buyCard, setBuyCard] = useState<PlayerCardWithPlayer | null>(null);
  const [sellCard, setSellCard] = useState<PlayerCardWithPlayer | null>(null);
  const [sellPrice, setSellPrice] = useState("");

  const { data: listings, isLoading } = useQuery<PlayerCardWithPlayer[]>({
    queryKey: ["/api/marketplace"],
  });

  const { data: myCards } = useQuery<PlayerCardWithPlayer[]>({
    queryKey: ["/api/cards"],
  });

  const { data: wallet } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
  });

  const buyMutation = useMutation({
    mutationFn: async (cardId: number) => {
      const res = await apiRequest("POST", "/api/marketplace/buy", { cardId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      setBuyCard(null);
      toast({ title: "Card purchased!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async ({ cardId, price }: { cardId: number; price: number }) => {
      const res = await apiRequest("POST", "/api/marketplace/sell", { cardId, price });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      setSellCard(null);
      setSellPrice("");
      toast({ title: "Card listed for sale!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredListings = listings?.filter((card) => {
    const matchesSearch =
      !search ||
      card.player?.name?.toLowerCase().includes(search.toLowerCase()) ||
      card.player?.team?.toLowerCase().includes(search.toLowerCase());
    const matchesRarity = rarityFilter === "all" || card.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  const sellableCards = myCards?.filter(
    (c) => c.rarity !== "common" && !c.forSale,
  );

  const rarityFilters = [
    { value: "all", label: "All" },
    { value: "rare", label: "Rare" },
    { value: "unique", label: "Unique" },
    { value: "legendary", label: "Legendary" },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
            <p className="text-muted-foreground text-sm">
              Buy and sell rare player cards
            </p>
          </div>
          {sellableCards && sellableCards.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setSellCard(sellableCards[0])}
              data-testid="button-sell-card"
            >
              <Tag className="w-4 h-4 mr-1" /> Sell a Card
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {rarityFilters.map((f) => (
              <Button
                key={f.value}
                variant={rarityFilter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setRarityFilter(f.value)}
                data-testid={`button-filter-${f.value}`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-48 h-72 rounded-md" />
            ))}
          </div>
        ) : filteredListings && filteredListings.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {filteredListings.map((card) => (
              <div key={card.id} className="relative">
                <PlayerCard
                  card={card}
                  size="md"
                  showPrice
                  selectable
                  onClick={() => setBuyCard(card)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No cards currently listed on the marketplace.
            </p>
          </Card>
        )}
      </div>

      <Dialog open={!!buyCard} onOpenChange={() => setBuyCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          {buyCard && (
            <div className="flex flex-col items-center gap-4 py-4">
              <PlayerCard card={buyCard} size="md" showPrice />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Your balance: ${wallet?.balance?.toFixed(2) || "0.00"}
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  Price: ${buyCard.price?.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyCard(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => buyCard && buyMutation.mutate(buyCard.id)}
              disabled={buyMutation.isPending}
              data-testid="button-confirm-buy"
            >
              {buyMutation.isPending ? "Buying..." : "Buy Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sellCard} onOpenChange={() => setSellCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell a Card</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose a card and set your price. Common cards cannot be sold.
            </p>
            {sellableCards && sellableCards.length > 0 && (
              <>
                <div className="flex flex-wrap gap-3 mb-4 max-h-60 overflow-auto">
                  {sellableCards.map((c) => (
                    <div
                      key={c.id}
                      className={`cursor-pointer transition-all ${sellCard?.id === c.id ? "ring-2 ring-primary rounded-md" : ""}`}
                      onClick={() => setSellCard(c)}
                    >
                      <PlayerCard card={c} size="sm" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Set price..."
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    min="0.01"
                    step="0.01"
                    data-testid="input-sell-price"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSellCard(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                sellCard &&
                sellMutation.mutate({
                  cardId: sellCard.id,
                  price: parseFloat(sellPrice),
                })
              }
              disabled={
                !sellCard ||
                !sellPrice ||
                parseFloat(sellPrice) <= 0 ||
                sellMutation.isPending
              }
              data-testid="button-confirm-sell"
            >
              {sellMutation.isPending ? "Listing..." : "List for Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
