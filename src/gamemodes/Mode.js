function Mode() {
    this.ID = -1;
    this.name = "Blank";
    this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
    this.packetLB = 49; // Packet id for leaderboard packet (49 = List, 50 = Pie chart)
    this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams
    
    this.cellSpeedLowest = 0.1; // The lowest possible ejections can lower speed. If it's set to 1, ejections will not slow players.
    this.cellSpeedMultiplier = 0.1; // Lower
    this.ejectionBurden = 40; // How long an ejection will slow you for (in 50ms ticks)
    this.ejectionBurdenRelease = 20; // How long firing an ejection will take off your slowness (in 50ms ticks)

    this.rankOne; // Current player that has the highest score
}

module.exports = Mode;

// Override these

Mode.prototype.onServerInit = function(gameServer) {
    // Called when the server starts
}

Mode.prototype.onPlayerInit = function(player) {
    // Called after a player object is constructed
}

Mode.prototype.onCellAdd = function(cell) {
    // Called when a player cell is added
}

Mode.prototype.onCellRemove = function(cell) {
	// Called when a player cell is removed
}

Mode.prototype.updateLB = function(gameServer) {
    // Called when the leaderboard update function is called
}
