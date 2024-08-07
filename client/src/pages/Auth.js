import React, { useEffect } from "react";
import { AuthForm } from "../components/AuthForm";

const Auth = ({ setAuth, setUser }) => {
	useEffect(() => {
		document.title = "ATTENDANCE SYSTEM | AUTH";
	});
	return (
		<div className="bg-gray-100 min-h-screen" style={{ overflowX: "hidden" }}>
			<AuthForm setAuth={setAuth} setUser={setUser} />
		</div>
	);
};

export default Auth;
