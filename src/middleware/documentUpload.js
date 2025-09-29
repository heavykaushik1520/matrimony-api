const multer = require("multer");
const path = require("path");

// Storage engine for documents
const storage = multer.diskStorage({
  destination: "./uploads/documents/", 
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// File type check (pdf + images)
function checkFileType(file, cb) {
  const filetypes = /pdf|jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Only PDF and Image files allowed!");
  }
}

// Multer config – single file only
const documentUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("documents"); 

module.exports = documentUpload;
