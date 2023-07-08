const Profile = require("../models/Profile");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");
const cloudinary = require("../cloudinary/cloudinary");
const multer = require("multer");

const getProfile = async (req, res) => {
  const profile = await Profile.find({ createdBy: req.user.userId }).sort(
    "createdAt"
  );
  res.status(StatusCodes.OK).json({ profile, count: profile.length });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the destination folder for uploaded files
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

const createProfile = async (req, res) => {
  const createdBy = req.user.userId;
  const existingProfile = await Profile.findOne({ createdBy });

  if (existingProfile) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Profile already exists for this user." });
  }

  upload.single("picture")(req, res, async (error) => {
    if (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "File upload error" });
    }

    if (!req.file) {
      // No file uploaded
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: `${createdBy}_profile`,
      width: 500,
      height: 500,
      crop: "fill",
    });

    const profile = await Profile.create({
      name: req.body.name,
      picture: result.secure_url,
      description: req.body.description,
      createdBy: createdBy,
    });

    res.status(StatusCodes.CREATED).json({ profile });
  });
};

const getSingleProfile = async (req, res) => {
  const {
    params: { id: profileId },
  } = req;

  const profile = await Profile.findOne({
    _id: profileId,
  });

  if (!profile) {
    throw new NotFoundError(`No profile with id: ${profileId}`);
  }

  res.status(StatusCodes.OK).json({ profile });
};

const updateProfile = async (req, res) => {
  const {
    user: { userId },
    params: { id: profileId },
  } = req;

  // Handle profile picture update
  upload.single("picture")(req, res, async (error) => {
    if (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "File upload error" });
    }

    // Check if the profile exists and belongs to the current user
    const profile = await Profile.findOneAndUpdate(
      { _id: profileId, createdBy: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      throw new NotFoundError(`No profile with id: ${profileId}`);
    }

    // Update profile picture if a new file is uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        public_id: `${userId}_profile`,
        width: 500,
        height: 500,
        crop: "fill",
      });

      profile.picture = result.secure_url;
      await profile.save();
    }

    res.status(StatusCodes.OK).json({ profile });
  });
};

module.exports = {
  getProfile,
  createProfile,
  getSingleProfile,
  updateProfile,
};
