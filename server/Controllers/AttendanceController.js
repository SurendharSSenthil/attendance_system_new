const createReportCollection = require("../Models/reportModel");
const createStudentCollection = require("../Models/studentModel");

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
				attendance,
			});

			await newReport.save();
			return res.status(201).json({
				message: "Attendance created successfully",
				report: newReport,
			});
		}

		// Update attendance records
		for (const entry of attendance) {
			const { RegNo, status, freeze } = entry;
			const existingEntry = report.attendance.find(
				(a) => a.RegNo.toString() === RegNo
			);

			if (existingEntry) {
				existingEntry.status = status;
				existingEntry.freeze = freeze;
			} else {
				report.attendance.push({ RegNo, status, freeze });
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
				freeze: false,
			}));

			reports = new ReportCollection({
				faculty: id,
				coursename,
				coursecode,
				date,
				hr,
				attendance,
			});

			await reports.save();
		}

		// Prepare the attendance data and count absentees
		let absenteeCount = 0;
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
				freeze: attendance ? attendance.freeze : false,
			};
		});

		console.log("@fetchData", attendanceData);
		res.status(200).json({
			reports: attendanceData,
			count: students_count,
			absentees: absenteeCount, // Include the number of absentees in the response
		});
	} catch (error) {
		console.error("Error fetching attendance data:", error);
		res.status(500).json({ message: "Failed to fetch attendance data." });
	}
};

const studentDashboard = async (req, res) => {
	try {
		const { startDate, endDate, coursecode } = req.body;
		console.log("@studentDashboard", startDate, endDate, coursecode);

		if (!coursecode) {
			return res.status(400).json({ error: "Course code is required" });
		}

		// Dynamically get the Report collection for the given coursecode
		const ReportCollection = createReportCollection(coursecode);

		// Perform aggregation to fetch and calculate attendance data
		const result = await ReportCollection.aggregate([
			{
				$match: {
					date: {
						$gte: new Date(startDate),
						$lte: new Date(endDate),
					},
				},
			},
			{
				$unwind: "$attendance",
			},
			{
				$match: {
					"attendance.status": { $in: [1, 2] },
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
	console.log(RegNo, startDate, endDate, coursecode);

	try {
		// Determine the dynamic report collection based on coursecode
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
				},
			},
			{
				$unwind: "$attendance",
			},
			{
				$match: {
					"attendance.RegNo": "RegNo",
				},
			},
			{
				$group: {
					_id: {
						RegNo: "$attendance.RegNo",
						Name: "$attendance.Name",
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
				},
			},
			{
				$group: {
					_id: "$_id.RegNo",
					name: { $first: "$_id.Name" },
					data: {
						$push: {
							// course: "$_id.course",
							present: "$present",
							totalHours: "$totalHours",
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					RegNo: "$_id",
					name: "$name",
					data: 1,
				},
			},
		]);

		console.log("@finalstudentdata:", result);
		res.status(200).send(result);
	} catch (err) {
		console.error(err);
		res.status(500).send({ error: err.message });
	}
};

module.exports = {
	updateAttendance,
	fetchData,
	studentDashboard,
	FinalStudentData,
};
