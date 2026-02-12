import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { type Wallet, type Transaction } from "@shared/schema";
import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  ShoppingCart,
  DollarSign,
  Plus,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";

export default function WalletPage() {
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");

  const { data: wallet, isLoading: walletLoading } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
  });

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/wallet/deposit", { amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setDepositAmount("");
      toast({ title: "Deposit successful!" });
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

  const presetAmounts = [10, 25, 50, 100];

  const txTypeConfig: Record<string, { icon: typeof ArrowDownCircle; color: string; label: string }> = {
    deposit: { icon: ArrowDownCircle, color: "text-green-500", label: "Deposit" },
    withdrawal: { icon: ArrowUpCircle, color: "text-red-500", label: "Withdrawal" },
    purchase: { icon: ShoppingCart, color: "text-blue-500", label: "Purchase" },
    sale: { icon: DollarSign, color: "text-green-500", label: "Sale" },
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Wallet</h1>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-md bg-green-500/10 flex items-center justify-center">
              <WalletIcon className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              {walletLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-3xl font-bold text-foreground" data-testid="text-wallet-balance">
                  ${wallet?.balance?.toFixed(2) || "0.00"}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Deposit Funds
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(amount.toString())}
                  className={`toggle-elevate ${depositAmount === amount.toString() ? "toggle-elevated" : ""}`}
                  data-testid={`button-preset-${amount}`}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Custom amount..."
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="pl-9"
                  data-testid="input-deposit-amount"
                />
              </div>
              <Button
                onClick={() =>
                  depositMutation.mutate(parseFloat(depositAmount))
                }
                disabled={
                  !depositAmount ||
                  parseFloat(depositAmount) <= 0 ||
                  depositMutation.isPending
                }
                data-testid="button-deposit"
              >
                <Plus className="w-4 h-4 mr-1" />
                {depositMutation.isPending ? "Processing..." : "Deposit"}
              </Button>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Transaction History
          </h2>

          {txLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const config = txTypeConfig[tx.type] || txTypeConfig.deposit;
                const TxIcon = config.icon;
                const isPositive = tx.type === "deposit" || tx.type === "sale";
                return (
                  <Card key={tx.id} className="p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center ${config.color} bg-current/10`}>
                      <TxIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.description || config.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}
                    >
                      {isPositive ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No transactions yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
