const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const authenticateToken = require('../Middleware/middleware');
const createStudentCollection = require('../Models/studentModel');
const Class = require('../Models/courseModel');
const createReportCollection = require('../Models/reportModel');
const TimetableModel = require('../Models/timetableModel');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get the faculty data - coursecode, coursename, and student details
router.get('/faculty-data', authenticateToken, async (req, res) => {
	try {
		const { id } = req.user;
		console.log('@faculty-data', id);
		const data = await Class.find({ faculty: id });
		console.log(data);
		const yr = data.map((d) => d.dept);
		const dept = data.map((d) => d.class);
		const course = data.map(({ coursecode, coursename }) => ({
			coursecode,
			coursename,
		}));
		console.log(yr, dept, course);
		res.status(200).json({ data: data, course: course, dept, yr });
	} catch (err) {
		console.log(err);
		res.status(500).send('Server Error');
	}
});

router.get('/profile', authenticateToken, async (req, res) => {
	try {
		const { id } = req.user;
		console.log(id);
		const fac = await admin.findById(id);
		const user = await Class.find({ faculty: { $in: [id] } });
		const courseLen = user.length;
		let stdCount = [];
		for (let x = 0; x < courseLen; x++) {
			stdCount[x] = user[x].students.length;
		}
		let hrs = [];
		for (let x = 0; x < courseLen; x++) {
			const report = createReportCollection(user[x].coursecode);
			hrs[x] = await report.countDocuments({ freeze: true });
		}
		let reps = [];
		for (let x = 0; x < courseLen; x++) {
			let repCount = user[x].faculty.length;
			const rep = [];
			for (let i = 0; i < repCount; i++) {
				const useradmin = await admin.findById(user[x].faculty[i]);
				if (useradmin && useradmin.role === 'U') {
					rep.push(useradmin);
				}
				console.log(useradmin);
			}
			reps.push(rep);
		}

		console.log(
			fac,
			user,
			'courselen',
			courseLen,
			'countstd',
			stdCount,
			'hours',
			hrs,
			'Reps',
			reps
		);
		res.json({ fac, user, hrs, stdCount, reps });
	} catch (error) {
		console.error('Error fetching user profile:', error);
		res.status(500).send('Internal Server Error');
	}
});

// Fetch all students for a specific course
router.get('/:coursecode', authenticateToken, async (req, res) => {
	const { coursecode } = req.params;
	try {
		const StudentCollection = createStudentCollection(coursecode);

		const students = await StudentCollection.find().sort({ RegNo: 1 });

		console.log('@students list', students);
		res.json(students);
	} catch (error) {
		console.error('Error fetching students:', error);
		res.status(500).send('Server Error');
	}
});

router.post('/add-student', authenticateToken, async (req, res) => {
	const { StdName, RegNo, coursecode } = req.body;

	if (!StdName || !RegNo || !coursecode) {
		return res.status(404).json({ message: 'Enter all fields' });
	}

	try {
		const StudentModel = createStudentCollection(coursecode);
		const reportModel = createReportCollection(coursecode);
		const user = await StudentModel.findOne({ RegNo });

		if (user) {
			return res.status(400).json({ message: 'User already exists!' });
		}

		const newStudent = new StudentModel({ RegNo, StdName });

		const savedStudent = await newStudent.save();

		const newReport = await reportModel.updateMany(
			{},
			{ $push: { attendance: { RegNo, Name: StdName, status: -1 } } }
		);
		console.log('Added Student to all reports:', newReport);
		console.log('Added Student to the student collection:', savedStudent);
		return res
			.status(200)
			.json({ message: 'Student added successfully', student: savedStudent });
	} catch (err) {
		console.error('Error adding student:', err);
		return res.status(500).send('Internal Server Error');
	}
});

router.delete('/delete-student', authenticateToken, async (req, res) => {
	const { coursecode, RegNo } = req.body;
	console.log(coursecode, RegNo);
	try {
		const StudentCollection = createStudentCollection(coursecode);
		const reportCollection = createReportCollection(coursecode);
		const student = await StudentCollection.findOneAndDelete({ RegNo });

		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		const result = await reportCollection.updateMany(
			{},
			{ $pull: { attendance: { RegNo } } }
		);
		console.log('Deleted from reports:', result);
		console.log('Deleted Student:', student);
		return res
			.status(200)
			.json({ message: 'Student deleted successfully', student });
	} catch (err) {
		console.error('Error deleting student:', err);
		return res.status(500).send('Internal Server Error');
	}
});

router.post('/unfreeze', authenticateToken, async (req, res) => {
	const { coursecode, date, hour } = req.body;
	console.log(coursecode, date, hour);
	try {
		const reportCollection = createReportCollection(coursecode);
		console.log(reportCollection);
		const report = await reportCollection.updateOne(
			{ coursecode, date, hr: hour },
			{ $set: { freeze: false, isExpired: false } }
		);
		console.log('Unfreeze attendance:', report);
		return res
			.status(200)
			.json({ message: 'Unlocked attendance successfully', report });
	} catch (err) {
		console.error('Error Unfreeze attendance:', err);
		return res.status(500).send('Internal Server Error');
	}
});

router.delete('/delete-course', authenticateToken, async (req, res) => {
	const { coursecode } = req.body;
	const { id } = req.user;

	try {
		// Create collections for the specific course
		const StudentCollection = createStudentCollection(coursecode);
		const reportCollection = createReportCollection(coursecode);

		// Drop the entire student collection related to the course
		await StudentCollection.collection.drop();

		// Drop the entire report collection related to the course
		await reportCollection.collection.drop();

		// Delete the course document from the main course collection
		const course = await Class.findOneAndDelete({
			coursecode,
			faculty: { $in: [id] },
		});

		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		console.log('Deleted Course:', course);
		return res
			.status(200)
			.json({ message: 'Course deleted successfully', course });
	} catch (err) {
		console.error('Error deleting course:', err);

		// Handle specific errors when a collection doesn't exist
		if (err.code === 26) {
			return res.status(400).json({ message: 'Collection does not exist.' });
		}

		return res.status(500).json({ message: err.message });
	}
});

const normalizeHeader = (header) => {
	const normalizedHeader = header.replace(/\s+/g, '').toLowerCase();

	if (
		['regno', 'regnumber', 'registernumber', 'registerno'].includes(
			normalizedHeader
		)
	) {
		return 'RegNo';
	} else if (['stdname', 'studentname', 'name'].includes(normalizedHeader)) {
		return 'StdName';
	}
	return null;
};

router.post(
	'/create-course',
	authenticateToken,
	upload.single('file'),
	async (req, res) => {
		const {
			coursename,
			coursecode,
			facname,
			year,
			class: courseClass,
		} = req.body;
		const file = req.file;
		console.log(req.body);
		if (!file) {
			return res.status(400).json({ message: 'CSV file is required' });
		}

		try {
			const courseData = {
				coursename,
				coursecode,
				faculty: req.user.id,
				class: courseClass,
				dept: year,
				students: [],
			};

			// Create a new course or update existing course
			const course = await Class.findOneAndUpdate({ coursecode }, courseData, {
				upsert: true,
				new: true,
			});
			const students = [];
			fs.createReadStream(file.path)
				.pipe(
					csv({
						mapHeaders: ({ header }) => normalizeHeader(header),
					})
				)
				.on('data', (row) => {
					if (row.RegNo && row.StdName) {
						students.push({
							RegNo: row.RegNo,
							StdName: row.StdName,
						});
					}
				})
				.on('end', async () => {
					try {
						const StudentCollection = createStudentCollection(coursecode);
						await StudentCollection.insertMany(students);

						course.students = students.map((student) => student.RegNo);
						await course.save();

						fs.unlinkSync(file.path);

						res.status(201).json({
							message: 'Course and students created successfully',
							course,
						});
					} catch (err) {
						console.error('Error processing students:', err);
						res.status(500).json({ message: 'Internal Server Error' });
					}
				})
				.on('error', (err) => {
					console.error('Error reading CSV file:', err);
					res.status(500).json({ message: 'Internal Server Error' });
				});
		} catch (err) {
			console.error('Error occurred:', err);
			fs.unlinkSync(file.path);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	}
);

router.post('/get-time-table', authenticateToken, async (req, res) => {
	const { coursename, coursecode, yr, dept } = req.body;
	console.log(coursename, coursecode);
	// Basic validation: Check if required fields are provided
	if (!coursecode || !yr || !dept) {
		return res
			.status(400)
			.json({ message: 'coursename, coursecode are required' });
	}

	try {
		// Check if the timetable already exists for the coursecode
		const existingTimetable = await TimetableModel.findOne({ coursecode });

		if (!existingTimetable) {
			return res.status(404).json({ message: 'time table is not found' });
		}
		return res.status(200).send(existingTimetable);
	} catch (err) {
		console.error('Error occurred while adding timetable:', err);
		res.status(500).json({ message: 'Internal Server Error' });
	}
});
router.post('/add-time-table', authenticateToken, async (req, res) => {
	const { coursename, coursecode, timetable, yr, dept } = req.body;

	// Basic validation: Check if required fields are provided
	if (!coursename || !coursecode || !timetable || !yr || !dept) {
		return res.status(400).json({
			message: 'coursename, coursecode, timetable, yr, and dept are required',
		});
	}
	console.log(coursename, coursecode, timetable, yr, dept);

	try {
		// Check if a timetable already exists for the given coursecode, year, and department
		const existingTimetable = await TimetableModel.findOne({
			coursecode,
			yr,
			dept,
		});
		console.log(existingTimetable);

		// Update existing timetable or create a new one if it doesn't exist
		const updatedTimetable = await TimetableModel.findOneAndUpdate(
			{ coursecode, yr, dept },
			{
				$set: {
					coursename,
					timetable,
				},
			},
			{ new: true, upsert: true } // upsert: true will create a new document if none is found
		);

		if (existingTimetable) {
			// Success response for update
			return res
				.status(200)
				.json({ message: 'Timetable updated successfully!' });
		} else {
			// Success response for new creation
			return res.status(201).json({ message: 'Timetable added successfully!' });
		}
	} catch (err) {
		console.error('Error occurred while adding/updating timetable:', err);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

router.post('/edit-student', authenticateToken, async (req, res) => {
	const { oldname, newname, oldreg, newreg, coursecode } = req.body;

	// Check if coursecode is provided
	if (!coursecode) {
		return res.status(400).json({ message: 'Course code is required!' });
	}

	// Check if there's at least one pair of values for updating
	if (!oldname && !newname && !oldreg && !newreg) {
		return res.status(400).json({ message: 'No fields to update!' });
	}

	try {
		const students = createStudentCollection(coursecode);
		const reports = createReportCollection(coursecode);

		// Build update filter and update object dynamically
		const filter = {};
		const update = {};

		// Filter criteria - old values
		if (oldname) filter.StdName = oldname;
		if (oldreg) filter.RegNo = oldreg;

		// Update data - new values
		if (newname) update.StdName = newname;
		if (newreg) update.RegNo = newreg;

		// Ensure there's something to update
		if (Object.keys(filter).length === 0 || Object.keys(update).length === 0) {
			return res.status(400).json({ message: 'Invalid update data!' });
		}

		// Perform update operation in the students collection
		const studentUpdateResult = await students.findOneAndUpdate(filter, {
			$set: update,
		});

		if (!studentUpdateResult) {
			return res.status(404).json({ message: 'Student not found!' });
		}

		// Build filter and update for reports collection
		const attendanceFilter = {};
		const attendanceUpdate = {};

		if (oldname) attendanceFilter['attendance.Name'] = oldname;
		if (oldreg) attendanceFilter['attendance.RegNo'] = oldreg;

		// Update the attendance array in all related documents
		if (newname) attendanceUpdate['attendance.$[elem].Name'] = newname;
		if (newreg) attendanceUpdate['attendance.$[elem].RegNo'] = newreg;

		// Perform update operation in the reports collection
		const reportUpdateResult = await reports.updateMany(
			attendanceFilter,
			{ $set: attendanceUpdate },
			{
				arrayFilters: [
					{
						$or: [
							{ 'elem.Name': oldname || null },
							{ 'elem.RegNo': oldreg || null },
						],
					},
				],
			}
		);

		// Response to client
		return res.status(200).json({
			message: 'Student and attendance updated successfully',
			studentUpdate: studentUpdateResult,
			attendanceUpdate: reportUpdateResult.modifiedCount,
		});
	} catch (err) {
		console.error('Error @edit-student', err);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

module.exports = router;
