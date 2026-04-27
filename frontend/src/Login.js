import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLogin({
      ...login,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("https://taskmanagerappriya-avc6dhenhvgjeyd4.centralindia-01.azurewebsites.net/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: login.email,
          Password: login.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Login Failed ❌");
        return;
      }

      localStorage.setItem("token", data.Token);
      console.log("API response TOKEN :",data.Token);
     // alert("Login Success ✅");

      navigate("/dashboard");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={pageStyle}>
      
      {/* Overlay */}
      <div style={overlayStyle}></div>

      {/* Login Card */}
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Task Manager Login 📝
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={login.email}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={login.password}
          onChange={handleChange}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={buttonStyle}>
          Login 🔐
        </button>
      </div>
    </div>
  );
}

export default Login;

//////////////////////////////////////////////////////
// 🎨 STYLES

const pageStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage:
    "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
};

const overlayStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
};

const cardStyle = {
  position: "relative",
  zIndex: 1,
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "10px",
  width: "320px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#2c3e50",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};