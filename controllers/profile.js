const Profile = require("../models/Profile");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getProfile = async (req, res) => {
  const profile = await Profile.find({ createdBy: req.user.userId }).sort(
    "createdAt"
  );
  res.status(StatusCodes.OK).json({ profile, count: profile.length });
};

// const createProfile = async (req, res) => {
//   req.body.createdBy = req.user.userId;
//   const profile = await Profile.create(req.body);
//   res.status(StatusCodes.CREATED).json({ profile });
// };

const createProfile = async (req, res) => {
  const createdBy = req.user.userId;
  const existingProfile = await Profile.findOne({ createdBy });

  if (existingProfile) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Profile already exists for this user." });
  }

  req.body.createdBy = createdBy;
  const profile = await Profile.create(req.body);
  res.status(StatusCodes.CREATED).json({ profile });
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

  const profile = await Profile.findByIdAndUpdate(
    { _id: profileId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new NotFoundError(`No profile with id: ${profileId}`);
  }

  res.status(StatusCodes.OK).json({ profile });
};

module.exports = {
  getProfile,
  createProfile,
  getSingleProfile,
  updateProfile,
};
