const models = require('../models');
const Promise = require('bluebird');



module.exports.createSession = (req, res, next) => {
  //Look into Promise.resolve(req.cookies.shortlyid)
  Promise.resolve(req.cookies.shortlyid)

    .then(hash => {
      console.log('hash', hash);
      if (!hash) {
        throw hash;
      } else {
        return models.Sessions.get({hash: hash});
      }
    })

    .then(session => {
      console.log('session', session);
      if (!session) {
        throw session;
      }
      return session;
    })

    .catch(() => {
      console.log('in catch block');
      return models.Sessions.create()

        .then(newSession => {
          return models.Sessions.get({id: newSession.insertId});
        })

        .then(session => {
          res.cookie('shortlyid', session.hash);
          return session;
        });
    })

    .then(session => {
      req.session = session;
      next();
    });


  next();
};


/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {

};
//verify session
//if not redirect back to login

