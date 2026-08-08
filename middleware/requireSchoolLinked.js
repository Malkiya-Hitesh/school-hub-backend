// middleware/requireSchoolLinked.js


const AppError = require("../utils/appError");

const requireSchoolLinked = (req, res, next) => {
  if (!req.user?.schoolId) {
    return next(
      new AppError(
        "No school is linked to this account yet. Complete the school claim process first.",
        400
      )
    );
  }
  next();
};

module.exports = requireSchoolLinked;