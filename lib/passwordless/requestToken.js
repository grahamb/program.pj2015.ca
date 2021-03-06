var models = require('../../models');

var requestToken = function(user, delivery, callback) {
  models.Login.findOne({ where: { email: user }}).then(function(login) {
    if (login) {
      return callback(null, login.id);
    }
    callback(null, null);
  }).catch(function(err) {
    callback(err, null);
  });
}

module.exports = requestToken;