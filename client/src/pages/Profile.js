import React, { useEffect, useState } from "react";
import {
	Card,
	Row,
	Col,
	List,
	Typography,
	Spin,
	Divider,
	Button,
	message,
} from "antd";
import { url } from "../Backendurl";

const { Title, Text } = Typography;

const Logo = ({ username }) => {
	const initial = username.charAt(0).toUpperCase();
	const backgroundColor_custom = `#${Math.floor(
		Math.random() * 16777215
	).toString(16)}`;

	return (
		<div
			className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-5"
			style={{ backgroundColor: backgroundColor_custom }}
		>
			{initial}
		</div>
	);
};

const Profile = () => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const backgroundColor_custom = `#${Math.floor(
		Math.random() * 16777215
	).toString(16)}`;

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		fetch(`${url}/students/profile`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		})
			.then((response) => response.json())
			.then((data) => {
				setProfile(data);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching profile data:", error);
				setLoading(false);
			});
	};

	const handleRemoveRep = async (rep, coursecode) => {
		try {
			const response = await fetch(`${url}/admin/remove-rep`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					_id: rep._id,
					username: rep.username,
					coursecode: coursecode,
				}),
			});

			const result = await response.json();

			if (response.ok) {
				message.success("Representative removed successfully!");
				// Refresh profile data after removal
				setProfile((prevProfile) => {
					return {
						...prevProfile,
						reps: prevProfile.reps.map((repsList) =>
							repsList.filter((r) => r._id !== rep._id)
						),
					};
				});
			} else {
				message.error(result.message || "Failed to remove representative");
			}
		} catch (error) {
			console.error("Error removing representative:", error);
			message.error("Failed to remove representative");
		}
	};

	if (loading) {
		return <Spin size="large" className="block mx-auto mt-20" />;
	}

	const { fac, user, hrs, reps } = profile;

	const handleRemoveCourse = async (cc) => {
		try {
			const res = await fetch(`${url}/students/delete-course`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ coursecode: cc }),
			});
			if (res.status === 200) {
				message.success(`${cc} course is successfully deleted`);
				fetchProfile();
			}
		} catch (err) {
			console.log(err);
			message.error("Failed to delete the course");
		}
	};

	return (
		<div>
			<Title level={2} className="text-center text-blue-500">
				Faculty Profile
			</Title>

			<Row gutter={[16, 16]} className="mb-8">
				<Col span={24} className="text-left">
					<div className="flex flex-row justify-center items-center">
						<Logo username={fac.username} />
					</div>
					<h3
						className="mb-5 font-semibold md:text-xl text-lg"
						style={{ color: backgroundColor_custom }}
					>
						Faculty Details
					</h3>
					<Card bordered={false} className="bg-white shadow-md">
						<List size="medium">
							<List.Item>
								<Text strong>Username:</Text>{" "}
								<Text className="font-semibold ">{fac.username}</Text>
							</List.Item>
							<List.Item>
								<Text strong>Role:</Text> <Text>{fac.role}</Text>
							</List.Item>
							<List.Item>
								<Text strong>Faculty ID:</Text> <Text>{fac._id}</Text>
							</List.Item>
						</List>
					</Card>
				</Col>
			</Row>

			<Divider />

			<h3
				className="mb-5 font-semibold md:text-xl text-lg"
				style={{ color: backgroundColor_custom }}
			>
				Courses and Students
			</h3>
			{user.map((course, index) => (
				<Card
					key={course._id}
					title={
						<div className="flex justify-between items-center">
							<span>
								Course: {course.coursename} ({course.coursecode})
							</span>
							<Button
								type="primary"
								danger
								onClick={() => handleRemoveCourse(course.coursecode)}
							>
								Remove Course
							</Button>
						</div>
					}
					bordered={false}
					className="mb-5 bg-white shadow-md"
				>
					<List size="medium">
						<List.Item>
							<Text strong>Class:</Text> <Text>{course.class}</Text>
						</List.Item>
						<List.Item>
							<Text strong>Year:</Text> <Text>{course.dept}</Text>
						</List.Item>
						<List.Item>
							<Text strong>Representative(s):</Text>{" "}
							{reps[index].map((rep) => (
								<Card
									key={rep._id}
									title={`Representative: ${rep.username}`}
									bordered={false}
									className="mb-5 bg-white shadow-md"
								>
									<List size="small">
										<List.Item>
											<Text strong>Username:</Text> <Text>{rep.username}</Text>
										</List.Item>
										<List.Item>
											<Text strong>Role:</Text> <Text>{rep.role}</Text>
										</List.Item>
										<List.Item>
											<Text strong>Representative password:</Text>{" "}
											<Text>{rep.password}</Text>
										</List.Item>
										<List.Item>
											<Button
												type="primary"
												danger
												onClick={() => handleRemoveRep(rep, course.coursecode)}
											>
												Remove Representative
											</Button>
										</List.Item>
									</List>
								</Card>
							))}
						</List.Item>
						<List.Item>
							<Text strong>Total Hours Taken:</Text> <Text>{hrs[index]}</Text>
						</List.Item>
						<List.Item>
							<Text strong>Number of Students Enrolled:</Text>{" "}
							<Text>{course.students.length}</Text>
						</List.Item>
					</List>
				</Card>
			))}
		</div>
	);
};

export default Profile;
