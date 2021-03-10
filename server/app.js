const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const db = require('./db/index.js');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup',
  (req, res, next) => {
    var newUser = req.body.username;
    var newPassword = req.body.password;
    return models.Users.create({username: newUser, password: newPassword})
      .then(result => {
        res.redirect(201, '/');
        next();
      })
      .catch(err => {
        console.log('Error: ' + err);
        res.redirect(400, '/signup');
        next();
      });

  });

app.post('/login',
  (req, res, next) => {
    var username = 'Samantha';
    var password = req.body.password;
    db.queryAsync('USE SHORTLY', function(err, result) {
      console.log('using SHORTLY db');
    })
      .then(
        //refactor into users if needed
        db.queryAsync(`SELECT PASSWORD, SALT FROM USERS WHERE USERNAME = '${username}'`, function(err, result) {
          var savedPassword = result[0].PASSWORD;
          var salt = result[0].SALT;
          var loginSuccess = models.Users.compare(password, savedPassword, salt);
          console.log('loginSuccess', loginSuccess);
          if (loginSuccess) {
            res.redirect(201, '/');
          } else {
            res.redirect(400, '/login');
          }
        }))
      .catch(err => {
        console.log('query error', err);
      });
  });


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
