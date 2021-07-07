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
const axiosLogger = require('./middlewares/axiosLogger');
dotenv.config();

var app = express();

const dbConnString = process.env.LOG_DB_CONNECTION_STRING || "mongodb+srv://backupLogDB:9SEnbWEu2qmGRYpo@cluster0-ljo1h.mongodb.net/backupLogDB?retryWrites=true&w=majority";
winston.add(new winston.transports.MongoDB({
    db: dbConnString,
    options: {
        useUnifiedTopology: true
    },
    collection: 'apiLogs',
    storeHost: true
}));
winston.add(new winston.transports.File({
    filename: 'apiLogs.log'
}));

app.use(axiosLogger);

app.use(compression()); //Compress all routes
app.use(helmet());
app.use(cors());

var bankid = require("./routes/bankId");
var account = require("./routes/account");
var opportunity = require("./routes/opportunity");
const lead =  require('./routes/lead');
const factoring =  require('./routes/factoring');
const file = require('./routes/file');
const user = require('./routes/user');
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
app.use('/factoring', factoring);
app.use('/files', file);
app.use('/user', user);

app.use(apiLogger);


module.exports = app;