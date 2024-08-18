import React, { useEffect, useState } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import Auth from "./pages/Auth";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import HomeLayout from "./HomeLayout";
import RegisterFaculty from "./pages/RegisterFaculty";
import SignUp from "./pages/SignUp";
import EditData from "./pages/EditData";

const App = () => {
	const [auth, setAuth] = useState(false);
	const [user, setUser] = useState({});

	useEffect(() => {
		const token = localStorage.getItem("token");
		const userDataString = localStorage.getItem("user");

		if (token) {
			setAuth(true);
			if (userDataString) {
				try {
					const userData = JSON.parse(userDataString);
					setUser(userData);
				} catch (error) {
					console.error("Error parsing user data:", error);
					setUser({});
				}
			} else {
				setUser({});
			}
		} else {
			setAuth(false);
		}
	}, []);

	return (
		<Router>
			<Routes>
				{/* Authentication Route */}
				<Route
					path="/auth"
					element={
						auth ? (
							<Navigate to="/" />
						) : (
							<Auth setAuth={setAuth} setUser={setUser} />
						)
					}
				/>
				<Route
					path="/register"
					element={<SignUp setAuth={setAuth} setUser={setUser} />}
				/>
				{/* Register Faculty Route */}
				<Route
					path="/register-faculty"
					element={<RegisterFaculty setAuth={setAuth} user={user} />}
				/>

				{/* Main Application Routes */}
				<Route
					path="/"
					element={
						auth ? (
							<HomeLayout setAuth={setAuth} user={user} />
						) : (
							<Navigate to="/auth" />
						)
					}
				>
					{/* Default Route - Attendance */}
					<Route index element={<Attendance setAuth={setAuth} user={user} />} />

					{/* Dashboard Route */}
					<Route
						path="dashboard"
						element={<Dashboard setAuth={setAuth} user={user} />}
					/>

					{/* Students Route */}
					<Route
						path="students"
						element={<Students setAuth={setAuth} user={user} />}
					/>
					<Route
						path="edit"
						element={<EditData setAuth={setAuth} user={user} />}
					/>
				</Route>

				{/* Redirect any unknown routes */}
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</Router>
	);
};

export default App;
