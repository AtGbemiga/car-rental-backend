const express = require("express");
const router = express.Router();

const { getAllSearches } = require("../controllers/search");

router.route("/").get(getAllSearches);

module.exports = router;
