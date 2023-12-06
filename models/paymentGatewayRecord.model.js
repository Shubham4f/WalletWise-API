import mongoose from "mongoose";

const paymentGatewayRecordSchema = mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PaymentGatewayRecord = mongoose.model(
  "PaymentGatewayRecord",
  paymentGatewayRecordSchema
);

export default PaymentGatewayRecord;
