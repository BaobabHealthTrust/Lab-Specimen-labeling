
module.exports = function loadUser(req, res, next) {
    userID = parseInt(req.session.session_user_id)
    if (userID > 0) {
        next();
    } else {
        res.redirect('/users/login');
    }
}