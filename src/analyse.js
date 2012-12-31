// use uglify to analyse module dependence
//
// analyse process
//
// [  ... module, module, module ... ] <-  add to tail
//           -                          -
//           -                          -
//           |            dep modules   -
//      analyseModule -------------------
//           |
//    nudule.done = true
//
//deep algorithm ->:require
//
//          0      1       2       3
//          A ->   B   ->  C   ->  F
//          -                      -
//          - - -> D   ->  E < - - -
//                 1   2 < 4 : 4
var
parser = require('uglify-js').parser,
fs = require('fs'),
path = require('path'),

basestone = require('basestone'),

__toString = Object.prototype.toString

// get real pathname
// as the unique `id` of module
function getRealModulePath(cwd, ref) {
    var
    realPath
    if (!/\.js$/.test(ref)) {
        ref += '.js'
    }
    realPath = path.normalize(cwd + '/' + ref)
    return realPath
}

function isAnalyseModule(id, dependences) {
    return dependences.values().some(function (module) {
        return module.id === id
    })
}

function getModuleById(id, dependences) {
    var
    target
    dependences.values(function (module) {
        if (module.id === id) {
            target = module
        }
    })
    return target
}

function isDone(dependences) {
    return dependences.values().every(function (module) {
        return module.done
    })
}

function getUnAnalyseModule(dependences) {
    return dependences.values().filter(function (module) {
        return ! module.done
    })[0]
}

// analyse a `module` deps by recursion
// add deps to `dependencies`
function __analyseDependence(module, dependences) {
    var
    cwd, ast, deep

    cwd = path.dirname(module.id)
    //read `module`'s code
    module.code = fs.readFileSync(module.id, 'utf8')
    ast = parser.parse(module.code)
    deep = module.deep + 1

    // travel ast tree
    function travelAst(ast, callback) {
        if (__toString.call(ast) === '[object Array]') {
            ast.forEach(function (item) {
                callback(item)
                travelAst(item, callback)
            })
        }
    }

    travelAst(ast, function (item) {
        var
        ref, id, module
        if (__toString.call(item) === '[object Array]') {
            // match ast like
            // `["call",["name","require"],[["string","${ref}"]]]]`
            if (item[1] && item[1][1] === 'require') {
                ref = id = item[2][0][1]
                // ignore node' module
                // like `require('event')`
                if (/\.\//.test(ref)) {
                    id = getRealModulePath(cwd, ref)
                    if (!isAnalyseModule(id, dependences)) {
                        dependences.add({
                            id: id,
                            refs: [],
                            deep: 0,
                            code: '',
                            done: false
                        })
                    }
                    module = getModuleById(id, dependences)
                    module.refs.push(ref)
                    if (module.deep < deep) {
                        module.deep = deep
                    }
                }
            }
        }
    })
}

function analyseDependence(ref) {
    var
    module, dependences = basestone.set()

    dependences.add({
        id: getRealModulePath(process.cwd(), ref),
        refs: [ref],
        deep: 0,
        code: '',
        done: false
    })

    while (!isDone(dependences)) {
        module = getUnAnalyseModule(dependences)
        __analyseDependence(module, dependences)
        module.done = true
    }

    return dependences
}

module.exports = analyseDependence

