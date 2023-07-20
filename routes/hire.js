// backend/routes/hire.js
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const { AddHire } = require("../controllers/hire");

router.route("/").post(authenticateUser, AddHire); // Use upload.array() middleware for handling file uploads with the key "pictures"

module.exports = router;

// app.use("/api/v1/hire", hireRouter);
// const hireRouter = require("./routes/hire");
