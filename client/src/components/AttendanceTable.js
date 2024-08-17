import React, { useState, useEffect } from "react";
import { Table, Button, Spin, Select } from "antd";
import { url } from "../Backendurl";

const { Option } = Select;

const AttendanceTable = ({
	currDate,
	data,
	setData,
	setLoading,
	loading,
	hr,
	course,
	yr,
	Class,
	fetchAttendance,
	exp,
	freeze,
	setFreeze,
}) => {
	const [localData, setLocalData] = useState(data);
	const [error, setError] = useState(null);

	useEffect(() => {
		setLocalData(data);
		console.log("Local Data Set:", data); // Debugging Log
	}, [data]);

	const handleSave = async () => {
		setLoading(true);
		try {
			const updatedData = localData.map((record) => ({
				...record,
				// freeze: true,
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
					freeze: true,
					attendance: updatedData,
				}),
			});
			const result = await response.json();

			if (response.ok) {
				setData(updatedData);
				fetchAttendance();
				setError(null);
			} else {
				setError(result.message || "Failed to update attendance data.");
			}
		} catch (err) {
			setError("An error occurred while saving attendance data.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleAttendanceChange = (value, RegNo) => {
		setLocalData((prevData) =>
			prevData.map((record) =>
				record.RegNo === RegNo ? { ...record, status: value } : record
			)
		);
	};

	const columns = [
		{
			title: "Roll Number",
			dataIndex: "RegNo",
			key: "RegNo",
			fixed: "left",
		},
		{
			title: "Student Name",
			dataIndex: "Name",
			key: "Name",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (text, record) => {
				if (freeze) {
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
							onChange={(value) => handleAttendanceChange(value, record.RegNo)}
							status={
								record.status === -1
									? "error"
									: record.status === 2
									? "warning"
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
				<Spin />
			) : (
				<>
					{error && <p style={{ color: "red" }}>{error}</p>}
					<Table
						columns={columns}
						dataSource={localData}
						rowKey={(record) => record._id}
						pagination={false}
						className="overflow-x-scroll"
					/>
					{localData.length > 0 && !exp && !freeze && (
						<Button
							type="button"
							onClick={handleSave}
							className="relative py-0 px-4 h-10 mt-4 lg:mt-0 rounded-lg transition-all  w-[200px] duration-300 bg-blue-500 text-white border-2 border-blue-500 hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/50  outline-none flex flex-row justify-center items-center font-semibold"
							disabled={loading}
						>
							Save Attendance
						</Button>
					)}
					{localData.length > 0 && !exp && freeze && (
						<button
							type="button"
							onClick={() => setFreeze(false)}
							className="relative py-0 px-4 h-10 mt-4 lg:mt-0 rounded-lg transition-all  w-[200px] duration-300 bg-blue-500 text-white border-2 border-blue-500 hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/50  outline-none flex flex-row justify-center items-center font-semibold"
							disabled={loading}
						>
							UnFreeze
						</button>
					)}
				</>
			)}
		</div>
	);
};

export default AttendanceTable;
