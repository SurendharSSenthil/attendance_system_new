import React, { useEffect, useState } from "react";
import {
	Button,
	DatePicker,
	Form,
	Input,
	Card,
	Avatar,
	message,
	Select,
	Col,
	Row,
	Statistic,
} from "antd";
import { Pie } from "react-chartjs-2";
import { url } from "../Backendurl";
import { AreaChartOutlined } from "@ant-design/icons";
import "chart.js/auto";
const { RangePicker } = DatePicker;

const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 6 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 14 },
	},
};

const Dashboard = () => {
	const [form] = Form.useForm();
	const [studentData, setStudentData] = useState(null);
	const [courses, setCourses] = useState([]);

	const handleSubmit = async (values) => {
		const { RegNo, daterange, course } = values;
		const [startDate, endDate] = daterange;

		try {
			const response = await fetch(`${url}/attendance/getDashboardData`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					RegNo,
					startDate: startDate.format("YYYY-MM-DD"),
					endDate: endDate.format("YYYY-MM-DD"),
					coursecode: course,
				}),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			setStudentData(data[0]);
		} catch (error) {
			message.error("There was an error processing your request.");
			console.error("Fetch error: ", error);
		}
	};

	useEffect(() => {
		document.title = "ATTENDANCE SYSTEM | DASHBOARD";
	}, []);

	const generateChartData = (data) => {
		const labels = ["Present", "Absent"];
		const presentData = data.present;
		const absentData = data.totalHours - data.present;

		return {
			labels,
			datasets: [
				{
					label: "Attendance Summary",
					backgroundColor: ["#4d4dff", "#ff6699"],
					data: [presentData, absentData],
				},
			],
		};
	};

	const fetchCourses = async () => {
		try {
			const coursesResponse = await fetch(`${url}/students/faculty-data`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			const coursesData = await coursesResponse.json();
			setCourses(Array.isArray(coursesData.course) ? coursesData.course : []);
		} catch (err) {
			message.error("Failed to fetch courses. Please try again.");
			console.error(err);
		}
	};

	useEffect(() => {
		fetchCourses();
	}, []);

	return (
		<div>
			<Card>
				<p className="block text-lg text-gray-700 font-semibold">
					<span className="text-red-500 font-semibold">*</span> Input the
					register number to get the student's attendance summary
				</p>
				<br />
				<Form
					{...formItemLayout}
					form={form}
					style={{ maxWidth: 600 }}
					onFinish={handleSubmit}
				>
					<Form.Item
						label="Register Number"
						name="RegNo"
						rules={[
							{
								required: true,
								message: "Please input the student register number!",
							},
						]}
					>
						<Input />
					</Form.Item>
					{courses?.length > 0 && (
						<Form.Item
							label="Course"
							name="course"
							rules={[
								{
									required: true,
									message: "Please select the student's course!",
								},
							]}
						>
							<Select
								options={courses.map((course) => ({
									label: `${course.coursename}-${course.coursecode}`,
									value: `${course.coursecode}`,
								}))}
							/>
						</Form.Item>
					)}
					<Form.Item
						label="Select the date range:"
						name="daterange"
						rules={[
							{
								required: true,
								message: "Please input the date range!",
							},
						]}
					>
						<RangePicker />
					</Form.Item>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8}>
							<button
								type="submit"
								// onClick={fetchStudentData}
								className="relative py-0 px-4 h-10 mt-4 lg:mt-0 rounded-lg transition-all duration-300 bg-blue-500 text-white border-2 border-blue-500 hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/50  outline-none flex flex-row justify-center items-center font-semibold w-full"
							>
								Generate Report <AreaChartOutlined className="ml-2" />
							</button>
						</Col>
					</Row>
				</Form>
			</Card>

			{studentData && (
				<>
					<Card style={{ marginTop: 16 }}>
						<Card.Meta
							avatar={<Avatar>{studentData.name[0]}</Avatar>}
							title={studentData.name}
							description={`Register Number: ${studentData.RegNo}`}
						/>
					</Card>

					<Card style={{ marginTop: 16 }}>
						<Pie
							data={generateChartData(studentData)}
							options={{
								responsive: true,
								maintainAspectRatio: false,
							}}
							height={400}
						/>
					</Card>
					<div className="flex md:flex-row md:justify-center md:items-center flex-col items-center justify-center gap-4 mt-4">
						<Card className="md:w-[520px] w-full">
							<Statistic
								title="Number of hours Present"
								value={studentData.present}
								valueStyle={{
									color: "#3f8600",
								}}
							/>
						</Card>
						<Card className="md:w-[520px] w-full">
							<Statistic
								title="Number of hours Absent"
								value={studentData.totalHours - studentData.present}
								valueStyle={{
									color: "#cf1322",
								}}
							/>
						</Card>
					</div>
				</>
			)}
		</div>
	);
};

export default Dashboard;
