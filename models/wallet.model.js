import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
