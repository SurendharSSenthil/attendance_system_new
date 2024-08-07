const mongoose = require("mongoose");

const createStudentCollection = (courseCode) => {
	const studentSchema = new mongoose.Schema({
		RegNo: {
			type: String,
			required: true,
			unique: true,
		},
		StdName: {
			type: String,
			required: true,
		},
	});

	return mongoose.model(`students_${courseCode}`, studentSchema);
};

module.exports = createStudentCollection;
