require("dotenv").config();
require("express-async-errors");

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

// connect DB
const connectDB = require("./db/connect");

// middleware
const authenticateUser = require("./middleware/authentication");

// routers
const authRouter = require("./routes/auth");
const vehiclesRouter = require("./routes/vehicles");
const profileRouter = require("./routes/profile");
const searchRouter = require("./routes/search");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>Car rental API<h1><a href='#'>Documentation</a>");
});

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/vehicles", vehiclesRouter);
app.use("/api/v1/profile", authenticateUser, profileRouter);
app.use("/api/v1/search", searchRouter);

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
