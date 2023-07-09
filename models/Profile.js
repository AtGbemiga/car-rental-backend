const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 3,
      maxlength: 50,
    },
    picture: {
      type: String,
      validate: {
        validator: function (value) {
          if (!/\.(jpg|jpeg|png|svg)$/i.test(value)) {
            return false;
          }
          const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
          const isWithinSizeLimit = value.length <= maxSizeInBytes;

          return isWithinSizeLimit;
        },
        message: "The image exceeds the maximum size limit (1MB).",
      },
    },
    description: {
      type: String,
      minlength: 1,
      maxlength: 300,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "Profile",
      required: [true, "Please provide profile"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
