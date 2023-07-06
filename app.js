require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

// connect DB
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");

// routers
const authRouter = require("./routes/auth");
const vehiclesRouter = require("./routes/vehicles");
const profileRouter = require("./routes/profile");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Car rental API<h1><a href='#'>Documentation</a>");
});

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/vehicles", vehiclesRouter);
app.use("/api/v1/profile", authenticateUser, profileRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};
start();
