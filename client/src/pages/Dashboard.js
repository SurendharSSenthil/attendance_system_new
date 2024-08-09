import React, { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, Card, Avatar, message } from "antd";
import { Bar } from "react-chartjs-2";
import { url } from "../Backendurl";
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

	const handleSubmit = async (values) => {
		const { RegNo, daterange } = values;
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
					coursecode: "22spc202",
				}),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			setStudentData(data[0]); // Assuming the response is an array and we want the first element
		} catch (error) {
			message.error("There was an error processing your request.");
			console.error("Fetch error: ", error);
		}
	};

	useEffect(() => {
		document.title = "ATTENDANCE SYSTEM | DASHBOARD";
	}, []);

	const generateChartData = (data) => {
		const labels = data.map((item) => item.course);
		const presentData = data.map((item) => item.present);
		const totalData = data.map((item) => item.totalHours);

		return {
			labels,
			datasets: [
				{
					label: "Total Hours",
					backgroundColor: "#4d4dff",
					borderColor: "#4d4dff",
					borderWidth: 1,
					hoverBackgroundColor: "#4d4dff",
					hoverBorderColor: "#4d4dff",
					data: totalData,
				},
				{
					label: "Present",
					backgroundColor: "#ff6699",
					borderColor: "#ff6699",
					borderWidth: 1,
					hoverBackgroundColor: "#ff6699",
					hoverBorderColor: "#ff6699",
					data: presentData,
				},
			],
		};
	};

	return (
		<div>
			<Card>
				<p className="block text-lg text-gray-700">
					<span className="text-red-500 font-semibold">*</span>Input the
					register Number to get the student's attendance summary
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
					<Form.Item
						label="Select the date range:"
						name="daterange"
						rules={[
							{
								required: true,
								message: "Please input the range!",
							},
						]}
					>
						<RangePicker />
					</Form.Item>
					<Form.Item
						wrapperCol={{
							offset: 6,
							span: 16,
						}}
					>
						<Button type="primary" htmlType="submit">
							Submit
						</Button>
					</Form.Item>
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
						<Bar
							data={generateChartData(studentData.data)}
							options={{
								responsive: true,
								maintainAspectRatio: false,
							}}
							height={400}
						/>
					</Card>
				</>
			)}
		</div>
	);
};

export default Dashboard;
