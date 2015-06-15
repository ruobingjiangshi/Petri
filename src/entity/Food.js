var Cell = require('./Cell');

function Food() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    config = Array.prototype.slice.call(arguments)[4].config
	this.mass = Math.floor(Math.random() * (config.foodMassMax - config.foodMassMin)) + config.foodMassMin
    this.cellType = 1;
    this.size = Math.ceil(Math.sqrt(100 * this.mass));
}

module.exports = Food;
Food.prototype = new Cell();


Food.prototype.setColor = function(color) {
    this.color.r = Math.min(color.r*1.5, 255);
    this.color.b = Math.min(color.b*1.5, 255);
    this.color.g = Math.min(color.g*1.5, 255);
}

Food.prototype.getSize = function() {
    return this.size;
};

Food.prototype.calcMove = null; // Food has no need to move

// Main Functions

Food.prototype.sendUpdate = function() {
    // Whether or not to include this cell in the update packet
    if (this.moveEngineTicks == 0) {
        return false;
    }
    return true;
};

Food.prototype.onRemove = function(gameServer) {
    gameServer.currentFood--;
};

Food.prototype.onConsume = function(consumer,gameServer) {
    consumer.addMass(this.mass);
};
