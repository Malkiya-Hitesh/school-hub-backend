// validators/school.validator.js
const AppError = require("../utils/appError");
const {
  DISTRICTS,
  MEDIUMS,
  BOARDS,
  MANAGEMENTS,
  SCHOOL_TYPES,
  LOCATION_TYPES,
  CATEGORY_TYPES,
  GRADE_FROM,
  GRADE_TO,
  SORT_OPTIONS,
} = require("../helpers/filterOptions");

const validateSchoolQuery = (req, res, next) => {
  try {
    const {
      district,
      medium,
      board,
      management,
      schoolType,
      locationType,
      categoryType,
      gradeFrom,
      gradeTo,
      sortBy,
    } = req.query;

    if (district && !DISTRICTS.includes(district.toUpperCase())) {
      throw new AppError("Invalid district", 400);
    }

    if (medium && !MEDIUMS.includes(medium.toUpperCase())) {
      throw new AppError("Invalid medium", 400);
    }

    if (board && !BOARDS.includes(board.toUpperCase())) {
      throw new AppError("Invalid board", 400);
    }

    if (
      management &&
      !MANAGEMENTS.includes(management.toUpperCase())
    ) {
      throw new AppError("Invalid management", 400);
    }

    if (
      schoolType &&
      !SCHOOL_TYPES.includes(schoolType.toUpperCase())
    ) {
      throw new AppError("Invalid schoolType", 400);
    }

    if (
      locationType &&
      !LOCATION_TYPES.includes(locationType.toUpperCase())
    ) {
      throw new AppError("Invalid locationType", 400);
    }

    if (
      categoryType &&
      !CATEGORY_TYPES.includes(categoryType.toUpperCase())
    ) {
      throw new AppError("Invalid categoryType", 400);
    }

    if (
      gradeFrom &&
      !GRADE_FROM.includes(Number(gradeFrom))
    ) {
      throw new AppError("Invalid gradeFrom", 400);
    }

    if (
      gradeTo &&
      !GRADE_TO.includes(Number(gradeTo))
    ) {
      throw new AppError("Invalid gradeTo", 400);
    }

    if (
      sortBy &&
      !SORT_OPTIONS.includes(sortBy)
    ) {
      throw new AppError("Invalid sort option", 400);
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validateSchoolQuery,
};