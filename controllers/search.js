const Vehicle = require("../models/Vehicle");
const { StatusCodes } = require("http-status-codes");

const getAllSearches = async (req, res) => {
  const { name, colour, transmission, type, numberFilters, sort, fields } =
    req.query;
  const queryObject = {};

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (colour) {
    queryObject.colour = { $regex: colour, $options: "i" };
  }
  if (transmission) {
    queryObject.transmission = transmission;
  }
  if (type) {
    queryObject.type = type;
  }

  if (numberFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(>|>=|=|<|<=)\b/g;
    let filters = numberFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price"];
    filters = filters.split(",").map((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        return { field, operator, value };
      }
      return null;
    });

    filters.forEach((filter) => {
      if (filter !== null) {
        const { field, operator, value } = filter;
        if (queryObject[field]) {
          if (operator === "$eq") {
            queryObject[field] = Number(value);
          } else {
            queryObject[field][operator] = Number(value);
          }
        } else {
          queryObject[field] = { [operator]: Number(value) };
        }
      }
    });
  }

  let result = Vehicle.find(queryObject);
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result.sort("madeAt");
  }

  // fields
  if (fields) {
    const fieldList = fields.split(",").join(" ");
    result = result.select(fieldList);
  }

  //pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  const final = await result;

  res.status(StatusCodes.OK).json({ final, nbHits: final.length });
};

module.exports = {
  getAllSearches,
};
