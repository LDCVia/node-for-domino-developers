/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (req.cookies['DomAuthSessId'] != null) return next()
  res.redirect('/login')
}
