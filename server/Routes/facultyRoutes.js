const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const authenticateToken = require("../Middleware/middleware");

const createStudentCollection = require("../Models/studentModel");
const Class = require("../Models/courseModel");
const createReportCollection = require("../Models/reportModel");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get the faculty data - coursecode, coursename, and student details
router.get("/faculty-data", authenticateToken, async (req, res) => {
	try {
		const { id } = req.user;
		console.log("@faculty-data", id);
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
		res.status(500).send("Server Error");
	}
});

router.get("/profile", authenticateToken, async (req, res) => {
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
				if (useradmin && useradmin.role === "U") {
					rep.push(useradmin);
				}
				console.log(useradmin);
			}
			reps.push(rep);
		}

		console.log(
			fac,
			user,
			"courselen",
			courseLen,
			"countstd",
			stdCount,
			"hours",
			hrs,
			"Reps",
			reps
		);
		res.json({ fac, user, hrs, stdCount, reps });
	} catch (error) {
		console.error("Error fetching user profile:", error);
		res.status(500).send("Internal Server Error");
	}
});

// Fetch all students for a specific course
router.get("/:coursecode", authenticateToken, async (req, res) => {
	const { coursecode } = req.params;
	try {
		const StudentCollection = createStudentCollection(coursecode);

		const students = await StudentCollection.find().sort({ RegNo: 1 });

		console.log("@students list", students);
		res.json(students);
	} catch (error) {
		console.error("Error fetching students:", error);
		res.status(500).send("Server Error");
	}
});

router.post("/add-student", authenticateToken, async (req, res) => {
	const { StdName, RegNo, coursecode } = req.body;

	if (!StdName || !RegNo || !coursecode) {
		return res.status(404).json({ message: "Enter all fields" });
	}

	try {
		const StudentModel = createStudentCollection(coursecode);
		const user = await StudentModel.findOne({ RegNo, StdName });

		if (user) {
			return res.status(400).json({ message: "User already exists!" });
		}

		const newStudent = new StudentModel({ RegNo, StdName });

		const savedStudent = await newStudent.save();

		console.log("Added Student:", savedStudent);
		return res
			.status(200)
			.json({ message: "Student added successfully", student: savedStudent });
	} catch (err) {
		console.error("Error adding student:", err);
		return res.status(500).send("Internal Server Error");
	}
});

router.delete("/delete-student", authenticateToken, async (req, res) => {
	const { coursecode, RegNo } = req.body;

	try {
		const StudentCollection = createStudentCollection(coursecode);
		const student = await StudentCollection.findOneAndDelete({ RegNo });

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		console.log("Deleted Student:", student);
		return res
			.status(200)
			.json({ message: "Student deleted successfully", student });
	} catch (err) {
		console.error("Error deleting student:", err);
		return res.status(500).send("Internal Server Error");
	}
});

router.post("/unfreeze", authenticateToken, async (req, res) => {
	const { coursecode, date, hour } = req.body;
	console.log(coursecode, date, hour);
	try {
		const reportCollection = createReportCollection(coursecode);
		console.log(reportCollection);
		const report = await reportCollection.updateOne(
			{ coursecode, date, hr: hour },
			{ $set: { freeze: false, isExpired: false } }
		);
		console.log("Unfreeze attendance:", report);
		return res
			.status(200)
			.json({ message: "Unlocked attendance successfully", report });
	} catch (err) {
		console.error("Error Unfreeze attendance:", err);
		return res.status(500).send("Internal Server Error");
	}
});
// Create or update course and students from CSV file
router.post(
	"/create-course",
	authenticateToken,
	upload.single("file"),
	async (req, res) => {
		const {
			coursename,
			coursecode,
			facname,
			year,
			class: courseClass,
		} = req.body;
		const file = req.file;
		console.log(req.user.id);
		if (!file) {
			return res.status(400).json({ message: "CSV file is required" });
		}

		try {
			// Create or update course details
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

			// Process the CSV file
			const students = [];
			fs.createReadStream(file.path)
				.pipe(csv())
				.on("data", (row) => {
					students.push({ RegNo: row.RegNo, StdName: row.StdName });
				})
				.on("end", async () => {
					try {
						const StudentCollection = createStudentCollection(coursecode);
						await StudentCollection.insertMany(students);

						course.students = students.map((student) => student.RegNo);
						await course.save();

						// Clean up the uploaded file
						fs.unlinkSync(file.path);

						res.status(201).json({
							message: "Course and students created successfully",
							course,
						});
					} catch (err) {
						console.error("Error processing students:", err);
						res.status(500).json({ message: "Internal Server Error" });
					}
				})
				.on("error", (err) => {
					console.error("Error reading CSV file:", err);
					res.status(500).json({ message: "Internal Server Error" });
				});
		} catch (err) {
			console.error("Error occurred:", err);
			fs.unlinkSync(file.path);
			res.status(500).json({ message: "Internal Server Error" });
		}
	}
);

module.exports = router;
