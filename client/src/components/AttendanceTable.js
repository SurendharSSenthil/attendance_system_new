import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Table, Select, Button, message, notification, Spin } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { url } from "../Backendurl";

const { Option } = Select;

const AttendanceTable = ({
	currDate,
	courses,
	setCount,
	setLoading,
	loading,
}) => {
	const [hour1Data, setHour1Data] = useState([]);
	const [hour2Data, setHour2Data] = useState([]);
	const [hour3Data, setHour3Data] = useState([]);
	const [hour4Data, setHour4Data] = useState([]);
	const [hour5Data, setHour5Data] = useState([]);
	const [hour6Data, setHour6Data] = useState([]);
	const [hour7Data, setHour7Data] = useState([]);
	const [hour8Data, setHour8Data] = useState([]);
	const [selectedCourse, setSelectedCourse] = useState("");

	const fetchAttendance = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch(`${url}/attendance/${currDate}`);
			const attendanceData = await response.json();
			if (attendanceData) {
				setCount(attendanceData.count || 0);

				const processStudentData = (student, hourIndex) => ({
					...student,
					hours: student.hours[hourIndex] || { status: 1 },
				});

				setHour1Data(
					attendanceData.reports.map((student) =>
						processStudentData(student, 0)
					)
				);
				setHour2Data(
					attendanceData.reports.map((student) =>
						processStudentData(student, 1)
					)
				);
				setHour3Data(
					attendanceData.reports.map((student) =>
						processStudentData(student, 2)
					)
				);
				setHour4Data(
					attendanceData.reports.map((student) =>
						processStudentData(student, 3)
					)
				);
				setHour5Data(
					attendanceData.reports.map((student) =>
						processStudentData(student, 4)
					)
				);
				setHour6Data(
					attendanceData.reports.map((student) =>
						processStudentData(student, 5)
					)
				);
				setHour7Data(
					attendanceData.reports.map((student) =>
						processStudentData(student, 6)
					)
				);
				setHour8Data(
					attendanceData.reports.map((student) =>
						processStudentData(student, 7)
					)
				);
			}
			setLoading(false);
		} catch (error) {
			console.error("Error fetching attendance data:", error);
			setLoading(false);
			message.error("Failed to fetch attendance data.");
		}
	}, [currDate, setCount]);

	useEffect(() => {
		fetchAttendance();
		console.log("@useEffect", currDate);
	}, [fetchAttendance]);

	const handleStatusChange = (value, key, hour) => {
		const updateData = (data) =>
			data.map((student) =>
				student.RegNo === key
					? { ...student, hours: { ...student.hours, status: value } }
					: student
			);

		switch (hour) {
			case 1:
				setHour1Data(updateData);
				break;
			case 2:
				setHour2Data(updateData);
				break;
			case 3:
				setHour3Data(updateData);
				break;
			case 4:
				setHour4Data(updateData);
				break;
			case 5:
				setHour5Data(updateData);
				break;
			case 6:
				setHour6Data(updateData);
				break;
			case 7:
				setHour7Data(updateData);
				break;
			case 8:
				setHour8Data(updateData);
				break;
			default:
				break;
		}
	};

	const handleSelectChange = useCallback((val, i) => {
		console.log(val, i);
		setSelectedCourse(val);
	}, []);

	const handleFreezeClick = useCallback(
		async (hour) => {
			try {
				const data = [
					hour1Data,
					hour2Data,
					hour3Data,
					hour4Data,
					hour5Data,
					hour6Data,
					hour7Data,
					hour8Data,
				][hour - 1];
				console.log(selectedCourse);
				if (selectedCourse === "") {
					message.error("course is not selected!");
					return;
				}
				const updates = data.map((student) => ({
					studentId: student.RegNo,
					date: currDate,
					course: selectedCourse,
					hour,
					status: student.hours?.status || 1,
				}));

				const response = await fetch(`${url}/attendance/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updates),
				});

				if (response.ok) {
					message.success(`Hour ${hour} data has been frozen.`);
					setSelectedCourse("");
					fetchAttendance();
				} else {
					message.error("Failed to update attendance data.");
				}
			} catch (error) {
				console.error("Error updating attendance data:", error);
				message.error("Failed to update attendance data.");
			}
		},
		[
			currDate,
			selectedCourse,
			hour1Data,
			hour2Data,
			hour3Data,
			hour4Data,
			hour5Data,
			hour6Data,
			hour7Data,
			hour8Data,
			fetchAttendance,
		]
	);

	const columns = useMemo(
		() => [
			{
				title: "RegNo",
				dataIndex: "RegNo",
				key: "RegNo",
				fixed: "left",
			},
			{
				title: "Student Name",
				dataIndex: "Name",
				key: "Name",
				// fixed: "left",
			},
			...Array.from({ length: 8 }, (_, i) => ({
				title: [
					hour1Data,
					hour2Data,
					hour3Data,
					hour4Data,
					hour5Data,
					hour6Data,
					hour7Data,
					hour8Data,
				][i][0]?.hours?.freeze ? (
					<span>
						{
							[
								hour1Data,
								hour2Data,
								hour3Data,
								hour4Data,
								hour5Data,
								hour6Data,
								hour7Data,
								hour8Data,
							][i][0]?.hours?.course
						}
					</span>
				) : (
					<Select
						onChange={(value) => handleSelectChange(value, i)}
						style={{ minWidth: "150px" }}
					>
						{courses.map((course) => (
							<Option key={course.coursecode} value={course.coursename}>
								{course.coursename}
							</Option>
						))}
					</Select>
				),
				key: `hour${i + 1}`,
				dataIndex: `hour${i + 1}`,
				render: (text, record) => {
					const hourData = [
						hour1Data,
						hour2Data,
						hour3Data,
						hour4Data,
						hour5Data,
						hour6Data,
						hour7Data,
						hour8Data,
					][i].find((student) => student.RegNo === record.RegNo)?.hours;
					return hourData?.freeze ? (
						<span
							className={
								hourData.status === 1
									? "text-black"
									: hourData.status === -1
									? "text-red-500 font-semibold"
									: "text-yellow-500 font-semibold"
							}
						>
							{hourData.status === 1
								? "Present"
								: hourData.status === -1
								? "Absent"
								: "On Duty"}
						</span>
					) : (
						<Select
							value={hourData?.status}
							onChange={(value) =>
								handleStatusChange(value, record.RegNo, i + 1)
							}
							status={
								hourData?.status === -1
									? "error"
									: hourData?.status === 2
									? "warning"
									: ""
							}
						>
							<Option value={1}>Present</Option>
							<Option value={-1}>Absent</Option>
							<Option value={2}>On Duty</Option>
						</Select>
					);
				},
			})),
		],
		[
			hour1Data,
			hour2Data,
			hour3Data,
			hour4Data,
			hour5Data,
			hour6Data,
			hour7Data,
			hour8Data,
			handleSelectChange,
			courses,
			handleStatusChange,
		]
	);

	const hourFreezeButtons = useMemo(
		() => (
			<div className="flex flex-wrap justify-start items-center flex-row gap-4 mt-4">
				{Array.from({ length: 8 }, (_, i) => (
					<Button
						key={i}
						type="primary"
						onClick={() => handleFreezeClick(i + 1)}
						disabled={
							[
								hour1Data,
								hour2Data,
								hour3Data,
								hour4Data,
								hour5Data,
								hour6Data,
								hour7Data,
								hour8Data,
							][i][0]?.hours?.freeze
						}
					>
						Freeze Hour {i + 1}
					</Button>
				))}
			</div>
		),
		[
			hour1Data,
			hour2Data,
			hour3Data,
			hour4Data,
			hour5Data,
			hour6Data,
			hour7Data,
			hour8Data,
			handleFreezeClick,
		]
	);

	return (
		<>
			{loading ? (
				<Spin />
			) : (
				<>
					<Table
						className="m-0"
						columns={columns}
						dataSource={hour1Data}
						style={{ overflowX: "auto" }}
						pagination={false}
					/>

					{hourFreezeButtons}
				</>
			)}
		</>
	);
};

export default React.memo(AttendanceTable);
