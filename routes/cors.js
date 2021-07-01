const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['https://localhost:3000', 'https://localhost:3443', 'https://DESKTOP-G365CRN:3001', 'https://localhost:3001', 'http://localhost:3001'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
    //   corsOptions = { origin: true };
    callback(null, true);
    }
    else {
        //corsOptions = { origin: false };
       //corsOptions = { origin: true };
       callback(new Error("Not allowed by CORS"));
    }
    //callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);