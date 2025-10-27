// src/middleware/userAuthMiddleware.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

function isUser(req, res, next) {
  const authHeader = req.header("Authorization");
  const refreshToken = req.header("x-refresh-token"); 

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = {
        ...decoded,
        userId: decoded.userId || decoded.id,
      };
      return next();
    }

    if (err.name === "TokenExpiredError") {
      if (!refreshToken) {
        return res
          .status(401)
          .json({ message: "Access token expired. Refresh token missing." });
      }

      jwt.verify(refreshToken, process.env.JWT_SECRET, (refreshErr, refreshDecoded) => {
        if (refreshErr) {
          return res
            .status(403)
            .json({ message: "Invalid refresh token." });
        }

        const newAccessToken = jwt.sign(
          {
            userId: refreshDecoded.userId,
            role: refreshDecoded.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.setHeader("x-access-token", newAccessToken);

        req.user = {
          userId: refreshDecoded.userId,
          role: refreshDecoded.role,
        };

        return next();
      });
    } else {
      return res.status(403).json({ message: "Invalid token." });
    }
  });
}


module.exports = { isUser };
