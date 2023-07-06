const Vehicle = require("../models/Vehicle");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({}).sort("-createdAt");
  res.status(StatusCodes.OK).json({ vehicles, count: vehicles.length });
};

const AddVehicle = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const vehicle = await Vehicle.create(req.body);
  res.status(StatusCodes.CREATED).json({ vehicle });
};

const getSingleVehicle = async (req, res) => {
  const {
    params: { id: vehicleId },
  } = req;

  const vehicle = await Vehicle.findOne({
    _id: vehicleId,
  });

  if (!vehicle) {
    throw new NotFoundError(`No vehicle with id: ${vehicleId}`);
  }

  res.status(StatusCodes.OK).json({ vehicle });
};

const UpdateVehicle = async (req, res) => {
  const {
    body: { name, pictures, description, colour, transmission, seat, price },
    user: { userId },
    params: { id: vehicleId },
  } = req;

  if (
    name === "" ||
    pictures === "" ||
    description === "" ||
    colour === "" ||
    transmission === "" ||
    seat === "" ||
    price === ""
  ) {
    throw new BadRequestError("Fill all required fields");
  }

  const vehicle = await Vehicle.findByIdAndUpdate(
    { _id: vehicleId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    throw new NotFoundError(`No vehicle with id: ${vehicleId}`);
  }

  res.status(StatusCodes.OK).json({ vehicle });
};

const DeleteVehicle = async (req, res) => {
  const {
    user: { userId },
    params: { id: vehicleId },
  } = req;

  const vehicle = await Vehicle.findOneAndRemove({
    _id: vehicleId,
    createdBy: userId,
  });

  if (!vehicle) {
    throw new NotFoundError(`No vehicle with id: ${vehicleId}`);
  }

  res.status(StatusCodes.OK).send();
};

module.exports = {
  getAllVehicles,
  AddVehicle,
  getSingleVehicle,
  UpdateVehicle,
  DeleteVehicle,
};
