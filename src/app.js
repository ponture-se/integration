const winston = require('winston');
require('winston-mongodb');
const apiLogger = require('./middlewares/apiLogger');
var express = require("express");
var cors = require("cors");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var compression = require("compression");
const dotenv = require('dotenv');
dotenv.config();

var app = express();

winston.add(new winston.transports.MongoDB({
    db: 'mongodb+srv://' + process.env.MONGODB_USER + ':' + process.env.MONGODB_PASS + '@cluster0-ljo1h.mongodb.net/Logs?retryWrites=true&w=majority',
    options: {
        useUnifiedTopology: true
    }
}));
winston.add(new winston.transports.File({
    filename: 'apiLogs.log'
}));

app.use(compression()); //Compress all routes
app.use(helmet());
app.use(cors());

var bankid = require("./routes/bankId");
var account = require("./routes/account");
var opportunity = require("./routes/opportunity");
const lead = require('./routes/lead');
// a middleware function with no mount path. This code is executed for every request to the router

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.use("/auth", bankid);
app.use("/accounts", account);
app.use("/apply", opportunity);
app.use('/leads', lead);

app.use(apiLogger);


module.exports = app;