  // FIX: Route to provide data to the Player Cards tab
  app.get("/api/players", async (_req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error: any) {
      console.error("Failed to fetch players:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Fetch specific player details (for modals/profiles)
  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(Number(req.params.id));
      if (!player) return res.status(404).json({ message: "Player not found" });
      res.json(player);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching player" });
    }
  });

  return httpServer;
}
