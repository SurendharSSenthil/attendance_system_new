const mongoose = require("mongoose");

const createReportCollection = (courseCode) => {
	const reportSchema = new mongoose.Schema({
		faculty: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
			required: true,
		},
		coursename: {
			type: String,
			required: true,
		},
		coursecode: {
			type: String,
			required: true,
		},
		hr: {
			type: Number,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		attendance: [
			{
				RegNo: { type: mongoose.Schema.Types.ObjectId },
				Name: { type: String },
				status: { type: Number, required: true },
				freeze: { type: Boolean, required: true },
			},
		],
	});

	return mongoose.model(`reports_${courseCode}`, reportSchema);
};

module.exports = createReportCollection;
