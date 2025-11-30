'use strict';
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const runner = require('./test-runner');
const helmet = require('helmet');
const app = express();

app.use(cors({ origin: "*" }));
app.options("*", cors());

app.use(helmet.frameguard({ action: "sameorigin" }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.referrerPolicy({ policy: "same-origin" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/b/:board/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'board.html')));
app.get('/b/:board/:threadid', (req, res) => res.sendFile(path.join(__dirname, 'views', 'thread.html')));

app.use('/_api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});


require('./config/db')();
runner.run();
require('./routes/fcctesting')(app);
require('./routes/api')(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
