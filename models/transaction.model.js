import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    senderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    recordRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentGatewayRecord",
    },
  },
  { timestamps: true }
);

const Transaction = new mongoose.model("Transaction", transactionSchema);

export default Transaction;
