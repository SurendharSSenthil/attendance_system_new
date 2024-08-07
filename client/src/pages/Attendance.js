import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, DatePicker, Alert } from "antd";
import { UserOutlined } from "@ant-design/icons";
import AttendanceTable from "../components/AttendanceTable";
import { url } from "../Backendurl";
import moment from "moment";

const Attendance = ({ user, setAuth }) => {
	const currentDate = moment().format("YYYY-MM-DD");
	const [currDate, setCurrDate] = useState(moment(currentDate, "YYYY-MM-DD"));
	const [data, setData] = useState([]);
	const [course, setCourse] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [count, setCount] = useState(0);

	const handleDateChange = (date, dateString) => {
		setCurrDate(moment(dateString, "YYYY-MM-DD"));
		console.log("dateString", dateString);
	};

	const fetchCourses = async () => {
		setLoading(true);
		try {
			const coursesResponse = await fetch(`${url}/students/courseList`);
			const coursesData = await coursesResponse.json();
			setCourse(coursesData.courses);
		} catch (err) {
			setError("Failed to fetch courses. Please try again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCourses();
	}, []);

	useEffect(() => {
		document.title = "ATTENDANCE SYSTEM";
	}, []);
	return (
		<div>
			<Row gutter={16} className="flex flex-col gap-4 md:flex-row md:gap-2">
				<Col span={8}>
					<Card className="w-[200px] md:w-[100%]">
						<Statistic
							title={
								<>
									<UserOutlined /> Total Students
								</>
							}
							value={count}
						/>
					</Card>
				</Col>
				<Col span={8}>
					<Card className="w-[200px] md:w-[100%]">
						<p className="text-gray-500 mb-2">Select the Date</p>
						<DatePicker
							onChange={handleDateChange}
							disabledDate={(current) => current && current > moment()}
							value={currDate}
							format="YYYY-MM-DD"
						/>
					</Card>
				</Col>
			</Row>
			<Card style={{ marginTop: "16px" }}>
				{error ? (
					<Alert message={error} type="error" />
				) : (
					<AttendanceTable
						currDate={currDate.format("YYYY-MM-DD")}
						data={data}
						setData={setData}
						courses={course}
						setCount={setCount}
						setLoading={setLoading}
						loading={loading}
					/>
				)}
			</Card>
		</div>
	);
};

export default Attendance;
