var
analyse = require('./analyse'),
combine = require('./combine')
exports.pack = function (filename) {
    return combine(analyse(filename))
}
