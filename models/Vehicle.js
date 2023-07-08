const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      //   required: [true, "Please provide vehicle name"],
      minlength: 3,
      maxlength: 50,
    },
    pictures: {
      type: [
        {
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
            message: "An image exceeds the maximum size limit (1MB).",
          },
        },
      ],
      validate: {
        validator: function (value) {
          return value.length <= 5;
        },
        message: "Maximum of 5 images allowed.",
      },
      //   required: [true, "Please provide at least one image."],
    },
    description: {
      type: String,
      //   required: [true, "Please provide description"],
      minlength: 50,
      maxlength: 300,
    },
    colour: {
      type: String,
      //   required: [true, "Please provide color"],
    },
    transmission: {
      type: String,
      enum: {
        values: ["Automatic", "Manual"],
        message: "{VALUE} is not supported",
      },
      //   required: [true, "Please provide transmission"],
    },
    type: {
      type: String,
      enum: {
        values: ["Sedan", "Suv", "Truck"],
        message: "{VALUE} is not supported",
      },
      //   required: [true, "Please provide transmission"],
    },
    seat: {
      type: Number,
      //   required: [true, "Please provide number of seat"],
    },
    price: {
      type: Number,
      //   required: [true, "Please provide price"],
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Please provide vehicle"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);
