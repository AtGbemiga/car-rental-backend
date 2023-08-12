// backend/routes/hire.js
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const { addHire, getAllHires } = require("../controllers/hire");

router
  .route("/")
  .post(authenticateUser, addHire)
  .get(authenticateUser, getAllHires);

module.exports = router;
