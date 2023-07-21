const Vehicle = require("../models/Hire");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const cloudinary = require("../cloudinary/cloudinary");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Set the filename for uploaded files
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

const AddHire = async (req, res) => {
  console.log(req.body);
  upload.array("pictures", 5)(req, res, async (error) => {
    // Rest of the multer upload handling code...

    // Extract the modified vehicle details from the request body
    const { vehicle } = req.body;
    const { note, ...vehicleDetails } = vehicle;

    // Create a new vehicle entry with the modified details
    const modifiedVehicle = await Vehicle.create({
      ...vehicleDetails,
      pictures: pictureUrls,
      createdBy: req.user.userId,
      note: note,
    });

    res.status(StatusCodes.CREATED).json({ vehicle: modifiedVehicle });
  });
};

module.exports = {
  AddHire,
};
