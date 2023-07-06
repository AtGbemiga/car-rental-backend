const express = require("express");
const router = express.Router();

const {
  getProfile,
  createProfile,
  getSingleProfile,
  updateProfile,
} = require("../controllers/profile");

router.route("/").post(createProfile).get(getProfile);
router.route("/:id").get(getSingleProfile).patch(updateProfile);

module.exports = router;
