import React, { useState, useEffect } from 'react';
import {
	Row,
	Col,
	Card,
	Select,
	DatePicker,
	Table,
	Input,
	Spin,
	Button,
	InputNumber,
	message,
	Alert,
} from 'antd';

import moment from 'moment';
import { url } from '../Backendurl';
import { saveAs } from 'file-saver';

const Students = () => {
	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [startDate, setStartDate] = useState(moment().startOf('day'));
	const [endDate, setEndDate] = useState(moment().endOf('day'));
	const [searchText, setSearchText] = useState('');
	const [yrs, setYrs] = useState([]);
	const [Classes, setClasses] = useState([]);
	const [courses, setCourses] = useState([]);
	const [yr, setYr] = useState();
	const [Class, setClass] = useState('');
	const [course, setCourse] = useState('');
	const [startRange, setStartRange] = useState();
	const [endRange, setEndRange] = useState();

	const { RangePicker } = DatePicker;
	const fetchStudentData = async () => {
		if (!course || !yr || !Class || !startDate || !endDate) {
			message.error('Please input all the fields!');
			setData([]);
			return;
		}

		setLoading(true);
		setData([]);
		try {
			const response = await fetch(`${url}/attendance/student-dashboard`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					startDate: startDate.format('YYYY-MM-DD'),
					endDate: endDate.format('YYYY-MM-DD'),
					coursecode: course,
					yr,
					Class,
					startRange,
					endRange,
				}),
			});
			if (!response.ok) {
				throw new Error(
					response.message ||
						'No Students Found! Check for the correctness of the input fields!'
				);
			}
			const studentData = await response.json();
			setData(studentData);
			console.log(studentData);
			setFilteredData(studentData);
			setError(null);
		} catch (err) {
			message.error(err.message);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const fetchCourses = async () => {
		setLoading(true);
		try {
			const coursesResponse = await fetch(`${url}/students/faculty-data`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			const coursesData = await coursesResponse.json();
			setCourses(Array.isArray(coursesData.course) ? coursesData.course : []);
			setYrs(Array.isArray(coursesData.yr) ? coursesData.yr : []);
			setClasses(Array.isArray(coursesData.dept) ? coursesData.dept : []);
		} catch (err) {
			message.error('Failed to fetch courses. Please try again.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchCourses();
	}, []);

	useEffect(() => {
		document.title = 'ATTENDANCE SYSTEM | STATISTICS';
	});

	useEffect(() => {
		const filtered = data.filter(
			(student) =>
				student.name.toLowerCase().includes(searchText.toLowerCase()) ||
				student.RegNo.toLowerCase().includes(searchText.toLowerCase())
		);
		setFilteredData(filtered);
	}, [searchText, data]);

	const handleDateChange = (dates) => {
		if (dates && dates.length === 2) {
			setStartDate(dates[0]);
			setEndDate(dates[1]);
		} else {
			setStartDate(moment().startOf('day'));
			setEndDate(moment().endOf('day'));
		}
		console.log(dates);
	};

	const exportToCSV = () => {
		const header = [
			'Registration Number',
			'Student Name',
			...data[0].courses[0].statuses.map((status, index) => {
				const dayOfWeek = moment(status.date).format('dddd');
				return `${dayOfWeek} ${moment(status.date).format('YYYY-MM-DD')} Hour ${
					status.hour
				}`;
			}),
			'Total Hours',
			'Present Hours',
			'Percentage',
		];

		const rows = data.map((student) => [
			student.RegNo,
			student.name,
			...student.courses[0].statuses.map((status, index) => {
				const statusValue = student.courses[0].statuses[index].status;
				if (statusValue === 1) {
					return 'P';
				} else if (statusValue === 2) {
					return 'OD';
				} else {
					return 'AB';
				}
			}),
			...student.courses.map((course) => course.totalHours),
			...student.courses.map((course) => course.present),
			...student.courses.map((course) =>
				Math.round((course.present * 100) / course.totalHours)
			),
		]);

		const csvContent = [header, ...rows].map((e) => e.join(',')).join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		saveAs(blob, 'students_attendance.csv');
	};

	const columns = [
		{
			title: 'Registration Number',
			dataIndex: 'RegNo',
			key: 'RegNo',
			fixed: 'left',
		},
		{
			title: 'Student Name',
			dataIndex: 'name',
			key: 'name',
		},
	];

	if (data.length > 0 && data[0]?.courses[0]?.statuses?.length > 0) {
		data[0].courses[0].statuses.forEach((status, index) => {
			const dayOfWeek = moment(status.date).format('dddd');

			columns.push({
				title: (
					<p className={status.valid ? '' : 'text-red-600'}>
						{`${dayOfWeek} ${moment(status.date).format('YYYY-MM-DD')} Hour ${
							status.hour
						}`}
						<span>{!status.valid ? '(extra hour)' : ''}</span>
					</p>
				),
				key: `hour_${index + 1}`,
				render: (_, record) => {
					const courseData = record.courses[0];
					if (courseData) {
						const statusValue = courseData?.statuses[index]?.status;
						if (statusValue === 1) {
							return 'P'; // Present
						} else if (statusValue === 2) {
							return <span className='text-yellow-500 font-semibold'>OD</span>; // On Duty
						} else {
							return <span className='text-red-500 font-semibold'>AB</span>; // Absent
						}
					} else {
						return '-'; // Default return if no course data
					}
				},
			});
		});
	}

	if (data.length > 0 && data[0].courses) {
		data[0].courses.forEach((course) => {
			columns.push({
				title: 'Total Hours',
				dataIndex: course.totalHours,
				key: `total_${course.course}`,
				render: (_, record) => {
					const courseData = record.courses.find(
						(c) => c.course === course.course
					);
					return <span>{courseData ? courseData.totalHours : 0}</span>;
				},
			});
		});

		data[0].courses.forEach((course) => {
			columns.push({
				title: 'Present Hours',
				dataIndex: course.present,
				key: `present_${course.course}`,
				render: (_, record) => {
					const courseData = record.courses.find(
						(c) => c.course === course.course
					);
					return <span>{courseData ? courseData.present : 0}</span>;
				},
			});
		});

		data[0].courses.forEach((course) => {
			columns.push({
				title: 'Percentage',
				dataIndex: course.course,
				key: `percentage_${course.course}`,
				render: (_, record) => {
					const courseData = record.courses.find(
						(c) => c.course === course.course
					);
					return (
						<span
							className={
								(courseData.present * 100) / courseData.totalHours < 75
									? 'text-red-700'
									: ''
							}
						>
							{courseData
								? Math.round((courseData.present * 100) / courseData.totalHours)
								: 0}
						</span>
					);
				},
			});
		});

		data[0].courses.forEach((course) => {
			columns.push({
				title: 'Total Hours as per timetable',
				dataIndex: course.validHours,
				key: `present_${course.validHours}`,
				render: (_, record) => {
					const courseData = record.courses.find(
						(c) => c.course === course.course
					);
					return <span>{courseData ? courseData.validHours : 0}</span>;
				},
			});
		});

		data[0].courses.forEach((course) => {
			columns.push({
				title: 'Total Present Hours as per timetable',
				dataIndex: course.validPresent,
				key: `present_${course.validPresent}`,
				render: (_, record) => {
					const courseData = record.courses.find(
						(c) => c.course === course.course
					);
					return <span>{courseData ? courseData.validPresent : 0}</span>;
				},
			});
		});
	}

	return (
		<div className='overflow-x-hidden'>
			<p className='block text-lg text-gray-700 font-semibold'>
				<span className='text-red-500 font-bold'>*</span>Select the date range
				to get the summary of the students attendance report
			</p>
			<br />
			<Alert
				type='info'
				message='Please select the student count range for laboratory'
			/>
			<br />
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8}>
					<Card>
						<p className='text-gray-500 mb-2'>
							<span className='text-red-500'>* </span>Select the Date Range
						</p>
						<RangePicker onChange={(e) => handleDateChange(e)} />
					</Card>
				</Col>
				{courses.length > 0 && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<p className='text-gray-500 mb-2'>
								<span className='text-red-500'>* </span>Select the Course
							</p>
							<Select
								onChange={(e) => setCourse(e)}
								value={course}
								options={courses.map((course) => ({
									label: `${course.coursename} - ${course.coursecode}`,
									value: course.coursecode,
								}))}
								className='w-full'
							/>
						</Card>
					</Col>
				)}
				<Col xs={24} sm={12} md={8}>
					<Card>
						<p className='text-gray-500 mb-2'>
							<span className='text-red-500'>* </span>Select the Year
						</p>
						<Select
							onChange={(e) => setYr(e)}
							value={yr}
							options={[...new Set(yrs)].map((year) => ({
								label: year,
								value: year,
							}))}
							className='w-full'
						/>
					</Card>
				</Col>

				<Col xs={24} sm={12} md={8}>
					<Card>
						<p className='text-gray-500 mb-2'>
							<span className='text-red-500'>* </span>Select the Class
						</p>
						<Select
							onChange={(e) => setClass(e)}
							value={Class}
							options={[...new Set(Classes)].map((c) => ({
								label: c,
								value: c,
							}))}
							className='w-full'
						/>
					</Card>
				</Col>

				{/* New Range Selection for Students */}
				<Col xs={24} sm={12} md={8}>
					<Card>
						<p className='text-gray-500 mb-2'>Select Roll Number Range</p>
						<div className='flex gap-4'>
							<InputNumber
								min={1}
								max={1000}
								placeholder='Start'
								onChange={(value) => setStartRange(value)}
								className='w-1/2'
							/>
							<InputNumber
								min={1}
								max={1000}
								placeholder='End'
								onChange={(value) => setEndRange(value)}
								className='w-1/2'
							/>
						</div>
					</Card>
				</Col>
			</Row>

			<Row gutter={[16, 16]} className='mt-4'>
				<Col xs={24} sm={12} md={8}>
					<button
						type='button'
						onClick={fetchStudentData}
						className='relative py-0 px-4 h-10 mt-4 lg:mt-0 rounded-lg transition-all duration-300 bg-blue-500 text-white border-2 border-blue-500 hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/50  outline-none flex flex-row justify-center items-center font-semibold w-full'
					>
						Generate Report
					</button>
				</Col>
			</Row>

			<Input.Search
				placeholder='Search by name or register number'
				onChange={(e) => setSearchText(e.target.value)}
				className='rounded-3xl text-gray-600 mt-4 mb-4'
				size='large'
			/>

			{loading ? (
				<Spin tip='Loading...' />
			) : filteredData.length > 0 ? (
				<div className='flex flex-col gap-4'>
					<Table
						dataSource={filteredData}
						columns={columns}
						pagination={false}
						className='overflow-auto bg-white'
					/>
					<Button type='primary' className='w-32' onClick={exportToCSV}>
						Export to CSV
					</Button>
				</div>
			) : null}
		</div>
	);
};

export default Students;
