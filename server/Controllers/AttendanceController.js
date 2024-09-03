const createReportCollection = require("../Models/reportModel");
const createStudentCollection = require("../Models/studentModel");
const classmodel = require("../Models/courseModel");

const updateAttendance = async (req, res) => {
	const { coursecode, coursename, facname, date, hr, attendance } = req.body;

	if (!coursecode || !coursename || !date || !hr || !attendance) {
		return res.status(400).json({ message: "All fields are required" });
	}

	try {
		// Create or get the report collection based on course code
		const ReportCollection = createReportCollection(coursecode);

		// Find the existing report or create a new one
		const report = await ReportCollection.findOne({ date, hr });

		if (!report) {
			// If report does not exist, create a new one
			const newReport = new ReportCollection({
				faculty: req.user.id,
				coursename,
				coursecode,
				date,
				hr,
				freeze: true,
				isExpired: false,
				attendance,
			});

			await newReport.save();
			return res.status(201).json({
				message: "Attendance created successfully",
				report: newReport,
			});
		}
		report.freeze = true;
		// Update attendance records
		for (const entry of attendance) {
			const { RegNo, status } = entry;
			const existingEntry = report.attendance.find(
				(a) => a.RegNo.toString() === RegNo
			);

			if (existingEntry) {
				existingEntry.status = status;
				// existingEntry.freeze = freeze;
			} else {
				report.attendance.push({ RegNo, status });
			}
		}

		// Save the updated report document
		await report.save();

		res
			.status(200)
			.json({ message: "Attendance updated successfully", report });
	} catch (err) {
		console.error("Error updating attendance:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

// initial data fetch for a date, for a course
const fetchData = async (req, res) => {
	const { date, coursecode, coursename, hr, yr, Class } = req.body;
	const { id } = req.user;
	console.log(hr, yr, Class);
	try {
		const data = await classmodel.find({ coursecode, dept: yr, class: Class });
		if (data.length <= 0) {
			return res
				.status(404)
				.json({ message: "No students found! Please check the input fields" });
		}
		// Fetch students data from the dynamically created collection
		const StudentCollection = createStudentCollection(coursecode);
		const students = await StudentCollection.find().sort({ RegNo: 1 });
		const students_count = await StudentCollection.countDocuments();

		// Fetch the attendance report for the specified course and date
		const ReportCollection = createReportCollection(coursecode);
		let reports = await ReportCollection.findOne({ date, hr });

		if (!reports) {
			// Create a new report document if not found
			const attendance = students.map((student) => ({
				RegNo: student.RegNo,
				Name: student.StdName,
				status: 1, // Assuming 1 means present
				// freeze: false,
			}));

			reports = new ReportCollection({
				faculty: id,
				coursename,
				coursecode,
				date,
				hr,
				freeze: false,
				isExpired: false,
				attendance,
			});

			await reports.save();
		}

		// Prepare the attendance data and count absentees
		let absenteeCount = 0;
		let isExpired = reports.isExpired;
		let freeze = reports.freeze;

		const attendanceData = students.map((student) => {
			const attendance = reports.attendance.find(
				(a) => a.RegNo === student.RegNo
			);

			// Check if the student is absent (status = -1)
			if (attendance && attendance.status === -1) {
				absenteeCount++;
			}

			return {
				RegNo: student.RegNo,
				Name: student.StdName,
				status: attendance ? attendance.status : 1,
				// freeze: attendance ? attendance.freeze : false,
			};
		});

		console.log("@fetchData", attendanceData);
		console.log("data", data);
		res.status(200).json({
			reports: attendanceData,
			count: students_count,
			absentees: absenteeCount,
			isExpired,
			freeze,
		});
	} catch (error) {
		console.error("Error fetching attendance data:", error);
		res.status(500).json({ message: "Failed to fetch attendance data." });
	}
};

const studentDashboard = async (req, res) => {
	try {
		const { startDate, endDate, coursecode, yr, Class } = req.body;
		console.log("@studentDashboard", startDate, endDate, coursecode, yr, Class);

		if (!coursecode) {
			return res.status(400).json({ error: "Course code is required" });
		}

		const data = await classmodel.find({ coursecode, dept: yr, class: Class });
		if (data.length <= 0) {
			return res
				.status(404)
				.json({ message: "No students found! Please check the input fields" });
		}

		const ReportCollection = createReportCollection(coursecode);

		const result = await ReportCollection.aggregate([
			{
				$match: {
					date: {
						$gte: startDate ? new Date(startDate) : new Date("1970-01-01"),
						$lte: endDate ? new Date(endDate) : new Date(), // Current date if endDate is not provided
					},
				},
			},
			{
				$unwind: "$attendance",
			},
			{
				$match: {
					freeze: { $eq: true },
				},
			},
			{
				$group: {
					_id: {
						RegNo: "$attendance.RegNo",
						Name: "$attendance.Name",
						course: "$coursecode",
					},
					present: {
						$sum: {
							$cond: [
								{ $in: ["$attendance.status", [1, 2]] },
								1, // If true, add 1 to present count
								0, // If false, add 0 to present count
							],
						},
					},
					totalHours: {
						$sum: 1,
					},
					statuses: {
						$push: {
							date: "$date",
							hour: "$hr",
							status: "$attendance.status",
						},
					},
				},
			},
			// Add a sort stage within the grouping to sort statuses by date and hour
			{
				$addFields: {
					statuses: {
						$sortArray: {
							input: "$statuses",
							sortBy: { date: 1, hour: 1 },
						},
					},
				},
			},
			{
				$group: {
					_id: "$_id.RegNo",
					Name: { $first: "$_id.Name" },
					courses: {
						$push: {
							course: "$_id.course",
							present: "$present",
							totalHours: "$totalHours",
							statuses: "$statuses",
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					RegNo: "$_id",
					name: "$Name",
					courses: 1,
				},
			},
			{
				$sort: {
					RegNo: 1, // Sort by RegNo
				},
			},
		]);

		console.log(result);
		res.status(200).json(result);
	} catch (err) {
		console.error("Error fetching student dashboard data:", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const FinalStudentData = async (req, res) => {
	const { RegNo, startDate, endDate, coursecode } = req.body;

	try {
		const ReportCollection = createReportCollection(coursecode);

		// Fetch the student's report data
		const result = await ReportCollection.aggregate([
			{
				$match: {
					date: {
						$gte: new Date(startDate),
						$lte: new Date(endDate),
					},
					"attendance.RegNo": RegNo,
					freeze: true,
				},
			},
			{
				$unwind: "$attendance",
			},
			{
				$match: {
					"attendance.RegNo": RegNo,
				},
			},
			{
				$group: {
					_id: "$attendance.RegNo",
					name: { $first: "$attendance.Name" },
					present: {
						$sum: {
							$cond: [
								{ $in: ["$attendance.status", [1, 2]] },
								1, // If status is 1 or 2, add 1 to present count
								0, // If not, add 0
							],
						},
					},
					totalHours: {
						$sum: 1, // Total number of records for the given RegNo within the date range
					},
				},
			},
			{
				$project: {
					_id: 0,
					RegNo: "$_id",
					name: 1,
					present: 1,
					totalHours: 1,
				},
			},
		]);

		console.log("@finalstudentdata:", result);
		if (result.length === 0) {
			return res.status(404).json({ message: "No student found." });
		}
		return res.status(200).send(result);
	} catch (err) {
		console.error(err);
		return res.status(500).send({ error: err.message });
	}
};

const deleteRecord = async (req, res) => {
	const { date, hr, dept, yr, coursecode } = req.body;
	console.log(date, hr, dept, yr, coursecode);
	const ReportCollection = createReportCollection(coursecode);
	try {
		const record = await ReportCollection.findOneAndDelete({ date, hr });
		console.log(record);
		return res
			.status(200)
			.send({ message: "Attendance record deleted successfully." });
	} catch (err) {
		console.error(err);
		return res.status(500).send({ error: err.message });
	}
};

module.exports = {
	updateAttendance,
	fetchData,
	studentDashboard,
	FinalStudentData,
	deleteRecord,
};
