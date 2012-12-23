var
ENTER

if (process.platform === 'win32') {
    ENTER = '\r\n'
} else {
    ENTER = '\n'
}

function combine(modules) {
    var
    code =
        'function require(id) {\n' +
        '    return (typeof require[id] !== \'undefined\') ? require[id] : module.require(id)\n' +
        '}\n'

    modules = modules.values().sort(function (a, b) {
        return b.deep - a.deep
    })

    // add code wrapper like follow
    // require['./foo'] = require['../foo'] = new function() {
    //      var exports = this
    //      //  module code
    // }
    code += modules.map(function (module) {
        var
        code

        code = module.refs.map(function (ref) {
            return 'require[\''+ ref +'\']'
        }).join(' = ')

        code += ' = new function () {\n' +
            '    var\n' +
            '    exports = this,\n' +
            '    module = {exports: exports}\n'
    
        code += module.code.split('\r\n').map(function (line) {
            // `'    '` for indent
            return line ==='' ? '' : '    ' + line
        }).join('\n')
        
        code +=
            '}\n'

        return code
    }).join('')

    return code
}

module.exports = combine

