require('dotenv').config({ silent: true }); // Load local environment
const express = require('express');
const app = express();
const basicAuth = require('basic-auth');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');

var options = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  defaultPort: process.env.PORT || 8080,
};

const generateJWT = () => {
  // sign with RSA SHA256
  const time = parseInt(Date.now()/1000, 10);
  var token = jwt.sign(
    {
      "iss": process.env.FIREBASE_CLIENT_EMAIL,
      "sub": process.env.FIREBASE_CLIENT_EMAIL,
      "aud": "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
      "iat": time,
      "exp": time + (60 * 60), // Maximum expiration time is one hour
      "uid": 'app-client',
    },
    process.env.FIREBASE_PRIVATE_KEY,
    {
      algorithm: 'RS256'
    }
  );
  return token;
};

app.use(cookieParser());

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
    res.cookie('APP_TOKEN', generateJWT());
    return next();
  }

  if (user.name === process.env.BASIC_AUTH_ADMIN_USER && user.pass === process.env.BASIC_AUTH_ADMIN_PASS) {
    const minute = 60 * 1000;
    res.cookie('APP_TOKEN', generateJWT());
    res.cookie('CSO_ROLE', 1, { maxAge: minute })
    return next();
  }

  return unauthorized(res);
});


if (options.env === 'development') {
  var httpProxy = require('http-proxy');
  var apiProxy = httpProxy.createProxyServer();
  options.port = process.env.PROXY_PORT || 8081;

  app.all("/*", function(req, res) {
    apiProxy.web(req, res, {target: 'http://localhost:' + options.defaultPort});
  });
} else {
  app.use(express.static(`${process.cwd()}/build`));
}

app.listen(options.port, () => {
  console.log('Node app is running on port', options.port);
});
