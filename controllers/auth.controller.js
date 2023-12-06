import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";
import { errorHandler } from "../utils/error.js";

export const signUp = async (req, res, next) => {
  const { phoneNumber, firstName, lastName, merchant } = req.body;

  const password = bcryptjs.hashSync(req.body.password, 10);
  const paymentPin = bcryptjs.hashSync(req.body.paymentPin.toString(), 10);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newUser = new User({
      phoneNumber,
      firstName,
      lastName,
      merchant,
      password,
      paymentPin,
    });
    const validUser = await newUser.save();

    const newWallet = new Wallet({
      userRef: validUser,
    });
    await newWallet.save();

    await session.commitTransaction();
    session.endSession();

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    res.status(201).json({
      token,
      _id: validUser._id,
      phoneNumber: validUser.phoneNumber,
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      merchant: validUser.merchant,
      createdAt: validUser.createdAt,
      updatedAt: validUser.updatedAt,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000)
      next(errorHandler(409, "A user with this phone number already exists."));
    else next(error);
  }
};

export const signIn = async (req, res, next) => {
  const { phoneNumber, password } = req.body;

  try {
    const validUser = await User.findOne({ phoneNumber });
    if (!validUser) return next(errorHandler(401, "Wrong credentials."));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials."));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    res.status(200).json({
      token,
      _id: validUser._id,
      phoneNumber: validUser.phoneNumber,
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      merchant: validUser.merchant,
      createdAt: validUser.createdAt,
      updatedAt: validUser.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
