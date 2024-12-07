const createReportCollection = require('../Models/reportModel');
const createStudentCollection = require('../Models/studentModel');
const classmodel = require('../Models/courseModel');
const TimetableModel = require('../Models/timetableModel');
const moment = require('moment');

const updateAttendance = async (req, res) => {
	const { coursecode, coursename, facname, date, hr, attendance } = req.body;

	if (!coursecode || !coursename || !date || !hr || !attendance) {
		return res.status(400).json({ message: 'All fields are required' });
	}

	console.log(coursecode, coursename, facname, date, hr, attendance);

	try {
		// Create or get the report collection based on course code
		const ReportCollection = createReportCollection(coursecode);

		// Find the existing report or create a new one
		for (let hour of hr) {
			const report = await ReportCollection.findOne({ date, hr: hour });

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
					message: 'Attendance created successfully',
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
		}

		res.status(200).json({ message: 'Attendance updated successfully' });
	} catch (err) {
		console.error('Error updating attendance:', err);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

// initial data fetch for a date, for a course, for 1-8 number of hours..
const fetchData = async (req, res) => {
	const { date, coursecode, coursename, hr, yr, Class } = req.body;
	const { id: facultyId } = req.user;
	console.log(hr, yr, Class);

	try {
		// Fetch class details based on course code, department, and class
		const classDetails = await classmodel.find({
			coursecode,
			dept: yr,
			class: Class,
		});
		if (classDetails.length <= 0) {
			return res
				.status(404)
				.json({ message: 'No students found! Please check the input fields.' });
		}

		// Dynamically fetch the student collection based on course code
		const StudentCollection = createStudentCollection(coursecode);
		const students = await StudentCollection.find().sort({ RegNo: 1 });
		const totalStudents = await StudentCollection.countDocuments();

		// Fetch all the attendance reports for the specified hours at once
		const ReportCollection = createReportCollection(coursecode);
		const existingReports = await ReportCollection.find({
			date,
			hr: { $in: hr.map((hour) => parseInt(hour)) },
		});

		// Check if all the hours are already marked or none are marked
		if (existingReports.length > 0 && existingReports.length !== hr.length) {
			// If some but not all hours are marked, return an error response
			return res.status(400).json({
				message:
					'The attendance cannot be marked! Some of the hours may already be taken!',
			});
		}

		let attendanceReport;
		let isExpired = false;
		let freeze = false;

		// If no reports exist for these hours, create new ones
		if (existingReports.length === 0) {
			for (let hour of hr) {
				const initialAttendance = students.map((student) => ({
					RegNo: student.RegNo,
					Name: student.StdName,
					status: 1, // Assuming 1 means present
				}));

				attendanceReport = new ReportCollection({
					faculty: facultyId,
					coursename,
					coursecode,
					date,
					hr: parseInt(hour),
					freeze: false,
					isExpired: false,
					attendance: initialAttendance,
				});

				await attendanceReport.save();
			}
		} else {
			attendanceReport = existingReports[0]; // Use the existing report for further calculations
			isExpired = isExpired || attendanceReport?.isExpired;
			freeze = freeze || attendanceReport?.freeze;
		}

		// Calculate attendance and absentees for the current hours
		let absenteeCount = 0;
		const attendanceData = students.map((student) => {
			const attendance = attendanceReport.attendance.find(
				(a) => a.RegNo === student.RegNo
			);

			if (attendance && attendance.status === -1) {
				absenteeCount++;
			}

			return {
				RegNo: student.RegNo,
				Name: student.StdName,
				status: attendance ? attendance.status : 1,
			};
		});

		return res.status(200).json({
			reports: attendanceData,
			count: totalStudents,
			absentees: absenteeCount,
			isExpired,
			freeze,
		});
	} catch (error) {
		console.error('Error fetching attendance data:', error);
		res.status(500).json({ message: 'Failed to fetch attendance data.' });
	}
};

const studentDashboard = async (req, res) => {
	try {
		const {
			isSingleDate,
			date,
			startDate,
			endDate,
			coursecode,
			yr,
			Class,
			startRange,
			endRange,
		} = req.body;

		if (!coursecode) {
			return res.status(400).json({ error: 'Course code is required' });
		}

		// Fetch class data based on coursecode, year, and class
		const data = await classmodel.findOne({
			coursecode,
			dept: yr,
			class: Class,
		});
		if (!data) {
			return res.status(404).json({ message: 'No students found! Please check the input fields' });
		}

		const totalStudents = data.students.length;

		// Select students based on startRange and endRange
		const selectedStudents = data.students.slice(
			startRange ? startRange - 1 : 0,
			endRange ? endRange : totalStudents
		);
		console.log('SELECTED STUDENTS: ',selectedStudents, selectedStudents.length);
		if (selectedStudents.length === 0) {
			return res.status(404).json({ message: 'No students found in the specified range' });
		}

		// Find the timetable for the course
		const timetable = await TimetableModel.findOne({ coursecode });
		if (!timetable) {
			return res.status(404).json({ message: 'No timetable found for the course' });
		}

		const ReportCollection = createReportCollection(coursecode);

		// Build the date filter condition
		let dateFilter = {};
		if (isSingleDate && Array.isArray(date) && date.length > 0) {
			dateFilter = { date: { $in: date.map((d) => new Date(d)) } };
		} else {
			dateFilter = {
				date: {
					$gte: startDate ? new Date(startDate) : new Date('1970-01-01'),
					$lte: endDate ? new Date(endDate) : new Date(),
				},
			};
		}
		console.log(dateFilter)

		// Aggregate data for student attendance and OD count
		const result = await ReportCollection.aggregate([
			{
				$match: {
					...dateFilter,
					
				},
			},
			{ $unwind: '$attendance' },
			{
				$match: {
					freeze: { $eq: true },
					'attendance.RegNo': { $in: selectedStudents },
				},
			},
			{
				$group: {
					_id: {
						RegNo: '$attendance.RegNo',
						Name: '$attendance.Name',
						course: '$coursecode',
					},
					present: {
						$sum: {
							$cond: [{ $in: ['$attendance.status', [1, 2]] }, 1, 0],
						},
					},
					OD: {
						$sum: { $cond: [{ $eq: ['$attendance.status', 2] }, 1, 0] },
					},
					totalHours: { $sum: 1 },
					statuses: {
						$push: {
							date: '$date',
							hour: '$hr',
							status: '$attendance.status',
						},
					},
				},
			},
			{
				$addFields: {
					statuses: {
						$map: {
							input: '$statuses',
							as: 'statusEntry',
							in: {
								date: '$$statusEntry.date',
								hour: '$$statusEntry.hour',
								status: '$$statusEntry.status',
								valid: {
									$let: {
										vars: {
											dayOfWeek: { $dayOfWeek: '$$statusEntry.date' },
											timetableHours: {
												$switch: {
													branches: [
														{
															case: { $eq: [{ $dayOfWeek: '$$statusEntry.date' }, 2] },
															then: { $ifNull: [timetable.timetable.monday, []] },
														},
														{
															case: { $eq: [{ $dayOfWeek: '$$statusEntry.date' }, 3] },
															then: { $ifNull: [timetable.timetable.tuesday, []] },
														},
														{
															case: { $eq: [{ $dayOfWeek: '$$statusEntry.date' }, 4] },
															then: { $ifNull: [timetable.timetable.wednesday, []] },
														},
														{
															case: { $eq: [{ $dayOfWeek: '$$statusEntry.date' }, 5] },
															then: { $ifNull: [timetable.timetable.thursday, []] },
														},
														{
															case: { $eq: [{ $dayOfWeek: '$$statusEntry.date' }, 6] },
															then: { $ifNull: [timetable.timetable.friday, []] },
														},
													],
													default: [],
												},
											},
										},
										in: {
											$cond: [
												{ $in: ['$$statusEntry.hour', '$$timetableHours'] },
												true,
												false,
											],
										},
									},
								},
							},
						},
					},
				},
			},
			{
				$addFields: {
					validHours: {
						$size: {
							$filter: {
								input: '$statuses',
								as: 'statusEntry',
								cond: { $eq: ['$$statusEntry.valid', true] },
							},
						},
					},
					validPresent: {
						$size: {
							$filter: {
								input: '$statuses',
								as: 'statusEntry',
								cond: {
									$and: [
										{ $eq: ['$$statusEntry.valid', true] },
										{ $in: ['$$statusEntry.status', [1, 2]] },
									],
								},
							},
						},
					},
				},
			},
			{
				$group: {
					_id: '$_id.RegNo',
					Name: { $first: '$_id.Name' },
					courses: {
						$push: {
							course: '$_id.course',
							present: '$present',
							OD: '$OD',
							totalHours: '$totalHours',
							validHours: '$validHours',
							validPresent: '$validPresent',
							statuses: '$statuses',
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					RegNo: '$_id',
					name: '$Name',
					courses: 1,
				},
			},
			{
				$sort: {
					RegNo: 1,
				},
			},
		]);

		console.log( result.length);
		res.status(200).json(result);
	} catch (err) {
		console.error('Error fetching student dashboard data:', err);
		res.status(500).json({ error: 'Internal Server Error' });
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
					'attendance.RegNo': RegNo,
					freeze: true,
				},
			},
			{
				$unwind: '$attendance',
			},
			{
				$match: {
					'attendance.RegNo': RegNo,
				},
			},
			{
				$group: {
					_id: '$attendance.RegNo',
					name: { $first: '$attendance.Name' },
					present: {
						$sum: {
							$cond: [
								{ $in: ['$attendance.status', [1, 2]] },
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
					RegNo: '$_id',
					name: 1,
					present: 1,
					totalHours: 1,
				},
			},
		]);

		console.log('@finalstudentdata:', result);
		if (result.length === 0) {
			return res.status(404).json({ message: 'No student found.' });
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
			.send({ message: 'Attendance record deleted successfully.' });
	} catch (err) {
		console.error(err);
		return res.status(500).send({ error: err.message });
	}
};

const unmarkedAttendanceHours = async (req, res) => {
	const { courses } = req.body;
	console.log(courses);

	if (!Array.isArray(courses) || courses.length === 0) {
		return res.status(400).json({ message: 'Please provide a valid array of course codes' });
	}

	try {
		const results = [];

		for (const coursecode of courses) {
			const timetable = await TimetableModel.findOne({ coursecode });
			if (!timetable) {
				results.push({ coursecode, unmarkedHours: null, pendingHours: [], message: 'No timetable found for the course' });
				continue;
			}

			const ReportCollection = createReportCollection(coursecode);
			const lastReport = await ReportCollection.findOne({}).sort({ date: -1 });
			const lastDate = lastReport ? lastReport.date : null;

			if (!lastDate) {
				results.push({ coursecode, unmarkedHours: null, pendingHours: [], message: 'No attendance records found for the course' });
				continue;
			}

			const currentDate = moment().startOf('day');
			const startDate = moment(lastDate).add(1, 'days');
			let unmarkedHours = 0;
			let pendingHours = [];

			for (let date = startDate; date.isBefore(currentDate); date.add(1, 'days')) {
				const dayOfWeek = date.day();
				let dayHours = [];

				switch (dayOfWeek) {
					case 1:
						dayHours = timetable.timetable.monday || [];
						break;
					case 2:
						dayHours = timetable.timetable.tuesday || [];
						break;
					case 3:
						dayHours = timetable.timetable.wednesday || [];
						break;
					case 4:
						dayHours = timetable.timetable.thursday || [];
						break;
					case 5:
						dayHours = timetable.timetable.friday || [];
						break;
				}

				for (const hour of dayHours) {
					const attendanceRecorded = await ReportCollection.findOne({
						date: date.toDate(),
						hr: hour,
					});
					if (!attendanceRecorded) {
						unmarkedHours += 1;
						pendingHours.push({ date: date.format("YYYY-MM-DD"), hour });
					}
				}
			}

			results.push({
				coursecode,
				unmarkedHours,
				pendingHours,
				message: 'Unmarked attendance hours fetched successfully'
			});
		}

		res.status(200).json(results);
	} catch (error) {
		console.error('Error fetching unmarked attendance hours:', error);
		res.status(500).json({ message: 'Failed to fetch unmarked attendance hours' });
	}
};



module.exports = {
	updateAttendance,
	fetchData,
	studentDashboard,
	FinalStudentData,
	deleteRecord,
	unmarkedAttendanceHours
};
