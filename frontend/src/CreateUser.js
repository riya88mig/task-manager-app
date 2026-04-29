import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

function CreateUser() {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: "", email: "", password: "", role: "User" });
  const [users, setUsers] = useState([]);

  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", password: "", role: "User" });

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("https://taskmanagerappriya-avc6dhenhvgjeyd4.centralindia-01.azurewebsites.net/api/Auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data);
  };

  const handleRefresh = () => {
    setSearchText("");
    setActiveTab("All");
    setCurrentPage(1);
    fetchUsers();
  };

  // FILTER + SEARCH
  const filteredUsers = users
    .filter((u) => (activeTab === "All" ? true : u.Role === activeTab))
    .filter((u) =>
      (u.Name + " " + u.Email).toLowerCase().includes(searchText.toLowerCase())
    );

  // PAGINATION
  const indexOfLast = currentPage * recordsPerPage;
  const currentUsers = filteredUsers.slice(indexOfLast - recordsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!user.name || !user.email || !user.password) {
      Swal.fire("Warning", "All fields are required!", "warning");
      return;
    }

    const res = await fetch("https://taskmanagerappriya-avc6dhenhvgjeyd4.centralindia-01.azurewebsites.net/api/Auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        Name: user.name,
        Email: user.email,
        Password: user.password,
        Role: user.role,
      }),
    });

    if (!res.ok) {
  const data = await res.json();
  Swal.fire("Error", data.message || "Failed ❌", "error");
  return;
}

    Swal.fire("Success", "User Created ✅", "success");
    setUser({ name: "", email: "", password: "", role: "User" });
    fetchUsers();
    setCurrentPage(1);
  };

  const handleEdit = (u) => {
    setEditUserId(u.Id);
    setEditData({ name: u.Name, email: u.Email, password: "", role: u.Role });
  };

  const handleUpdate = async (id) => {
    const confirm = await Swal.fire({
      title: "Update user?",
      icon: "question",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`https://taskmanagerappriya-avc6dhenhvgjeyd4.centralindia-01.azurewebsites.net/api/Auth/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        Name: editData.name,
        Email: editData.email,
        Password: editData.password,
        Role: editData.role,
      }),
    });

    if (!res.ok) {
  const data = await res.json();
  Swal.fire("Error", data.message || "Update failed ❌", "error");
  return;
}

    Swal.fire("Updated!", "User updated ✅", "success");
    setEditUserId(null);
    fetchUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>User Manager</h2>
          <p style={subtitle}>Create and manage your users</p>
        </div>
        <div>
          <button onClick={() => navigate("/dashboard")} className="btn-secondary">
            Dashboard
          </button>
          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>
      </div>

      {/* TOP SECTION */}
      <div style={topSection}>
        {/* CREATE */}
        <div style={cardStyle}>
          <h3>Create User</h3>

          <input
            placeholder="Full name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            style={smallInput}
          />
          <input
            placeholder="Email"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            style={smallInput}
          />
          <input
            placeholder="Password"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            style={smallInput}
          />
          <select
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value })}
            style={smallInput}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>

          <button className="btn-primary" onClick={handleSubmit}>
            Create
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <div style={cardStyle}>
          <h3>Search & Filter</h3>

          <input
            placeholder="Search by name or email..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            style={smallInput}
          />

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", "User", "Admin"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "btn-primary" : "btn-secondary"}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
              >
                {tab}
              </button>
            ))}

            <button className="btn-secondary" onClick={handleRefresh}>
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={tableContainer}>
        <table style={tableStyle}>
          <thead style={{ background: "#1e293b", color: "white" }}>
            <tr>
              <th style={thtd}>S.No</th>
              <th style={thtd}>Name</th>
              <th style={thtd}>Email</th>
              <th style={thtd}>Password</th>
              <th style={thtd}>Role</th>
              <th style={thtd}>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentUsers.map((u, index) => (
              <tr key={u.Id} style={getRowStyle(u.Role)}>

                {/* S.NO */}
                <td style={thtd}>
                  {(currentPage - 1) * recordsPerPage + index + 1}
                </td>

                {/* NAME */}
                <td style={thtd}>
                  {editUserId === u.Id ? (
                    <input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    u.Name
                  )}
                </td>

                {/* EMAIL */}
                <td style={thtd}>
                  {editUserId === u.Id ? (
                    <input
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  ) : (
                    u.Email
                  )}
                </td>

                {/* PASSWORD */}
                <td style={thtd}>
                  {editUserId === u.Id ? (
                    <input
                      type="password"
                      placeholder="New password"
                      value={editData.password}
                      onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    />
                  ) : (
                    "••••••••"
                  )}
                </td>

                {/* ROLE */}
                <td style={thtd}>
                  {editUserId === u.Id ? (
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    <span style={getRoleStyle(u.Role)}>{u.Role}</span>
                  )}
                </td>

                {/* ACTION */}
                <td style={thtd}>
                  {editUserId === u.Id ? (
                    <>
                      <button className="btn-primary" onClick={() => handleUpdate(u.Id)}>
                        Save
                      </button>
                      <button className="btn-secondary" onClick={() => setEditUserId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="btn-edit" onClick={() => handleEdit(u)}>
                      Edit
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="btn-secondary"
          >
            Prev
          </button>

          <span style={{ margin: "0 10px" }}>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== STYLES (identical to CreateTask) ===== */

const smallInput = {
  width: "100%",
  padding: "6px",
  fontSize: "13px",
  marginBottom: "8px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

const pageStyle = {
  padding: "30px",
  background: "#f4f6f8",
  minHeight: "100vh",
  fontFamily: "Segoe UI",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
};

const titleStyle = { margin: 0 };
const subtitle = { color: "#6b7280" };

const topSection = {
  display: "flex",
  gap: "20px",
  marginTop: "20px",
};

const cardStyle = {
  flex: 1,
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
};

const tableContainer = {
  marginTop: "30px",
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
};

const tableStyle = { width: "100%" };
const thtd = { padding: "10px" };

const getRowStyle = (role) => ({
  background: role === "Admin" ? "#dcfce7" : "#e0f2fe",
});

const getRoleStyle = (role) => ({
  background: role === "Admin" ? "#22c55e" : "#38bdf8",
  color: "white",
  padding: "4px 8px",
  borderRadius: "12px",
});

/* BUTTON STYLES — only append once if not already added */
if (!document.getElementById("shared-btn-styles")) {
  const style = document.createElement("style");
  style.id = "shared-btn-styles";
  style.innerHTML = `
    .btn-primary { background:#2563eb;color:white;padding:8px 12px;border:none;border-radius:6px;cursor:pointer;}
    .btn-primary:hover { background:#1d4ed8;}
    .btn-danger { background:#ef4444;color:white;padding:6px 10px;border:none;border-radius:6px;margin-left:5px;cursor:pointer;}
    .btn-danger:hover { background:#dc2626;}
    .btn-secondary { background:#e5e7eb;padding:6px 10px;border:none;border-radius:6px;cursor:pointer;}
    .btn-secondary:hover { background:#d1d5db;}
    .btn-edit { background:#3b82f6;color:white;padding:6px 10px;border:none;border-radius:6px;margin-right:5px;cursor:pointer;}
    .btn-edit:hover { background:#2563eb;}
  `;
  document.head.appendChild(style);
}

export default CreateUser;