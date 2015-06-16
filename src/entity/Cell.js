function Cell(nodeId, owner, position, mass, gameServer) {
    this.nodeId = nodeId;
    this.owner = owner; // playerTracker that owns this cell
    this.color = {r: 0, g: 255, b: 0};
    this.position = position;
    this.mass = mass; // Starting mass of the cell
    this.cellType = -1; // 0 = Player Cell, 1 = Food, 2 = Virus, 3 = Ejected Mass


    this.speedModifier = 0;
    
    this.spiked = 0; // If 1, then this cell has spikes around it

    this.killedBy; // Cell that ate this cell
    this.ignoreCollision = false;
    this.gameServer = gameServer;

    this.moveEngineTicks = 0; // Amount of times to loop the movement function
    this.moveEngineSpeed = 0;
    this.angle = 0; // Angle of movement
}

module.exports = Cell;

// Fields not defined by the constructor are considered private and need a getter/setter to access from a different class

Cell.prototype.getName = function() {
if (this.owner) {
        return this.owner.name;
    } else {
        return "";
    }
};

Cell.prototype.setColor = function(color) {
    this.color.r = color.r;
    this.color.b = color.b;
    this.color.g = color.g;
};

colorExceptions = {
    "wire":     {'r':  84, 'g':  50, 'b':  15},
    "ninja":    {'r':   0, 'g':   0, 'b':   0},
    "light":    {'r': 255, 'g': 255, 'b': 255},
    "grey goo": {'r': 127, 'g': 127, 'b': 127}
}

Cell.prototype.getColor = function() {
    if (this.owner && !this.owner.gameServer.gameMode.haveTeams) {
        if (this.owner.name.toLowerCase() in colorExceptions) {
            this.setColor(colorExceptions[this.owner.name.toLowerCase()]);
            this.owner.setColor(colorExceptions[this.owner.name.toLowerCase()]);
        }
    }
    return this.color;
};

Cell.prototype.getType = function() {
    return this.cellType;
};

Cell.prototype.getSize = function() {
    // Calculates radius based on cell mass
    return Math.ceil(Math.sqrt(100 * this.mass));
};

Cell.prototype.addMass = function(n) {
    this.mass = Math.min(this.mass + n,this.owner.gameServer.config.playerMaxMass);
};


Cell.prototype.getSpeed = function(gameServer) {
	// Old formula: 5 + (20 * (1 - (this.mass/(70+this.mass))));
	// Based on 50ms ticks. If updateMoveEngine interval changes, change 50 to new value
	// (should possibly have a config value for this?)
    if (!this.mass) {
        return 745.28 * 50 / 1000;
    }
    var speedmult = gameServer.gameMode.cellSpeedMultiplier;
    var speedmin = gameServer.gameMode.cellSpeedLowest;
    var speed = this.speedModifier > 0 ? Math.max(Math.min( 1.5 / (this.speedModifier * speedmult), 1), speedmin) : 1;
	return 745.28 * Math.pow(this.mass, -0.222) * speed * 50 / 1000;
}

Cell.prototype.setAngle = function(radians) {
    this.angle = radians;
};

Cell.prototype.getAngle = function() {
    return this.angle;
};

Cell.prototype.setMoveEngineData = function(speed, ticks) {
    this.moveEngineSpeed = speed;
    this.moveEngineTicks = ticks;
};

Cell.prototype.getMoveTicks = function() {
    return this.moveEngineTicks;
};

Cell.prototype.setCollisionOff = function(bool) {
    this.ignoreCollision = bool;
};

Cell.prototype.getCollision = function() {
    return this.ignoreCollision;
};

Cell.prototype.getEatingRange = function() {
    return 0; // 0 for ejected cells
};

Cell.prototype.getKiller = function() {
    return this.killedBy;
};

Cell.prototype.setKiller = function(cell) {
    this.killedBy = cell;
};

// Functions

Cell.prototype.collisionCheck = function(bottomY,topY,rightX,leftX) {
    // Collision checking
    if (this.position.y > bottomY) {
        return false;
    }

    if (this.position.y < topY) {
        return false;
    }

    if (this.position.x > rightX) {
        return false;
    }

    if (this.position.x < leftX) {
        return false;
    }

    return true;
};

Cell.prototype.visibleCheck = function(box,centerPos) {
    // Checks if this cell is visible to the player
    if (!this.mass) {
        return false;
    }
    return this.collisionCheck(box.bottomY,box.topY,box.rightX,box.leftX);
};

Cell.prototype.calcMove = function(x2, y2, gameServer) {
	var config = gameServer.config;
    // Get angle
    var deltaY = y2 - this.position.y;
    var deltaX = x2 - this.position.x;
    var angle = Math.atan2(deltaX,deltaY);

    // Distance between mouse pointer and cell
    var dist = Math.sqrt( Math.pow(x2 - this.position.x, 2) +  Math.pow(y2 - this.position.y, 2) );
    var speed = Math.min(this.getSpeed(gameServer),dist);
    var x1 = this.position.x + ( speed * Math.sin(angle) );
    var y1 = this.position.y + ( speed * Math.cos(angle) );

    // Collision check for other cells
    for (var i = 0; i < this.owner.cells.length;i++) {
        var cell = this.owner.cells[i];
        if (cell.speedModifier > 0) {
            cell.speedModifier--;
        }
        if ((this.nodeId == cell.nodeId) || (this.ignoreCollision)) {
            continue;
        }

        if ((cell.recombineTicks > 0) || (this.recombineTicks > 0)) {
            // Cannot recombine - Collision with your own cells
            var dist = Math.sqrt( Math.pow(cell.position.x - this.position.x, 2) +  Math.pow(cell.position.y - this.position.y, 2) );
            var collisionDist = cell.getSize() + this.getSize(); // Minimum distance between the 2 cells

            // Calculations
            if (dist < collisionDist) { // Collided
                // The moving cell pushes the colliding cell
                var newDeltaY = cell.position.y - y1;
                var newDeltaX = cell.position.x - x1;
                var newAngle = Math.atan2(newDeltaX,newDeltaY);

                var move = collisionDist - dist + 5;

                cell.position.x = cell.position.x + ( move * Math.sin(newAngle) ) >> 0;
                cell.position.y = cell.position.y + ( move * Math.cos(newAngle) ) >> 0;
            }
        }
    }

    // Team collision
    if (gameServer.gameMode.haveTeams) {
        var team = this.owner.getTeam();

        // Find team
        for (var i = 0; i < this.owner.visibleNodes.length;i++) {
            // Only collide with player cells
            var check = this.owner.visibleNodes[i];

            if ((check.getType() != 0) || (this.owner == check.owner)){
                continue;
            }

            if (check.owner.getTeam() == team) {
                // Collision with teammates
                var dist = Math.sqrt( Math.pow(check.position.x - this.position.x, 2) +  Math.pow(check.position.y - this.position.y, 2) );
                var collisionDist = check.getSize() + this.getSize(); // Minimum distance between the 2 cells

                // Calculations
                if (dist < collisionDist) { // Collided
                    // The moving cell pushes the colliding cell
                    var newDeltaY = check.position.y - y1;
                    var newDeltaX = check.position.x - x1;
                    var newAngle = Math.atan2(newDeltaX,newDeltaY);

                    var move = collisionDist - dist;

                    check.position.x = check.position.x + ( move * Math.sin(newAngle) ) >> 0;
                    check.position.y = check.position.y + ( move * Math.cos(newAngle) ) >> 0;
                }
            }
        }
    }
    
    gameServer.gameMode.onCellMove(x1,y1,this);

    // Check to ensure we're not passing the world border
    if (x1 < config.borderLeft) {
        x1 = config.borderLeft;
    }
    if (x1 > config.borderRight) {
        x1 = config.borderRight;
    }
    if (y1 < config.borderTop) {
        y1 = config.borderTop;
    }
    if (y1 > config.borderBottom) {
        y1 = config.borderBottom;
    }

    this.position.x = x1 >> 0;
    this.position.y = y1 >> 0;
};

Cell.prototype.calcMovePhys = function(gameServer) {
    var config = gameServer.config;
    // Movement for ejected cells
    var X = this.position.x + ( this.moveEngineSpeed * Math.sin(this.angle) );
    var Y = this.position.y + ( this.moveEngineSpeed * Math.cos(this.angle) );

    // Movement engine
    this.moveEngineSpeed *= .75; // Decaying speed
    this.moveEngineTicks--;

    // Border check - Bouncy physics
    var radius = 40;
    if ((this.position.x - radius) < config.borderLeft) {
        // Flip angle horizontally - Left side
        this.angle = Math.abs(Math.PI - this.angle);
        X = config.borderLeft + radius;
    }
    if ((this.position.x + radius) > config.borderRight) {
        // Flip angle horizontally - Right side
        this.angle = 1 - this.angle;
        X = config.borderRight - radius;
    }
    if ((this.position.y - radius) < config.borderTop) {
        // Flip angle vertically - Top side
        this.angle = Math.abs(this.angle - Math.PI);
        Y = config.borderTop + radius;
    }
    if ((this.position.y + radius) > config.borderBottom) {
        // Flip angle vertically - Bottom side
        this.angle = Math.abs(this.angle - Math.PI);
        Y = config.borderBottom - radius;
    }

    var A = {
        'x': this.position.x >> 0,
        'y': this.position.y >> 0
    }
    var B = {
        'x': X >> 0,
        'y': Y >> 0
    }

    // Set position
    this.position.x = X >> 0;
    this.position.y = Y >> 0;

    var list = this.predatorsAlongPath(A, B, gameServer);
    if (list.length) {
        var check = this.closestPredator(A, list);

        // Consume effect
        if (!check.getType()) {
            this.onConsume(check,gameServer);
        }
        else if (check.getType() == 2) {
            check.feed(this, gameServer);
        }

        // Remove cell
        this.setKiller(check);
        gameServer.removeNode(this);
    }
};

// Helper functions

// thanks, stackoverflow http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) return dist2(p, v);
  if (t > 1) return dist2(p, w);
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

Cell.prototype.predatorsAlongPath = function(A, B, gameServer) { // Modified version of GameServer.getCellsInRange
    var list = new Array();

    if (A.x === B.x && A.y === B.y) {
        return list;
    }

    var len = gameServer.nodesVirus.length + gameServer.nodesPlayer.length - 1;
    for (var i = 0;i < len;i++) {

        var check = i < gameServer.nodesVirus.length ? gameServer.nodesVirus[i]: gameServer.nodesPlayer[i - gameServer.nodesVirus.length];

        if (typeof check === 'undefined') {
            continue;
        }

        // Can't eat itself
        if (this.nodeId == check.nodeId) {
            continue;
        }

        if (!check.getType() || (check.getType() == 2 && this.getType() == 3)) { // only affecting players and, if this is an ejection, viruses
            var multiplier = 1;
            if (this.getType() == 2) {
                multiplier = 1.33;
            }
            if (this.mass * multiplier > check.mass) {
                continue;
            }
        }
        var C = check.position;
        var d = distToSegment(C, A, B)
        var eatingRange = check.getSize() - this.getEatingRange();
        if (d > eatingRange) {
            continue;
        }
        list.push(check);
    }
    return list;
}

Cell.prototype.closestPredator = function(point, list) { // Modified version of BotPlayer.findNearest   
    // Check for nearest cell in list
    var shortest = list[0];
    var shortestDist = this.getDist(point,shortest.position);
    for (i = 1; i < list.length; i++) {
        var check = list[i];
        var dist = this.getDist(point,check.position); 
        if (shortestDist > dist) {
            shortest = check;
            shortestDist = dist;
        }
    }
    return shortest;
}

Cell.prototype.getDist = function(A, B) {
    var xs = B.x - A.x;
    xs = xs * xs;

    var ys = B.y - A.y;
    ys = ys * ys;

    return Math.sqrt( xs + ys );
}

// Override these

Cell.prototype.sendUpdate = function() {
    // Whether or not to include this cell in the update packet
    return true;
}

Cell.prototype.onConsume = function(consumer,gameServer) {
    // Called when the cell is consumed
};

Cell.prototype.onAdd = function(gameServer) {
    // Called when this cell is added to the world
};

Cell.prototype.onRemove = function(gameServer) {
    // Called when this cell is removed
};

Cell.prototype.moveDone = function(gameServer) {
    // Called when this cell finished moving with the auto move engine
};

