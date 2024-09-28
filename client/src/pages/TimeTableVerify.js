import React, { useEffect, useState } from 'react';
import {
	Table,
	Checkbox,
	Button,
	Form,
	Row,
	Col,
	notification,
	Spin,
	Card,
	Select,
	message,
	Modal,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { url } from '../Backendurl';

const { confirm } = Modal;

const TimeTableVerify = () => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [courses, setCourses] = useState([]);
	const [coursecode, setCoursecode] = useState('');
	const [yrs, setYrs] = useState([]);
	const [classes, setClasses] = useState([]);
	const [yr, setYr] = useState();
	const [dept, setDept] = useState('');
	const [coursename, setCoursename] = useState('');
	const [existingTimetable, setExistingTimetable] = useState(null);
	const [data, setData] = useState([]);
	const [isEditable, setIsEditable] = useState(false); // Editable state

	useEffect(() => {
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
		document.title = 'ATTENDANCE SYSTEM | TIMETABLE';
		fetchCourses();
	}, []);

	const fetchTimetable = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${url}/students/get-time-table`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ coursename, coursecode, yr, dept }),
			});
			const result = await response.json();
			if (response.ok) {
				setExistingTimetable(result.timetable);
				form.setFieldsValue(convertToFormValues(result.timetable));
				setIsEditable(false); // Disable editing on initial load
			} else {
				notification.error({
					message: 'Error',
					description: result.message || 'Failed to fetch timetable.',
				});
				// generateTimetable();
			}
		} catch (error) {
			notification.error({
				message: 'Error',
				description: 'An error occurred while fetching the timetable.',
			});
		} finally {
			setLoading(false);
		}
	};

	const convertToFormValues = (timetable) => {
		const values = {};
		Object.keys(timetable).forEach((day) => {
			timetable[day].forEach((hour) => {
				const dayIndex = [
					'monday',
					'tuesday',
					'wednesday',
					'thursday',
					'friday',
				].indexOf(day);
				if (dayIndex >= 0) {
					values[`hour${hour}_${dayIndex}`] = true;
				}
			});
		});
		return values;
	};

	const columns = [
		{
			title: 'Day',
			dataIndex: 'day',
			key: 'day',
			fixed: 'left',
		},
		...Array.from({ length: 8 }, (_, i) => ({
			title: `Hour ${i + 1}`,
			dataIndex: `hour${i + 1}`,
			key: `hour${i + 1}`,
			render: (text, record, index) => (
				<Form.Item
					name={`hour${i + 1}_${index}`}
					valuePropName='checked'
					noStyle
				>
					<Checkbox disabled={!isEditable} />
				</Form.Item>
			),
		})),
	];

	const tableData = [
		{ key: '1', day: 'Monday' },
		{ key: '2', day: 'Tuesday' },
		{ key: '3', day: 'Wednesday' },
		{ key: '4', day: 'Thursday' },
		{ key: '5', day: 'Friday' },
	];

	const generateTimetable = (values) => {
		const timetable = {};
		tableData.forEach((dayObj, index) => {
			const day = dayObj.day.toLowerCase();
			timetable[day] = [];
			for (let i = 1; i <= 8; i++) {
				if (values[`hour${i}_${index}`]) {
					timetable[day].push(i);
				}
			}
		});
		return timetable;
	};

	const onFinish = (values) => {
		confirm({
			title: 'Do you want to submit the timetable?',
			icon: <ExclamationCircleOutlined />,
			content: 'Please confirm if you want to submit the timetable!',
			onOk: async () => {
				if (!coursename || !coursecode || !dept || !yr) {
					notification.error({
						message: 'Fields Required',
						description: 'All fields are required.',
					});
					return;
				}

				const timetable = generateTimetable(values);
				const payload = {
					coursename,
					coursecode,
					timetable,
					yr,
					dept,
				};

				setLoading(true);
				try {
					const response = await fetch(`${url}/students/add-time-table`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(payload),
					});
					const result = await response.json();
					if (response.ok) {
						notification.success({
							message: 'Success',
							description: 'Timetable data submitted successfully.',
						});
						form.resetFields();
						setExistingTimetable(timetable);
						setIsEditable(false);
					} else {
						notification.error({
							message: 'Error Occurred',
							description: result.message || 'Failed to submit timetable data.',
						});
					}
				} catch (error) {
					notification.error({
						message: 'Error Occurred',
						description:
							'An error occurred while submitting the timetable data.',
					});
				} finally {
					setLoading(false);
					fetchTimetable();
				}
			},
		});
	};

	return (
		<div>
			<p className='block text-lg text-gray-700 font-semibold'>
				<span className='text-red-500 font-bold'>*</span> Mark the timetable for
				verification
			</p>
			<br />
			<Row gutter={[16, 16]}>
				{courses.length > 0 && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<p className='text-gray-500 mb-2'>
								<span className='text-red-500'>*</span> Select the Course
							</p>
							<Select
								onChange={(v) => {
									const course = courses.find((c) => c.coursecode === v);
									setCoursecode(v);
									setCoursename(course ? course.coursename : '');
								}}
								value={coursecode}
								options={[...new Set(courses)].map((course) => ({
									label: `${course.coursename} - ${course.coursecode}`,
									value: course.coursecode,
								}))}
								className='w-full'
							/>
						</Card>
					</Col>
				)}
				{yrs.length > 0 && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<p className='text-gray-500 mb-2'>
								<span className='text-red-500'>*</span> Select the Year
							</p>
							<Select
								onChange={(v) => setYr(v)}
								value={yr}
								options={[...new Set(yrs)].map((year) => ({
									label: year,
									value: year,
								}))}
								className='w-full'
							/>
						</Card>
					</Col>
				)}
				{classes.length > 0 && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<p className='text-gray-500 mb-2'>
								<span className='text-red-500'>*</span> Select the Class
							</p>
							<Select
								onChange={(v) => setDept(v)}
								value={dept}
								options={[...new Set(classes)].map((cls) => ({
									label: `${cls}`,
									value: cls,
								}))}
								className='w-full'
							/>
						</Card>
					</Col>
				)}
			</Row>
			<Row gutter={[16, 16]} className='mt-4 mb-4'>
				<Col xs={24} sm={12} md={8}>
					<Button type='primary' onClick={fetchTimetable} className='w-full'>
						Get Timetable
					</Button>
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8}>
					<Button
						type='default'
						onClick={() => setIsEditable(true)}
						className='w-full mb-4'
					>
						Edit Timetable
					</Button>
				</Col>
			</Row>

			{loading ? (
				<Spin />
			) : coursename && coursecode && yr && dept ? (
				<div>
					<Form form={form} onFinish={onFinish}>
						<Table
							columns={columns}
							dataSource={tableData}
							pagination={false}
							bordered
							scroll={{ x: true }}
							size='middle'
						/>
						<Row justify='center' style={{ marginTop: '20px' }}>
							<Col>
								<Button type='primary' htmlType='submit' disabled={!isEditable}>
									Submit
								</Button>
							</Col>
						</Row>
					</Form>
				</div>
			) : (
				<div></div>
			)}
		</div>
	);
};

export default TimeTableVerify;
