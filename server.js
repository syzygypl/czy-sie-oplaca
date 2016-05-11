require('dotenv').config(); // Load local environment

const express = require('express');
const app = express();
const basicAuth = require('basic-auth');

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

  return unauthorized(res);
});

app.use(express.static(`${process.cwd()}/build`));

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
