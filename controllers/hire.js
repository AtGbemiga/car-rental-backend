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

const getAllHires = async (req, res) => {
  const hires = await Vehicle.find({ createdBy: req.user.userId }).sort(
    "-createdAt"
  );
  res.status(StatusCodes.OK).json({ hires, count: hires.length });
};

const addHire = async (req, res) => {
  upload.array("pictures", 5)(req, res, async (error) => {
    const pictureUrls = JSON.parse(req.body.pictures);
    const parsedDateRange = JSON.parse(req.body.dateRange);

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

    // Extract the Data from the request body
    const { deliveryAddress, returnAddress, ...vehicleDetails } = req.body;

    // Create a new vehicle entry with the added form data
    const vehicleWithForm = {
      ...vehicleDetails,
      deliveryAddress,
      returnAddress,
      dateRange: {
        startDate: parsedDateRange[0],
        endDate: parsedDateRange[1],
      },
    };

    // Store the new vehicle entry in the database
    const vehicle = await Vehicle.create(vehicleWithForm);

    res.status(StatusCodes.CREATED).json({ vehicle });
  });
};

module.exports = {
  addHire,
  getAllHires,
};
