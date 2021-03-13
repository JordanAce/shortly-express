const _ = require('underscore');

const parseCookies = (req, res, next) => {
  var cookies = {};
  if (req.headers.cookie) {
    var cookieArray = req.headers.cookie.split(';');
    cookieArray.forEach((cookie) => {
      var property = cookie.split('=')[0].trim();
      var value = cookie.split('=')[1].trim();
      cookies[property] = value;
    });
  }
  req.cookies = cookies;
  next();
};

module.exports = parseCookies;