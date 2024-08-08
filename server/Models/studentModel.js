const mongoose = require("mongoose");

const createStudentCollection = (courseCode) => {
	// Check if the model already exists
	const modelName = `students_${courseCode}`;
	if (mongoose.models[modelName]) {
		return mongoose.models[modelName];
	}

	const studentSchema = new mongoose.Schema({
		RegNo: { type: String, required: true },
		StdName: { type: String, required: true },
	});

	// Create and return the model
	return mongoose.model(modelName, studentSchema);
};

module.exports = createStudentCollection;
