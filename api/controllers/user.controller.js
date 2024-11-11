import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { z } from "zod";

export const test = (req, res) => {
  res.json({
    message: "API is working",
  });
};

//update user
export const updateUser = async (req, res, next) => {
  if (req.user.id != req.params.id) {
    return next(errorHandler(401, "You can only update your account"));
  }
  try {
    // Check if username contains only alphanumeric characters
    if (req.body.username && !/^[a-zA-Z0-9]+$/.test(req.body.username)) {
      return next(
        errorHandler(400, "Username can only contain alphanumeric characters")
      );
    }
    console.log(req.body.email);

    // Check if email ends with @gmail.com or @mnnit.ac.in
    if (
      req.body.email &&
      !/^(.+)@(gmail\.com|mnnit\.ac\.in)$/.test(req.body.email)
    ) {
      return next(
        errorHandler(400, "Email should end with @gmail.com or @mnnit.ac.in")
      );
    }

    // Check if password is at least 6 characters long
    if (req.body.password && req.body.password.length < 6) {
      return next(
        errorHandler(400, "Password must be at least 6 characters long")
      );
    }

    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    let existingUser;
    if (req.body.username || req.body.email) {
      existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.params.id } },
          {
            $or: [
              ...(req.body.username ? [{ username: req.body.username }] : []),
              ...(req.body.email ? [{ email: req.body.email }] : []),
            ],
          },
        ],
      });
    }

    if (existingUser) {
      return next(errorHandler(400, "Username or email already exists"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id != req.params.id) {
    return next(errorHandler(401, "You can delete only your account"));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted ...");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find({ isAdmin: false })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};
