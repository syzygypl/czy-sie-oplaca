require('dotenv').config({ silent: true }); // Load local environment

const express = require('express');
const app = express();
const basicAuth = require('basic-auth');
var cookieParser = require('cookie-parser');

app.set('port', (process.env.PORT));

app.use((req, res, next) => {
  function unauthorized(authRes) {
    authRes.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return authRes.sendStatus(401);
  }

  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  if (user.name === process.env.BASIC_AUTH_USER && user.pass === process.env.BASIC_AUTH_PASS) {
    return next();
  }

  if (user.name === process.env.BASIC_AUTH_ADMIN_USER && user.pass === process.env.BASIC_AUTH_ADMIN_PASS) {
    var minute = 60 * 1000;
    res.cookie('CSO_ROLE', 1, { maxAge: minute })
    return next();
  }

  return unauthorized(res);
});

app.use(cookieParser());

app.use(express.static(`${process.cwd()}/build`));

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
