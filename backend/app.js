const express = require('express');
const routes = require('./routes/index');
const bodyParser = require('body-parser');
const pretty = require('express-prettify');
const path = require('path');
const errorHandlers = require('./handlers/errorHandlers.js');
const cors = require('cors');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(pretty({ query: 'readable' }));

app.set('port', process.env.PORT || 8000);

app.use('/', routes);

if (app.get('env') === 'development') {
    app.use(errorHandlers.developmentErrors);
}

module.exports = app;
