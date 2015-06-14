var Cell = require('./Cell');

function Food() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    config = Array.prototype.slice.call(arguments)[4].config
	this.mass = Math.floor(Math.random() * (config.foodMassMax - config.foodMassMin)) + config.foodMassMin
    this.cellType = 1;
}

module.exports = Food;
Food.prototype = new Cell();

Food.prototype.setColor = function(color) {
    this.color.r = Math.min(color.r*1.5, 255);
    this.color.b = Math.min(color.b*1.5, 255);
    this.color.g = Math.min(color.g*1.5, 255);
}

Food.prototype.calcMove = function () {
    // Food has no need to move
}

Food.prototype.calcMovePhys = function () {
    // Food has no need to move
}

// Main Functions

Food.prototype.onConsume = function(consumer,gameServer) {
    gameServer.currentFood--;
    consumer.addMass(this.mass);
}