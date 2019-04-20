var express = require("express");
var app     = express();
var path    = require("path");
const PORT = process.env.PORT || 5000

app.use(express.static(__dirname + '/public'));

app.listen(PORT);