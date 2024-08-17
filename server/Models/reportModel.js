const mongoose = require("mongoose");

const createReportCollection = (courseCode) => {
	// Check if the model already exists
	const modelName = `reports_${courseCode}`;
	if (mongoose.models[modelName]) {
		return mongoose.models[modelName];
	}

	const reportSchema = new mongoose.Schema(
		{
			faculty: {
				type: mongoose.Schema.Types.ObjectId,
				// ref: "Admin",
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
			freeze: {
				type: Boolean,
				required: true,
			},
			isExpired: {
				type: Boolean,
				required: true,
			},
			attendance: [
				{
					RegNo: { type: String },
					Name: { type: String },
					status: { type: Number, required: true },
					// freeze: { type: Boolean, required: true },
				},
			],
		},
		{
			timestamps: true,
		}
	);

	// Create and return the model
	return mongoose.model(modelName, reportSchema);
};

module.exports = createReportCollection;
