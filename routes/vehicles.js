const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const {
  getAllVehicles,
  AddVehicle,
  getSingleVehicle,
  UpdateVehicle,
  DeleteVehicle,
} = require("../controllers/vehicles");

router.route("/").post(authenticateUser, AddVehicle).get(getAllVehicles);
router
  .route("/:id")
  .get(getSingleVehicle)
  .patch(authenticateUser, UpdateVehicle)
  .delete(authenticateUser, DeleteVehicle);

module.exports = router;
