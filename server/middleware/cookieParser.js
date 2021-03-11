const _ = require('underscore');

const parseCookies = (req, res, next) => {
  //console.log(req);
  var cookies = {};
  if (Object.keys(req.headers).length > 0) {
    console.log('req header:', req.headers);
    var cookieArray = req.headers.cookie.split(';');
    console.log('cookieArray', cookieArray);
    cookieArray.forEach((cookie) => {
      var property = cookie.split('=')[0].trim();
      var value = cookie.split('=')[1].trim();
      cookies[property] = value;
    });
  }
  console.log(cookies);
  req.cookies = cookies;
  next();
};

module.exports = parseCookies;