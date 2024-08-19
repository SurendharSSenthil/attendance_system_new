// src/pages/NotFound.js
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
	const navigate = useNavigate();

	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<div className="text-center">
				<h1 className="text-9xl font-bold text-red-500 animate-bounce">404</h1>
				<p className="text-2xl font-semibold text-gray-600 mt-4">
					Oops! Page not found.
				</p>
				<img
					src="https://cdn.pixabay.com/photo/2018/01/28/08/48/404-3117376_960_720.png"
					alt="404"
					className="mx-auto my-6 w-3/4 max-w-xs"
				/>
				<button
					onClick={() => navigate("/")}
					className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
				>
					Go to Home
				</button>
			</div>
		</div>
	);
};

export default NotFound;
