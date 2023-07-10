const Vehicle = require("../models/Vehicle");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const cloudinary = require("../cloudinary/cloudinary");
const multer = require("multer");

/* multer settings start */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueIdentifier = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueIdentifier + "-" + file.originalname); // Set the filename with a unique identifier
  },
});

const fileFilter = function (req, file, cb) {
  // Check file type
  if (!file.originalname.match(/\.(jpg|jpeg|png|svg)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
/* multer settings end */

const getAllVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({}).sort("-createdAt");
  res.status(StatusCodes.OK).json({ vehicles, count: vehicles.length });
};

const AddVehicle = async (req, res) => {
  upload.array("pictures", 5)(req, res, async (error) => {
    if (error) {
      // Handle multer upload error
      if (error.message === "Unexpected field") {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Maximum of 5 images allowed" });
      }

      return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }

    if (!req.files || req.files.length === 0) {
      // No files uploaded
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "No files uploaded" });
    }

    if (req.files.length > 5) {
      // More than 5 files uploaded
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Maximum of 5 images allowed" });
    }

    const pictureUrls = [];

    // Upload each picture to Cloudinary and store the secure URLs
    for (const file of req.files) {
      const uniqueIdentifier =
        Date.now() + "-" + Math.round(Math.random() * 1e9);
      const publicId = `${req.user.userId}_vehicle_${uniqueIdentifier}`;

      const result = await cloudinary.uploader.upload(file.path, {
        public_id: publicId,
        width: 500,
        height: 500,
        crop: "fill",
      });

      pictureUrls.push(result.secure_url);
    }

    req.body.pictures = pictureUrls;
    req.body.createdBy = req.user.userId;

    const vehicle = await Vehicle.create(req.body);

    res.status(StatusCodes.CREATED).json({ vehicle });
  });
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
    name,
    description,
    colour,
    transmission,
    seat,
    price,
    type,
    pictures,
    date,
  } = req.body;

  const {
    user: { userId },
    params: { id: vehicleId },
  } = req;

  upload.array("pictures", 5)(req, res, async (error) => {
    if (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "File upload error" });
    }

    try {
      const vehicle = await Vehicle.findOneAndUpdate(
        {
          _id: vehicleId,
          createdBy: userId,
        },

        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!vehicle) {
        throw new NotFoundError(`No vehicle with id: ${vehicleId}`);
      }

      if (req.files && req.files.length > 0) {
        const pictureUrls = [];
        for (const file of req.files) {
          const uniqueIdentifier =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const publicId = `${req.user.userId}_vehicle_${uniqueIdentifier}`;

          const result = await cloudinary.uploader.upload(file.path, {
            public_id: publicId,
            width: 500,
            height: 500,
            crop: "fill",
          });

          pictureUrls.push(result.secure_url);
        }

        vehicle.pictures = pictureUrls;
        await vehicle.save();
      }

      res.status(StatusCodes.OK).json({
        vehicle,
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: error.message,
      });
    }
  });
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
