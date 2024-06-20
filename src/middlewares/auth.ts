// middleware to make sure only the admin is allowed

import { Request, Response, NextFunction } from "express";

import { TryCatch } from "./error.js";
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";

export const adminOnly = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;
    if (!id) {
      return next(new ErrorHandler("login first ", 401));
    }
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("id not registered", 401));
    }
    if (user.role !== "admin") {
      return next(new ErrorHandler("you are not the admin", 401));
    }
    next();
  }
);
export default adminOnly;

// api/v1/user/jksdjk?key=12y378             here after the ? is the query
