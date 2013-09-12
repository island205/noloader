var
analyse = require('./src/analyse'),
combine = require('./src/combine')


exports.analyse = analyse
exports.combine = combine

exports.noloader = function () {
    return function (req, res, next) {
        if (/\.js$/.test(req.url)) {
            res.end(combine(analyse(req.url)))
        } else {
            next()
        }
    }
}

