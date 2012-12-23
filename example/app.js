var
express = require('express'),
noloader = require('../index'),
app = express()

app.use(noloader())

app.get('/', function (req, res) {
    res.send('hello world')
})

app.listen(3000)

