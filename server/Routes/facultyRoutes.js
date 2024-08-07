const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const authenticateToken = require("../Middleware/middleware");

const createStudentCollection = require("../Models/studentModel");
const Class = require("../Models/courseModel");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Fetch all students for a specific course
router.get("/:coursecode", authenticateToken, async (req, res) => {
	const { coursecode } = req.params;
	try {
		const StudentCollection = createStudentCollection(coursecode);

		const students = await StudentCollection.find().sort({ RegNo: 1 });

		console.log(students);
		res.json(students);
	} catch (error) {
		console.error("Error fetching students:", error);
		res.status(500).send("Server Error");
	}
});

// Get the faculty data - coursecode, coursename, and student details
router.get("/faculty-data", authenticateToken, async (req, res) => {
	try {
		const { username } = req.user;
		const data = await Class.find({ faculty: username });
		const course = data.map(({ coursecode, coursename }) => ({
			coursecode,
			coursename,
		}));
		res.status(200).json(course);
	} catch (err) {
		console.log(err);
		res.status(500).send("Server Error");
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

		if (!file) {
			return res.status(400).json({ message: "CSV file is required" });
		}

		try {
			// Create or update course details
			const courseData = {
				coursename,
				coursecode,
				faculty: facname,
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
					students.push({ RegNo: row.regNo, StdName: row.stdName });
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
