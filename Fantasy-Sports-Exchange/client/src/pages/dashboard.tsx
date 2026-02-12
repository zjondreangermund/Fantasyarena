import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import PlayerCard from "@/components/PlayerCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type PlayerCardWithPlayer, type Wallet, type Lineup } from "@shared/schema";
import { Trophy, Wallet as WalletIcon, TrendingUp, Star } from "lucide-react";
import { Link } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: wallet, isLoading: walletLoading } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
  });

  const { data: lineup, isLoading: lineupLoading } = useQuery<{
    lineup: Lineup;
    cards: PlayerCardWithPlayer[];
  }>({
    queryKey: ["/api/lineup"],
  });

  const { data: cards, isLoading: cardsLoading } = useQuery<
    PlayerCardWithPlayer[]
  >({
    queryKey: ["/api/cards"],
  });

  const totalScore = lineup?.cards?.reduce((sum, c) => {
    const scores = c.last5Scores as number[];
    return sum + (scores?.[scores.length - 1] || 0);
  }, 0) || 0;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-welcome">
              Welcome back, {user?.firstName || "Manager"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your squad and rise to the top
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-green-500/10 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                {walletLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p
                    className="text-xl font-bold text-foreground"
                    data-testid="text-balance"
                  >
                    ${wallet?.balance?.toFixed(2) || "0.00"}
                  </p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cards Owned</p>
                {cardsLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p
                    className="text-xl font-bold text-foreground"
                    data-testid="text-cards-count"
                  >
                    {cards?.length || 0}
                  </p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-yellow-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Game Score</p>
                <p
                  className="text-xl font-bold text-foreground"
                  data-testid="text-score"
                >
                  {totalScore}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Your Lineup
            </h2>
            <Link href="/collection">
              <Button variant="outline" size="sm" data-testid="link-view-collection">
                View Collection
              </Button>
            </Link>
          </div>

          {lineupLoading ? (
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-48 h-72 rounded-md" />
              ))}
            </div>
          ) : lineup?.cards && lineup.cards.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {lineup.cards.map((card) => (
                <PlayerCard key={card.id} card={card} size="md" />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No lineup set yet. Visit your collection to set one up.
              </p>
            </Card>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/marketplace">
              <Card className="p-4 hover-elevate cursor-pointer">
                <h3 className="font-medium text-foreground mb-1">Marketplace</h3>
                <p className="text-sm text-muted-foreground">
                  Browse and buy rare cards from other managers
                </p>
              </Card>
            </Link>
            <Link href="/wallet">
              <Card className="p-4 hover-elevate cursor-pointer">
                <h3 className="font-medium text-foreground mb-1">Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Deposit funds and manage your balance
                </p>
              </Card>
            </Link>
            <Link href="/collection">
              <Card className="p-4 hover-elevate cursor-pointer">
                <h3 className="font-medium text-foreground mb-1">Collection</h3>
                <p className="text-sm text-muted-foreground">
                  View all your cards and manage your lineup
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
