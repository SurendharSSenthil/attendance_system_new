import { useEffect, useState } from 'react';
import {
	Table,
	Alert,
	Button,
	message,
	Row,
	Col,
	Card,
	Select,
	Modal,
	Form,
	Input,
} from 'antd';
import { DeleteTwoTone, EditOutlined } from '@ant-design/icons';
import { url } from '../Backendurl';

const EditData = ({ setAuth, user }) => {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [coursecode, setCoursecode] = useState('');
	const [modal, showModal] = useState(false);
	const [modal2, showModal2] = useState(false);
	const [addcourse, setAddCourse] = useState('');
	const [count, setCount] = useState(0);
	const [form] = Form.useForm();
	const [form2] = Form.useForm();
	const [del, setDel] = useState('');
	const [modal3, setModal3] = useState(false);
	const [editingKey, setEditingKey] = useState('');
	const [editableData, setEditableData] = useState({});

	// Fetch courses when the component mounts
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
			} catch (err) {
				message.error('Failed to fetch courses. Please try again.');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		document.title = 'ATTENDANCE SYSTEM | EDIT';
		fetchCourses();
	}, []);

	const addAdmin = () => {
		showModal2(true);
	};

	const onFinishAdmin = async (values) => {
		try {
			const response = await fetch(`${url}/admin/add-rep`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({ ...values, coursecode: addcourse }),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			const result = await response.json();
			message.success(result.message);
			showModal2(false);
			form2.resetFields();
			// fetchStudents();
		} catch (err) {
			console.error('Error adding Admin:', err);
			message.error('Failed to add admin. Please check the details.');
		}
	};

	// Delete student
	const deleteStudent = async () => {
		try {
			const response = await fetch(`${url}/students/delete-student`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({ coursecode, RegNo: del }),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			message.success('Student deleted successfully.');
			setDel('');
			setModal3(false);
			fetchStudents();
		} catch (error) {
			console.error('Error deleting student:', error);
			message.error('Failed to delete student. Please try again.');
		}
	};

	// Fetch students for the selected course
	const fetchStudents = async () => {
		if (coursecode === '') {
			message.error('Please select a course!');
			return;
		}
		try {
			const response = await fetch(`${url}/students/${coursecode}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			const studentsData = await response.json();
			setData(studentsData);
			setCount(studentsData.length);
		} catch (error) {
			console.error('Error fetching students:', error);
			message.error('Failed to fetch student data. Please try again.');
		}
	};

	const handleDoubleClick = (record) => {
		setEditingKey(record.RegNo);
		setEditableData({ ...record });
	};

	const handleInputChange = (key, value) => {
		setEditableData({ ...editableData, [key]: value });
	};

	const saveChanges = async () => {
		try {
			const { RegNo, StdName } = editableData;
			const response = await fetch(`${url}/students/edit-student`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					oldname: data.find((d) => d.RegNo === editingKey).StdName,
					oldreg: editingKey,
					newname: StdName,
					newreg: RegNo,
					coursecode,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to update student data');
			}

			message.success('Student data updated successfully');
			setEditingKey('');
			fetchStudents();
		} catch (err) {
			message.error('Error updating student data');
			console.error('Update error', err);
		}
	};

	// Cancel editing without saving
	const cancelEdit = () => {
		setEditingKey('');
		setEditableData({});
	};

	const columns = [
		{
			title: 'Registration Number',
			dataIndex: 'RegNo',
			key: 'RegNo',
			render: (text, record) =>
				editingKey === record.RegNo ? (
					<Input
						value={editableData.RegNo}
						onChange={(e) => handleInputChange('RegNo', e.target.value)}
						onPressEnter={saveChanges}
						onBlur={saveChanges}
					/>
				) : (
					<span onDoubleClick={() => handleDoubleClick(record)}>{text}</span>
				),
		},
		{
			title: 'Name',
			dataIndex: 'StdName',
			key: 'StdName',
			render: (text, record) =>
				editingKey === record.RegNo ? (
					<Input
						value={editableData.StdName}
						onChange={(e) => handleInputChange('StdName', e.target.value)}
						onPressEnter={saveChanges}
						onBlur={saveChanges}
					/>
				) : (
					<span onDoubleClick={() => handleDoubleClick(record)}>{text}</span>
				),
		},
		{
			title: 'Remove Student',
			key: 'action',
			render: (text, record) => (
				<Button
					type='danger'
					onClick={() => {
						setModal3(true);
						setDel(record.RegNo);
					}}
				>
					<DeleteTwoTone />
				</Button>
			),
		},
	];

	return (
		<div className='md:m-2 flex flex-col gap-2 md:block'>
			<h2 className='block text-lg text-gray-700 font-semibold mb-4'>
				<EditOutlined />
				Edit Students Details
			</h2>
			<Row gutter={[16, 16]}>
				{courses.length > 0 && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<p className='text-gray-500 mb-2'>
								<span className='text-red-500'>* </span>Select the Course
							</p>
							<Select
								onChange={(v) => setCoursecode(v)}
								value={coursecode}
								options={courses.map((course) => ({
									label: `${course.coursename} - ${course.coursecode}`,
									value: course.coursecode,
								}))}
								className='w-full'
							/>
						</Card>
					</Col>
				)}
			</Row>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8} className='md:mt-4'>
					<Button type='primary' onClick={fetchStudents} className='w-full'>
						Get Data
					</Button>
				</Col>
			</Row>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8} className='md:mt-4'>
					<Button
						type='primary'
						onClick={() => showModal(true)}
						className='w-full'
					>
						Add Student
					</Button>
				</Col>
			</Row>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8} className='md:mt-4'>
					<Button type='primary' onClick={addAdmin} className='w-full'>
						Add Admin
					</Button>
				</Col>
			</Row>
			{data.length > 0 && (
				<Alert
					message={"Double Click on the name/reg no to edit student's data"}
					type='info'
					className='mt-4'
				/>
			)}
			<Row gutter={[16, 16]} className='mt-4'>
				<Col span={24}>
					{data.length > 0 && (
						<Table
							columns={columns}
							dataSource={data}
							rowKey='RegNo'
							pagination={false}
							loading={loading}
							className='bg-white overflow-x-auto'
						/>
					)}
				</Col>
			</Row>
			<Modal
				title='Add Representative'
				open={modal2}
				onCancel={() => showModal2(false)}
				footer={null}
			>
				<Form
					form={form2}
					name='add_admin'
					onFinish={onFinishAdmin}
					autoComplete='off'
				>
					<Form.Item
						label='User Name'
						name='username'
						rules={[
							{
								required: true,
								message: 'Please input the username!',
							},
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label='Password'
						name='password'
						rules={[
							{
								required: true,
								message: 'Please input the password!',
							},
						]}
					>
						<Input.Password />
					</Form.Item>
					<Form.Item
						label='Course'
						name='coursecode'
						rules={[
							{
								required: true,
								message: 'Please select the course!',
							},
						]}
					>
						<Select
							onChange={(v) => setAddCourse(v)}
							value={addcourse}
							options={courses.map((course) => ({
								label: `${course.coursename} - ${course.coursecode}`,
								value: course.coursecode,
							}))}
							className='w-full'
						/>
					</Form.Item>

					<Form.Item>
						<Button type='primary' htmlType='submit' className='w-full'>
							Add Representative
						</Button>
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				title='⚠️ Confirm Student Deletion'
				open={modal3}
				onOk={deleteStudent}
				onCancel={() => setModal3(false)}
				okText='Yes, Delete'
				cancelText='Cancel'
				centered
				okButtonProps={{ danger: true }}
			>
				<div style={{ padding: '10px' }}>
					<p>
						This action is irreversible and will remove all records associated
						with this student.
					</p>
					<p style={{ color: 'red', fontWeight: 'bold' }}>
						Please proceed with caution!
					</p>
				</div>
			</Modal>
		</div>
	);
};

export default EditData;
