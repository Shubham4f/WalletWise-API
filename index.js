import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { auth, account, transaction } from "./routes/index.js";
import { verifyUser } from "./utils/verifyUser.js";

dotenv.config();

mongoose
.connect(process.env.DATABASE)
.then(() => {
  console.log("Connected to Database.");
})
.catch((err) => console.log(err));

const port = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use(verifyUser);
app.use("/api/account", account);
app.use("/api/transaction", transaction);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error.";
  res.status(statusCode).json({
    success: false,
    message,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port} => http://localhost:${port}/`);
});
