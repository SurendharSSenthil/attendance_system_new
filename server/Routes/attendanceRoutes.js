const express = require("express");
const router = express.Router();
const {
	fetchData,
	updateAttendance,
	studentDashboard,
	FinalStudentData,
	deleteRecord,
	unmarkedAttendanceHours
} = require("../Controllers/AttendanceController");
const authenticateToken = require("../Middleware/middleware");

// Update attendance data
router.post("/update", authenticateToken, updateAttendance);
router.post("/pending-hours", authenticateToken, unmarkedAttendanceHours);

router.post("/student-dashboard", authenticateToken, studentDashboard);
router.delete("/record", authenticateToken, deleteRecord);

router.post("/getDashboardData", authenticateToken, FinalStudentData);
// Fetch attendance data for a specific date
router.post("/get-attendance", authenticateToken, fetchData);

module.exports = router;
