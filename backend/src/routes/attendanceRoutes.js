const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/rbacMiddleware");

router.use(authenticate);

router.get("/", attendanceController.getAttendance); // scoped by role inside controller
router.post("/checkin", attendanceController.checkIn);
router.post("/checkout", attendanceController.checkOut);
router.put("/:id", authorize("ADMIN"), attendanceController.updateAttendance);

module.exports = router;
