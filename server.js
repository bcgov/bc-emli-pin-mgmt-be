var express = import('express');
var app = express();

// Set the Server Port
var PORT = process.env.PORT || 8080;

var server = app.listen(PORT, function () {
    //   var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', 'localhost', port);
});

// GET STATUS ENDPOINT
app.get('/', function (req, res) {
    res.send('Our Server is Up and Running!');
});
