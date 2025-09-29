// src/middlewares/upload.js - A single, combined upload middleware

const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on fieldname
    if (file.fieldname === "profilePhotos") {
      cb(null, "./uploads/images/");
    } else if (file.fieldname === "idProof") {
      cb(null, "./uploads/documents/");
    } else {
      cb(new Error("Unexpected field"));
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// File type check based on fieldname
function checkFileType(req, file, cb) {
  if (file.fieldname === "profilePhotos") {
    // Check for image types for profile photos
    const filetypes = /jpeg|jpg|webp|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Only image files allowed for profile photos!");
    }
  } else if (file.fieldname === "idProof") {
    // Check for pdf or image types for ID proof
    const filetypes = /pdf|jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Only PDF and Image files allowed for ID proof!");
    }
  } else {
    cb("Error: Unexpected field");
  }
}

// Multer config - Use .fields() to handle multiple fields
const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: checkFileType,
}).fields([
  { name: "profilePhotos", maxCount: 5 }, // Adjust maxCount as needed
  { name: "idProof", maxCount: 1 },
]);

module.exports = uploadMiddleware;