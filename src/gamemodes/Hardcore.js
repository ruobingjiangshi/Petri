var Mode = require('./Mode');

function Hardcore() {
    Mode.apply(this, Array.prototype.slice.call(arguments));
	
    this.ID = 2;
    this.name = "Hardcore";
    this.dead = [];
}

module.exports = Hardcore;
Hardcore.prototype = new Mode();

// Gamemode Specific Functions

Hardcore.prototype.leaderboardAddSort = function(player,leaderboard) {
    // Adds the player and sorts the leaderboard
    var len = leaderboard.length - 1;
    var loop = true;
    while ((len >= 0) && (loop)) {
        // Start from the bottom of the leaderboard
        if (player.getScore(false) <= leaderboard[len].getScore(false)) {
            leaderboard.splice(len + 1, 0, player);
            loop = false; // End the loop if a spot is found
        }
        len--;
    }
    if (loop) {
        // Add to top of the list because no spots were found
        leaderboard.splice(0, 0,player);
    }
}

Hardcore.prototype.checkForWinner = function(gameServer) {
    var deadplayercount = 0;
    var playercount = 0;
    for (var i = 0; i < gameServer.clients.length; i++) {
        var client = gameServer.clients[i].playerTracker;
        if ('_socket' in client.socket) {
            playercount++;
            if (this.dead.indexOf(client.socket._socket.remoteAddress) != -1) {
                deadplayercount++;
            }
        }
    }
    if (playercount-deadplayercount < 2) {
        console.log("[Game] Refreshing dead player list.");
        for (var i = 0; i < gameServer.clients.length; i++) {
            var client = gameServer.clients[i].playerTracker;
            for (var j = 0; j < client.cells.length; j++) {
                var cell = client.cells[j];
                if (!cell.mass) {
                    cell.onRemove();
                }
            }
        }
        this.dead = [];
    }
}

// Override

Hardcore.prototype.onCellAdd = function(cell) {
    if ('_socket' in cell.owner.socket) {
        if (this.dead.indexOf(cell.owner.socket._socket.remoteAddress) != -1) {
            cell.mass = 0;
        }
    }
}

Hardcore.prototype.onCellRemove = function(cell) {
    if (cell.owner.cells.length == 0) {
        if ('_socket' in cell.owner.socket) {
            if (cell.owner.socket._socket) {
                this.dead.push(cell.owner.socket._socket.remoteAddress);
            }
        }
    }
    this.checkForWinner(cell.owner.gameServer);
}

Hardcore.prototype.updateLB = function(gameServer) {
	var lb = gameServer.leaderboard;
	// Loop through all clients
	for (var i = 0; i < gameServer.clients.length; i++) {
        if (typeof gameServer.clients[i] == "undefined") {
            continue;
        }

        var player = gameServer.clients[i].playerTracker;
        var playerScore = player.getScore(true);
        if (player.cells.length <= 0 || !player.cells[0].mass) {
            continue;
        }
        
        if (lb.length == 0) {
            // Initial player
            lb.push(player);
            continue;
        } else if (lb.length < 10) {
            this.leaderboardAddSort(player,lb);
        } else {
            // 10 in leaderboard already
            if (playerScore > lb[9].getScore(false)) {
                lb.pop();
                this.leaderboardAddSort(player,lb);
            }
        }
    }
	
	this.rankOne = lb[0];
}

