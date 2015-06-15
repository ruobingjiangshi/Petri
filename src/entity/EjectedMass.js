var Cell = require('./Cell');

function EjectedMass() {
    Cell.apply(this, Array.prototype.slice.call(arguments));

    this.cellType = 3;
    this.size = Math.ceil(Math.sqrt(100 * this.mass));
}

module.exports = EjectedMass;
EjectedMass.prototype = new Cell();

EjectedMass.prototype.getSize = function() {
    return this.size;
};

EjectedMass.prototype.calcMove = null; // Only for player controlled movement

// Main Functions

EjectedMass.prototype.sendUpdate = function() {
    // Whether or not to include this cell in the update packet
    if (this.moveEngineTicks == 0) {
        return false;
    }
    return true;
}

EjectedMass.prototype.onRemove = function(gameServer) { 
    // Remove from list of ejected mass
    var index = gameServer.nodesEjected.indexOf(this);
    if (index != -1) {
        gameServer.nodesEjected.splice(index,1);
    }
};

EjectedMass.prototype.onConsume = function(consumer,gameServer) {
    // Adds mass to consumer
    consumer.speedModifier += gameServer.gameMode.ejectionBurden;
    consumer.addMass(this.mass);
};

EjectedMass.prototype.moveDone = function(gameServer) {
    // Add to list of ejected mass
    gameServer.nodesEjected.push(this);
};

