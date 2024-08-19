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
import UnlockAttendance from "./pages/UnlockAttendance";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

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

	const getDefaultPage = () => {
		return user.role === "A" ? (
			<Profile setAuth={setAuth} user={user} />
		) : (
			<Attendance setAuth={setAuth} user={user} />
		);
	};

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
					{/* Default Route based on User Role */}
					<Route
						index
						element={
							user.role === "U" ? (
								<Attendance setAuth={setAuth} user={user} />
							) : (
								getDefaultPage()
							)
						}
					/>

					{/* Dashboard Route */}
					<Route
						path="dashboard"
						element={
							user.role === "U" ? (
								<Navigate to="/404" />
							) : (
								<Dashboard setAuth={setAuth} user={user} />
							)
						}
					/>
					<Route
						path="attendance"
						element={<Attendance setAuth={setAuth} user={user} />}
					/>
					<Route
						path="profile"
						element={
							user.role === "U" ? (
								<Navigate to="/404" />
							) : (
								<Profile setAuth={setAuth} user={user} />
							)
						}
					/>

					{/* Students Route */}
					<Route
						path="students"
						element={
							user.role === "U" ? (
								<Navigate to="/404" />
							) : (
								<Students setAuth={setAuth} user={user} />
							)
						}
					/>
					<Route
						path="edit"
						element={
							user.role === "U" ? (
								<Navigate to="/404" />
							) : (
								<EditData setAuth={setAuth} user={user} />
							)
						}
					/>
					<Route
						path="unlock-attendance"
						element={
							user.role === "U" ? (
								<Navigate to="/404" />
							) : (
								<UnlockAttendance setAuth={setAuth} user={user} />
							)
						}
					/>

					{/* 404 Route */}
				</Route>
				<Route path="404" element={<NotFound />} />
				{/* Redirect any unknown routes to 404 */}
				<Route path="*" element={<Navigate to="/404" />} />
			</Routes>
		</Router>
	);
};

export default App;
