const express = require("express");
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
  deleteContactById,
} = require("../controllers/contactController");

const { isAdmin } = require("../middleware/authMiddleware")

router.post("/contact", createContact); 
router.get("/contact", isAdmin , getAllContacts); 
router.get("/contact/:id", isAdmin , getContactById); 
router.delete("/contact/:id", isAdmin , deleteContactById); 

module.exports = router;
