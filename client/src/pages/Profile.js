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
	Modal,
	Collapse
} from "antd";
import { useNavigate } from "react-router-dom";
import { url } from "../Backendurl";

const { Title, Text } = Typography;

const Logo = ({ username }) => {
	if (!username) return null;
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

const Profile = ({ setAuth }) => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState(false);
	const [pendingHours, setPendingHours] = useState({});
	const [pendingDetails, setPendingDetails] = useState({});
	const [cc, setCC] = useState("");
	const navigate = useNavigate();
	const backgroundColor_custom = `#${Math.floor(
		Math.random() * 16777215
	).toString(16)}`;
	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		try {
			const response = await fetch(`${url}/students/profile`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (response.status === 403) {
				message.error("Invalid token. Redirecting to login...");
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				setAuth(false);
				navigate("/auth");
				return;
			}

			const data = await response.json();
			setProfile(data);
			await fetchPendingHours(data.user);
			setLoading(false);
			document.title = data?.fac?.username || "ATTENDANCE SYSTEM | PROFILE";
		} catch (error) {
			console.error("Error fetching profile data:", error);
			message.error("Failed to fetch profile data.");
			setLoading(false);
			document.title = "ATTENDANCE SYSTEM | PROFILE";
		}
	};

	const fetchPendingHours = async (courses) => {
        const coursePendingHours = {};
		const coursependingDetails = {};
        for (let course of courses) {
            try {
                const response = await fetch(`${url}/attendance/pending-hours`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ courses: [course.coursecode] }), 
                });

                if (response.ok) {
                    const data = await response.json();
                    coursePendingHours[course.coursecode] = data[0].unmarkedHours; 
					coursependingDetails[course.coursecode] = data[0].pendingHours;
                } else {
                    message.error(`Failed to fetch pending hours for ${course.coursecode}`);
                }
            } catch (error) {
                console.error("Error fetching pending hours:", error);
            }
        }

        setPendingHours(coursePendingHours);
		setPendingDetails(coursependingDetails);
		console.log('pending details:', coursependingDetails);
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

			if (response.status === 401) {
				message.error("Invalid token. Redirecting to login...");
				navigate("/auth");
				return;
			}

			if (response.ok) {
				message.success("Representative removed successfully!");
				setProfile((prevProfile) => {
					const updatedReps = prevProfile.reps.map((repsList, index) =>
						index === coursecode
							? repsList.filter((r) => r._id !== rep._id)
							: repsList
					);
					return { ...prevProfile, reps: updatedReps };
				});
			} else {
				message.error(result.message || "Failed to remove representative");
			}
		} catch (error) {
			console.error("Error removing representative:", error);
			message.error("Failed to remove representative");
		}
	};

	const handleRemoveCourse = async () => {
		if (cc === "") {
			message.error("Course code cannot be empty");
			return;
		}
		try {
			const res = await fetch(`${url}/students/delete-course`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ coursecode: cc }),
			});

			if (res.status === 401) {
				message.error("Invalid token. Redirecting to login...");
				navigate("/auth");
				return;
			}

			if (res.status === 200) {
				message.success(`${cc} course is successfully deleted`);
				fetchProfile();
				setModal(false);
			} else {
				message.error("Failed to delete the course");
			}
		} catch (err) {
			console.log(err);
			message.error("Failed to delete the course");
		}
	};

	if (loading) {
		return <Spin size="large" className="block mx-auto mt-20" />;
	}

	const { fac = {}, user = [], hrs = [], reps = [] } = profile || {};

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
								onClick={() => {
									setModal(true);
									setCC(course.coursecode);
								}}
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
                            <Text strong>Pending Hours to mark the attendance:</Text>{" "}
                            <Text>{pendingHours[course.coursecode]  || pendingHours[course.coursecode] === 0 ? 0 : 'Loading...'}</Text> 
                        </List.Item>
						{pendingHours[course.coursecode] > 0 && <Collapse className="mb-4">
							<Collapse.Panel header="Pending Hours Details" key="1">
								
								{pendingDetails[course.coursecode].length > 0 &&  pendingDetails[course.coursecode].map((hr, index) => (
									<p>{`${hr.date} : ${hr.hour} hour`}</p>
							))}
						
							</Collapse.Panel>
						</Collapse>}
						<List.Item>
							<Text strong>Representative(s):</Text>{" "}
							{reps[index]?.map((rep) => (
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
			<Modal
				title="⚠️ Confirm Course Deletion"
				open={modal}
				onOk={handleRemoveCourse}
				onCancel={() => setModal(false)}
				okText="Yes, Delete"
				cancelText="Cancel"
				centered
				okButtonProps={{ danger: true }}
			>
				<div style={{ padding: "10px" }}>
					<p>
						This action is irreversible and will remove all records associated
						with this course.
					</p>
					<p style={{ color: "red", fontWeight: "bold" }}>
						Please proceed with caution!
					</p>
				</div>
			</Modal>
		</div>
	);
};

export default Profile;
