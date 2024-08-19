import React, { useEffect, useState } from "react";
import { Card, Row, Col, List, Typography, Spin, Divider } from "antd";
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
	}, []);

	if (loading) {
		return <Spin size="large" className="block mx-auto mt-20" />;
	}

	const { fac, user, hrs, stdCount, reps } = profile;

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
						<List>
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
					title={`Course: ${course.coursename} (${course.coursecode})`}
					bordered={false}
					className="mb-5 bg-white shadow-md"
				>
					<List size="small">
						<List.Item>
							<Text strong>Class:</Text> <Text>{course.class}</Text>
						</List.Item>
						<List.Item>
							<Text strong>Year:</Text> <Text>{course.dept}</Text>
						</List.Item>
						<List.Item>
							<Text strong>Representative:</Text>{" "}
							{reps[0].map((rep) => (
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
									</List>
								</Card>
							))}
						</List.Item>
						<List.Item>
							<Text strong>Total Hours:</Text>{" "}
							<Text>{course.students.length}</Text>
						</List.Item>
						<List.Item>
							<Text strong>Number of Students:</Text> <Text>{hrs[index]}</Text>
						</List.Item>
					</List>
				</Card>
			))}
		</div>
	);
};

export default Profile;
