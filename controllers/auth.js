const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors/index");
const cookieParser = require("cookie-parser");

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();

  // Set the cookie with the token
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
  });

  res.status(StatusCodes.CREATED).json({ token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const token = user.createJWT();

  // Set the cookie with the token
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
  });

  res.status(StatusCodes.OK).json({ token });
};

// Maintain a blacklist of invalidated tokens
const invalidatedTokens = [];

const logout = async (req, res) => {
  const token = req.cookies.token;

  // Invalidate the token by adding it to the blacklist
  invalidatedTokens.push(token);

  res.clearCookie("token", {
    path: "/",
  });
  res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
};

module.exports = {
  register,
  login,
  logout,
};
