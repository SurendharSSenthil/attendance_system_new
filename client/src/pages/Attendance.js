import React, { useState, useEffect } from "react";
import { Card, Row, Col, DatePicker, Select, Alert } from "antd";
import moment from "moment";
import { url } from "../Backendurl";
import AttendanceTable from "../components/AttendanceTable";

const Attendance = () => {
	const currentDate = moment().format("YYYY-MM-DD");
	const [currDate, setCurrDate] = useState(moment(currentDate, "YYYY-MM-DD"));
	const [data, setData] = useState([]);
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [hr, setHr] = useState(1);
	const [course, setCourse] = useState("");
	const [yr, setYr] = useState("");
	const [Class, setClass] = useState("");
	const [yrs, setYrs] = useState([]);
	const [Classes, setClasses] = useState([]);

	const handleDateChange = (date, dateString) => {
		setCurrDate(moment(dateString, "YYYY-MM-DD"));
	};

	const handleHrChange = (value) => {
		setHr(value);
	};

	const handleCourseChange = (value) => {
		setCourse(value);
	};

	const fetchCourses = async () => {
		setLoading(true);
		try {
			const coursesResponse = await fetch(`${url}/students/faculty-data`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			const coursesData = await coursesResponse.json();
			setCourses(Array.isArray(coursesData.course) ? coursesData.course : []);
			setYrs(Array.isArray(coursesData.yr) ? coursesData.yr : []);
			setClasses(Array.isArray(coursesData.dept) ? coursesData.dept : []);
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
				<Col span={5}>
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
				<Col span={5}>
					<Card className="w-[200px] md:w-[100%]">
						<p className="text-gray-500 mb-2">Select the Hour</p>
						<Select
							onChange={handleHrChange}
							value={hr}
							options={Array.from({ length: 8 }, (_, i) => ({
								label: `${i + 1}`,
								value: i + 1,
							}))}
						/>
					</Card>
				</Col>
				{courses.length > 0 && (
					<Col span={5}>
						<Card className="w-[200px] md:w-[100%]">
							<p className="text-gray-500 mb-2">Select the Course</p>
							<Select
								onChange={handleCourseChange}
								value={course}
								options={courses.map((course) => ({
									label: course.coursename,
									value: course.coursecode,
								}))}
								className="w-[120px]"
							/>
						</Card>
					</Col>
				)}
				<Col span={5}>
					<Card className="w-[200px] md:w-[100%]">
						<p className="text-gray-500 mb-2">Select the Year</p>
						<Select
							onChange={(e) => setYr(e)}
							value={yr}
							options={yrs.map((year) => ({
								label: year,
								value: year,
							}))}
							className="w-[120px]"
						/>
					</Card>
				</Col>
				<Col span={5}>
					<Card className="w-[200px] md:w-[100%]">
						<p className="text-gray-500 mb-2">Select the Class</p>
						<Select
							onChange={(e) => setClass(e)}
							value={Class}
							options={Classes.map((c) => ({
								label: c,
								value: c,
							}))}
							className="w-[120px]"
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
						setCount={() => {}}
						setLoading={setLoading}
						loading={loading}
						hr={hr}
						course={course}
						yr={yr}
						Class={Class}
					/>
				)}
			</Card>
		</div>
	);
};

export default Attendance;
