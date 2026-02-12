import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type EplPlayer, type EplFixture, type EplInjury, type EplStanding } from "@shared/schema";
import {
  Trophy, Calendar, Users, AlertTriangle, Search, RefreshCw,
  Target, Clock, CheckCircle, Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PremierLeaguePage() {
  const { toast } = useToast();
  const [playerSearch, setPlayerSearch] = useState("");
  const [fixtureTab, setFixtureTab] = useState("upcoming");

  const { data: standings, isLoading: standingsLoading } = useQuery<EplStanding[]>({
    queryKey: ["/api/epl/standings"],
  });

  const { data: fixtures, isLoading: fixturesLoading } = useQuery<EplFixture[]>({
    queryKey: ["/api/epl/fixtures", fixtureTab],
    queryFn: async () => {
      const res = await fetch(`/api/epl/fixtures?status=${fixtureTab}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch fixtures");
      return res.json();
    },
  });

  const { data: players, isLoading: playersLoading } = useQuery<EplPlayer[]>({
    queryKey: ["/api/epl/players", playerSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (playerSearch) params.set("search", playerSearch);
      const res = await fetch(`/api/epl/players?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch players");
      return res.json();
    },
  });

  const { data: injuries, isLoading: injuriesLoading } = useQuery<EplInjury[]>({
    queryKey: ["/api/epl/injuries"],
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/epl/sync", { type: "all" });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/epl/standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/epl/fixtures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/epl/players"] });
      queryClient.invalidateQueries({ queryKey: ["/api/epl/injuries"] });
      toast({ title: data.message });
    },
    onError: (error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      NS: { label: "Upcoming", variant: "outline" },
      TBD: { label: "TBD", variant: "outline" },
      "1H": { label: "1st Half", variant: "destructive" },
      "2H": { label: "2nd Half", variant: "destructive" },
      HT: { label: "Half Time", variant: "secondary" },
      FT: { label: "Full Time", variant: "default" },
      AET: { label: "After ET", variant: "default" },
      PEN: { label: "Penalties", variant: "destructive" },
      PST: { label: "Postponed", variant: "secondary" },
      CANC: { label: "Cancelled", variant: "secondary" },
      LIVE: { label: "LIVE", variant: "destructive" },
    };
    const config = map[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-500" />
              Premier League Tracker
            </h1>
            <p className="text-muted-foreground text-sm">
              Live stats, fixtures, injuries & standings
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing..." : "Refresh Data"}
          </Button>
        </div>

        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="standings" className="flex items-center gap-1">
              <Trophy className="w-4 h-4" /> Standings
            </TabsTrigger>
            <TabsTrigger value="fixtures" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Fixtures
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-1">
              <Users className="w-4 h-4" /> Players
            </TabsTrigger>
            <TabsTrigger value="injuries" className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> Injuries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standings">
            {standingsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-md" />)}
              </div>
            ) : standings && standings.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">P</TableHead>
                        <TableHead className="text-center">W</TableHead>
                        <TableHead className="text-center">D</TableHead>
                        <TableHead className="text-center">L</TableHead>
                        <TableHead className="text-center">GF</TableHead>
                        <TableHead className="text-center">GA</TableHead>
                        <TableHead className="text-center">GD</TableHead>
                        <TableHead className="text-center font-bold">Pts</TableHead>
                        <TableHead className="hidden sm:table-cell">Form</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.map((team) => (
                        <TableRow key={team.teamId} className={
                          team.rank <= 4 ? "border-l-2 border-l-blue-500" :
                          team.rank === 5 ? "border-l-2 border-l-orange-500" :
                          team.rank >= 18 ? "border-l-2 border-l-red-500" : ""
                        }>
                          <TableCell className="font-medium text-muted-foreground">{team.rank}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {team.teamLogo && (
                                <img src={team.teamLogo} alt={team.teamName} className="w-6 h-6 object-contain" />
                              )}
                              <span className="font-medium text-sm">{team.teamName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">{team.played}</TableCell>
                          <TableCell className="text-center text-sm">{team.won}</TableCell>
                          <TableCell className="text-center text-sm">{team.drawn}</TableCell>
                          <TableCell className="text-center text-sm">{team.lost}</TableCell>
                          <TableCell className="text-center text-sm">{team.goalsFor}</TableCell>
                          <TableCell className="text-center text-sm">{team.goalsAgainst}</TableCell>
                          <TableCell className="text-center text-sm font-medium">
                            {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                          </TableCell>
                          <TableCell className="text-center font-bold text-lg">{team.points}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex gap-0.5">
                              {team.form?.split("").map((f, i) => (
                                <span key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                                  f === "W" ? "bg-green-500" : f === "D" ? "bg-yellow-500" : "bg-red-500"
                                }`}>
                                  {f}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-3 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm" /> Champions League</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded-sm" /> Europa League</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm" /> Relegation</div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No standings data yet. Click "Refresh Data" to sync.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="fixtures">
            <div className="flex gap-2 mb-4">
              {[
                { key: "upcoming", label: "Upcoming", icon: Clock },
                { key: "live", label: "Live", icon: Activity },
                { key: "finished", label: "Results", icon: CheckCircle },
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={fixtureTab === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFixtureTab(key)}
                >
                  <Icon className="w-4 h-4 mr-1" /> {label}
                </Button>
              ))}
            </div>

            {fixturesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}
              </div>
            ) : fixtures && fixtures.length > 0 ? (
              <div className="space-y-2">
                {fixtures.map((f) => (
                  <Card key={f.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{f.round}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatDate(f.matchDate)}</span>
                        {getStatusBadge(f.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        {f.homeTeamLogo && <img src={f.homeTeamLogo} alt="" className="w-7 h-7 object-contain" />}
                        <span className="font-medium text-sm">{f.homeTeam}</span>
                      </div>
                      <div className="px-4 text-center min-w-[80px]">
                        {f.homeGoals !== null && f.awayGoals !== null ? (
                          <span className="text-xl font-bold">{f.homeGoals} - {f.awayGoals}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">vs</span>
                        )}
                        {f.elapsed && f.status !== "FT" && (
                          <p className="text-xs text-red-500 font-medium">{f.elapsed}'</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="font-medium text-sm">{f.awayTeam}</span>
                        {f.awayTeamLogo && <img src={f.awayTeamLogo} alt="" className="w-7 h-7 object-contain" />}
                      </div>
                    </div>
                    {f.venue && (
                      <p className="text-xs text-muted-foreground mt-1 text-center">{f.venue}</p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {fixtureTab === "live" ? "No live matches right now" : "No fixture data yet. Click \"Refresh Data\" to sync."}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="players">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {playersLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}
              </div>
            ) : players && players.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">Pos</TableHead>
                        <TableHead className="text-center">Apps</TableHead>
                        <TableHead className="text-center">
                          <Target className="w-3 h-3 inline" /> Goals
                        </TableHead>
                        <TableHead className="text-center">Assists</TableHead>
                        <TableHead className="text-center hidden sm:table-cell">YC</TableHead>
                        <TableHead className="text-center hidden sm:table-cell">RC</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {p.photo && (
                                <img src={p.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                              )}
                              <div>
                                <span className="font-medium text-sm">{p.name}</span>
                                {p.nationality && (
                                  <p className="text-xs text-muted-foreground">{p.nationality}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {p.teamLogo && <img src={p.teamLogo} alt="" className="w-5 h-5 object-contain" />}
                              <span className="text-xs">{p.team}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">{p.position || "N/A"}</Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm">{p.appearances}</TableCell>
                          <TableCell className="text-center text-sm font-bold">{p.goals}</TableCell>
                          <TableCell className="text-center text-sm">{p.assists}</TableCell>
                          <TableCell className="text-center text-sm hidden sm:table-cell">
                            <span className="text-yellow-500">{p.yellowCards}</span>
                          </TableCell>
                          <TableCell className="text-center text-sm hidden sm:table-cell">
                            <span className="text-red-500">{p.redCards}</span>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {p.rating ? (
                              <Badge variant={parseFloat(p.rating) >= 7 ? "default" : "secondary"} className="text-xs">
                                {parseFloat(p.rating).toFixed(1)}
                              </Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {p.injured ? (
                              <Badge variant="destructive" className="text-xs">Injured</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-green-500 border-green-500">Fit</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No player data yet. Click "Refresh Data" to sync.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="injuries">
            {injuriesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}
              </div>
            ) : injuries && injuries.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {injuries.map((inj) => (
                        <TableRow key={inj.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {inj.playerPhoto && (
                                <img src={inj.playerPhoto} alt="" className="w-8 h-8 rounded-full object-cover" />
                              )}
                              <span className="font-medium text-sm">{inj.playerName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {inj.teamLogo && <img src={inj.teamLogo} alt="" className="w-5 h-5 object-contain" />}
                              <span className="text-sm">{inj.team}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="text-xs">{inj.type || "Unknown"}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{inj.reason || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No injury data yet. Click "Refresh Data" to sync.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
