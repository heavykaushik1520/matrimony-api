const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');
const { isUser } = require('../middleware/userAuthMiddleware'); 
const {
  getAllUsers,
  getTotalUsersCount,
  getUsersByGender,
  getUserById,
  deleteUserById,
  getActiveMembers,
  assignMembershipManualMinimal
} = require('../controllers/userController');

router.get('/admin/users/count', isAdmin, getTotalUsersCount);

router.get("/admin/users/active-members", isAdmin, getActiveMembers);

router.get('/admin/users/gender', isAdmin, getUsersByGender);

router.get('/admin/users', isAdmin, getAllUsers);

router.post('/admin/users/:id/assign-membership-manual', isAdmin, assignMembershipManualMinimal);

router.get("/admin/users/:id", isAdmin, getUserById); 

router.delete("/admin/users/:id", isAdmin, deleteUserById); 


module.exports = router;