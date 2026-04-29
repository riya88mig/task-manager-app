import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import CreateTask from "./CreateTask"; 
import CreateUser from "./CreateUser";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-task" element={<CreateTask />} /> 
        <Route path="/create-user" element={<CreateUser />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;