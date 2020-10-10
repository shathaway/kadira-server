var stateManager = require('../stateManager');

module.exports = function(db) {
  var appsCollection = db.collection('apps');

  return function(req, res, next) {
    var appId = req.appId;
    var appSecret = req.appSecret;
    if (appId && appSecret) {
      //do the authentication

      appsCollection.findOne({_id: appId, secret: appSecret}, function(err, app) {
        if(err) {
          console.error('error getting app:', {appId: appId, error: err.message});
          endRequest(500);
        } else if(app) {

// Track down: TypeError: Cannot set property 'app' of undefined
// Fix: Make sure that req.body is defined.
// meteorhacks:kadira and mdg:meteor-apm-agent issue a POST /ping without a body.

          req.body = req.body || {};
          req.body.app = req.app = app;
          req.body.appId = req.appId = appId;
          req.body.plan = req.plan = app.plan;

          stateManager.setState(db, app, 'initialDataReceived');
          next();
        } else {
          endRequest(401);
        }
      });
    } else {
      endRequest(401);
    }

    function afterUpdated(err) {
      if(err) {
        //todo: do the error handling and re-try logic
        console.error('error on updating app:', {appId: appId, error: err.message});
      }
    }

    function endRequest(statusCode) {
      res.writeHead(statusCode);
      res.end();
    }
  }
}
