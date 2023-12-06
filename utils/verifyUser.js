import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyUser = (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return next(errorHandler(403, "Forbidden"));
      req.user = user;
      next();
    });
  } else {
    next(errorHandler(401, "Unauthorized"));
  }
};
