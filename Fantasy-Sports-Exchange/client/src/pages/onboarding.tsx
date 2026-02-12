import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PlayerCard from "@/components/PlayerCard";
import { type PlayerCardWithPlayer } from "@shared/schema";
import { Package, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { Skeleton } from "@/components/ui/skeleton";

type OnboardingStep = "packs" | "select" | "lineup";

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>("packs");
  const [currentPack, setCurrentPack] = useState(0);
  const [revealedPacks, setRevealedPacks] = useState<Set<number>>(new Set());
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());

  const { data: onboardingData, isLoading } = useQuery<{
    packs: PlayerCardWithPlayer[][];
    completed: boolean;
  }>({
    queryKey: ["/api/onboarding"],
  });

  const completeMutation = useMutation({
    mutationFn: async (cardIds: number[]) => {
      const res = await apiRequest("POST", "/api/onboarding/complete", { cardIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lineup"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
    },
  });

  const revealPack = (index: number) => {
    setRevealedPacks((prev) => new Set(prev).add(index));
  };

  const toggleCard = (cardId: number) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else if (next.size < 5) {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleComplete = useCallback(() => {
    const ids = Array.from(selectedCards);
    completeMutation.mutate(ids, {
      onSuccess: () => {
        setStep("lineup");
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#8b5cf6", "#3b82f6", "#eab308", "#10b981"],
          });
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 120,
              origin: { y: 0.4, x: 0.3 },
              colors: ["#8b5cf6", "#3b82f6", "#eab308"],
            });
          }, 300);
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 120,
              origin: { y: 0.4, x: 0.7 },
              colors: ["#10b981", "#3b82f6", "#eab308"],
            });
          }, 600);
        }, 400);
      },
    });
  }, [selectedCards, completeMutation]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-64 h-8" />
          <div className="flex gap-4">
            <Skeleton className="w-48 h-72 rounded-md" />
            <Skeleton className="w-48 h-72 rounded-md" />
            <Skeleton className="w-48 h-72 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!onboardingData) return null;

  const allCards = onboardingData.packs.flat();

  if (step === "packs") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome to FantasyFC
          </h1>
          <p className="text-muted-foreground">
            Open your 3 starter packs to discover your players
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {onboardingData.packs.map((pack, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              {revealedPacks.has(i) ? (
                <div className="flex gap-2">
                  {pack.map((card) => (
                    <PlayerCard key={card.id} card={card} size="sm" />
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => revealPack(i)}
                  className="w-36 h-52 rounded-md border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-2 hover-elevate active-elevate-2 transition-all"
                  data-testid={`button-open-pack-${i}`}
                >
                  <Package className="w-10 h-10 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Pack {i + 1}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {revealedPacks.size === 3 && (
          <Button
            onClick={() => setStep("select")}
            size="lg"
            data-testid="button-choose-players"
          >
            Choose Your Best 5 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    );
  }

  if (step === "select") {
    return (
      <div className="flex-1 flex flex-col items-center p-4 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Choose Your Starting 5
          </h1>
          <p className="text-muted-foreground">
            Select {5 - selectedCards.size} more player
            {5 - selectedCards.size !== 1 ? "s" : ""} for your lineup
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${i < selectedCards.size ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {allCards.map((card) => (
            <PlayerCard
              key={card.id}
              card={card}
              size="md"
              selectable
              selected={selectedCards.has(card.id)}
              onClick={() => toggleCard(card.id)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setStep("packs");
              setSelectedCards(new Set());
            }}
            data-testid="button-back-to-packs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button
            onClick={handleComplete}
            disabled={selectedCards.size !== 5 || completeMutation.isPending}
            size="lg"
            data-testid="button-confirm-lineup"
          >
            {completeMutation.isPending ? (
              "Confirming..."
            ) : (
              <>
                Confirm Lineup <Check className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="text-center mb-8">
        <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Your Squad is Ready!
        </h1>
        <p className="text-muted-foreground">
          Here's your starting lineup. Head to the marketplace to upgrade!
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {allCards
          .filter((c) => selectedCards.has(c.id))
          .map((card) => (
            <PlayerCard key={card.id} card={card} size="md" />
          ))}
      </div>

      <Button
        onClick={() => (window.location.href = "/")}
        size="lg"
        data-testid="button-go-to-dashboard"
      >
        Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
