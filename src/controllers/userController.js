// src/controllers/userController.js

const { User } = require("../models");

//this one is for admin
async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] },
      include: [
        { model: AstrologyInfo },
        { model: FamilyInfo },
        { model: UserCareerInfo }
      ]
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }
    
    return res.status(200).json(users);

  } catch (error) {
    console.error("Error fetching all users for admin:", error);
    res.status(500).json({ message: "Failed to fetch users.", error: error.message });
  }
}

async function deleteUserMe(req, res) {
  try {
    const deletedRows = await User.destroy({
      where: { id: req.user.userId },
    });

    if (deletedRows > 0) {
      return res.status(204).send(); 
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user.", error: error.message });
  }
}

module.exports = {
  getAllUsers,
  deleteUserMe,
};
