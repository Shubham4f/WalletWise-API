import Wallet from "../models/wallet.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const viewBalance = async (req, res, next) => {
  try {
    const validWallet = await Wallet.findOne({ userRef: req.user.id });
    if (!validWallet) return next(errorHandler(404, "User Not Found."));

    res.status(200).json({
      balance: validWallet.balance,
    });
  } catch (error) {
    next(error);
  }
};

export const viewDetails = async (req, res, next) => {
  try {
    const validUser = await User.findOne(
      { phoneNumber: req.params.phoneNumber },
      "phoneNumber firstName lastName merchant"
    );
    if (!validUser) return next(errorHandler(404, "User Not Found."));

    res.status(200).json({
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
