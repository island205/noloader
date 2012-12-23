var
analyse = require('./analyse'),
combine = require('./combine')
exports.pack = function (filename, callback) {
    combine(analyse(filename), callback)
}
