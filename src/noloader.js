var
analyse = require('./analyse'),
combine = require('./combine')
exports.pack = function (filename) {
    combine(analyse(filename))
}
