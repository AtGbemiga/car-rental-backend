const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ProfileSchema = new mongoose.Schema({
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
      message: "The image exceeds the maximum size limit (2MB).",
    },
  },
  description: {
    type: String,
    minlength: 1,
    maxlength: 300,
  },
});

module.exports = mongoose.model("Profile", ProfileSchema);
