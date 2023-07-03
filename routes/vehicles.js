const express = require("express");
const router = express.Router();

const {
  getAllVehicles,
  AddVehicle,
  getSingleVehicle,
  UpdateVehicle,
  DeleteVehicle,
} = require("../controllers/vehicles");

router.route("/").post(AddVehicle).get(getAllVehicles);
router
  .route("/:id")
  .get(getSingleVehicle)
  .patch(UpdateVehicle)
  .delete(DeleteVehicle);

module.exports = router;
