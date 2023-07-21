// backend/controllers/hire.js
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

    // Extract the note from the request body
    const { note, ...vehicleDetails } = req.body;

    // Create a new vehicle entry with the user's note
    const vehicleWithNote = { ...vehicleDetails, note };

    // Store the new vehicle entry in the database
    const vehicle = await Vehicle.create(vehicleWithNote);

    res.status(StatusCodes.CREATED).json({ vehicle });
  });
};

module.exports = {
  AddHire,
};
