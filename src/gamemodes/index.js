module.exports = {
    Mode: require('./Mode'),
    FFA: require('./FFA'),
    Teams: require('./Teams'),
    Hardcore: require('./Hardcore'),
    Custom: require('./Custom')
};

var list = [new module.exports.FFA(),new module.exports.Teams(),new module.exports.Hardcore()];

module.exports.list = list;