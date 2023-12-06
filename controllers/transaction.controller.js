import crypto from "crypto";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import { instance } from "../utils/payemntGateway.js";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import PaymentGatewayRecord from "../models/paymentGatewayRecord.model.js";
import Wallet from "../models/wallet.model.js";
import Transaction from "../models/transaction.model.js";

export const checkout = async (req, res, next) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };

  try {
    const order = await instance.orders.create(options);

    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    next(error);
  }
};

export const paymentVerification = async (req, res, next) => {
  const { razorpay_payment_id, razorpay_signature } = req.body;

  try {
    const { order_id, amount } = await instance.payments.fetch(
      razorpay_payment_id
    );

    const validationString = order_id + "|" + razorpay_payment_id;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(validationString)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      const newPaymentGatewayRecord = new PaymentGatewayRecord({
        paymentId: razorpay_payment_id,
        orderId: order_id,
        signature: razorpay_signature,
      });
      const savedRecord = await newPaymentGatewayRecord.save();

      const validWallet = await Wallet.findOne({ userRef: req.user.id });
      validWallet.balance += (amount / 100).toFixed(2);
      validWallet.save();

      const newTransaction = new Transaction({
        senderRef: req.user.id,
        receiverRef: req.user.id,
        amount: (amount / 100).toFixed(2),
        success: true,
        recordRef: savedRecord,
      });
      const savedTransaction = await newTransaction.save();

      res.status(200).json(savedTransaction);
    } else {
      next(errorHandler(400, "Transaction failed."));
    }
  } catch (error) {
    next(error);
  }
};

export const transfer = async (req, res, next) => {
  const { paymentPin, receiver, amount } = req.body;
  try {
    const validUser = await User.findById(req.user.id);
    const validpaymentPin = bcryptjs.compareSync(
      paymentPin.toString(),
      validUser.paymentPin
    );
    if (!validpaymentPin) return next(errorHandler(401, "Wrong payment pin."));

    var senderWallet = await Wallet.findOne({ userRef: req.user.id });
    if (senderWallet.balance < amount)
      return next(errorHandler(400, "Insufficient balance."));

    var receiverWallet = await Wallet.findOne({ userRef: receiver });
  } catch (error) {
    next(error);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    receiverWallet.balance += amount;
    senderWallet.balance -= amount;
    await senderWallet.save();
    await receiverWallet.save();

    const newTransaction = new Transaction({
      senderRef: req.user.id,
      receiverRef: receiver,
      amount,
      success: true,
    });

    const savedTransaction = await newTransaction.save();

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(savedTransaction);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const history = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ senderRef: req.user.id }, { receiverRef: req.user.id }],
    });
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};
