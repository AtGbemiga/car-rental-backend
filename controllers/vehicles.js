const Vehicle = require("../models/Vehicle");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ createdBy: req.user.userId }).sort(
    "createdAt"
  );
  res.status(StatusCodes.OK).json({ vehicles, count: vehicles.length });
};

const AddVehicle = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const vehicle = await Vehicle.create(req.body);
  res.status(StatusCodes.CREATED).json({ vehicle });
};

const getSingleVehicle = async (req, res) => {
  res.send("getSingleVehicles");
};

const UpdateVehicle = async (req, res) => {
  res.send("UpdateVehicle");
};

const DeleteVehicle = async (req, res) => {
  res.send("DeleteVehicle");
};

module.exports = {
  getAllVehicles,
  AddVehicle,
  getSingleVehicle,
  UpdateVehicle,
  DeleteVehicle,
};
