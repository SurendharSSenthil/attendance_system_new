import React, { useState, useEffect } from "react";
import { Table, Button, Spin, Select } from "antd";
import { url } from "../Backendurl";

const { Option } = Select;

const AttendanceTable = ({
	currDate,
	data,
	setData,
	setCount,
	setLoading,
	loading,
	hr,
	course,
	yr,
	Class,
}) => {
	const [localData, setLocalData] = useState(data);
	const [error, setError] = useState(null);

	const fetchAttendance = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${url}/attendance/get-attendance`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					date: currDate,
					coursecode: course,
					coursename: course,
					hr,
				}),
			});
			const result = await response.json();
			console.log(result.reports);
			if (response.ok) {
				setLocalData(result.reports);
				setCount(result.count);
			} else {
				setError(result.message || "Failed to fetch data.");
			}
		} catch (err) {
			setError("An error occurred while fetching attendance data.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setLoading(true);
		try {
			// Set freeze flag to true for all records before saving
			const updatedData = localData.map((record) => ({
				...record,
				freeze: true,
			}));

			const response = await fetch(`${url}/attendance/update`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					date: currDate,
					coursecode: course,
					coursename: course,
					hr,
					attendance: updatedData, // Use updatedData with freeze set to true
				}),
			});
			const result = await response.json();
			if (!response.ok) {
				setError(result.message || "Failed to update attendance.");
			} else {
				console.log("Attendance updated successfully");
				fetchAttendance();
			}
		} catch (err) {
			setError("An error occurred while updating attendance.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = (value, RegNo) => {
		const newData = localData.map((record) =>
			record.RegNo === RegNo ? { ...record, status: value } : record
		);
		setLocalData(newData);
	};

	useEffect(() => {
		if (course && currDate) {
			fetchAttendance();
		}
	}, [course, currDate, hr]);

	const columns = [
		{
			title: "Reg No",
			dataIndex: "RegNo",
			key: "RegNo",
		},
		{
			title: "Name",
			dataIndex: "Name",
			key: "Name",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (text, record) => {
				if (record.freeze) {
					return (
						<span
							className={
								record.status === 1
									? "text-black"
									: record.status === -1
									? "text-red-500 font-semibold"
									: "text-yellow-500 font-semibold"
							}
						>
							{record.status === 1
								? "Present"
								: record.status === -1
								? "Absent"
								: "On Duty"}
						</span>
					);
				} else {
					return (
						<Select
							value={record.status}
							onChange={(value) => handleStatusChange(value, record.RegNo)}
							className={
								record.status === -1
									? "border-red-500"
									: record.status === 2
									? "border-yellow-500"
									: ""
							}
						>
							<Option value={1}>Present</Option>
							<Option value={-1}>Absent</Option>
							<Option value={2}>On Duty</Option>
						</Select>
					);
				}
			},
		},
	];

	return (
		<div>
			{loading ? (
				<Spin tip="Loading..." />
			) : (
				<>
					<Table
						dataSource={localData}
						columns={columns}
						rowKey="RegNo"
						bordered
						pagination={false}
					/>
					<Button type="primary" onClick={handleSave} style={{ marginTop: 16 }}>
						Save Attendance
					</Button>
				</>
			)}
		</div>
	);
};

export default AttendanceTable;
