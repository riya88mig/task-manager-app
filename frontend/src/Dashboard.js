import { useNavigate } from "react-router-dom"; 
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const recordsPerPage = 5;

  // ✅ ADDED: Get Role from Token
  const getUserRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));

      return (
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        payload.role
      );
    } catch {
      return null;
    }
  };

  const role = getUserRole();

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${mins}`;
};

  /* ================= FETCH TASKS ================= */
  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetch(
        "https://taskmanagerappriya-avc6dhenhvgjeyd4.centralindia-01.azurewebsites.net/api/Task",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 401) {
        Swal.fire("Session Expired", "Please login again", "warning");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setTasks(data);
    } catch (err) {
      Swal.fire("Error", "Something went wrong ❌", "error");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /* ================= ROUTE PROTECTION ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchTasks();
  }, [fetchTasks, navigate]);

  /* ================= REFRESH ================= */
  const handleRefresh = () => {
    setActiveTab("All");
    setCurrentPage(1);
    fetchTasks();
  };

  /* ================= FILTER ================= */
  const filteredTasks =
    activeTab === "All"
      ? tasks
      : tasks.filter((t) => t.Status === activeTab);

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * recordsPerPage;
  const currentTasks = filteredTasks.slice(
    indexOfLast - recordsPerPage,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredTasks.length / recordsPerPage);

  /* ================= COUNTS ================= */
  const counts = {
    All: tasks.length,
    Pending: tasks.filter((t) => t.Status === "Pending").length,
    Completed: tasks.filter((t) => t.Status === "Completed").length,
    InProgress: tasks.filter((t) => t.Status === "InProgress").length,
    Hold: tasks.filter((t) => t.Status === "Hold").length,
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
          <h2 style={titleStyle}>Task Dashboard</h2>
          <p style={subtitle}>Overview of tasks</p>
        </div>

        <div>
          {/* ✅ ADDED: Admin-only button */}
          {role === "Admin" && (
            <button
              onClick={() => navigate("/create-user")}
              className="btn-primary"
              style={{ marginRight: "5px" }}  
            >
              + New User
            </button>
          )}

          <button
            onClick={() => navigate("/create-task")}
            className="btn-primary"
          >
            + New Task
          </button>

          <button className="btn-secondary" onClick={handleRefresh}>
            🔄 Refresh
          </button>

          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>
      </div>

      {/* LOADER */}
      {loading && <div className="loader">Loading...</div>}

      {/* CARDS */}
      <div style={cardGrid}>
        {["All", "Pending", "InProgress", "Completed", "Hold"].map((type) => (
          <div
            key={type}
            className={`card ${type}`}
            onClick={() => {
              setActiveTab(type);
              setCurrentPage(1);
            }}
          >
            <div>{type}</div>
            <h2>{counts[type]}</h2>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div style={tableContainer}>
        <table style={tableStyle}>
          <thead style={{ background: "#1e293b", color: "white" }}>
            <tr>
              <th style={thtd}>S.No</th>
              <th style={thtd}>Title</th>
              <th style={thtd}>Description</th>
              <th style={thtd}>Status</th>
              <th style={thtd}>Created By</th>
              <th style={thtd}>Created At</th>

            </tr>
          </thead>

          <tbody>
            {currentTasks.map((t, index) => (
              <tr key={t.Id} style={getRowStyle(t.Status)}>
                <td style={thtd}>
                  {(currentPage - 1) * recordsPerPage + index + 1}
                </td>
                <td style={thtd}>{t.Title}</td>
                <td style={thtd}>{t.Description}</td>
                <td style={thtd}>
                  <span style={getStatusStyle(t.Status)}>{t.Status}</span>
                </td>
                  <td style={thtd}>{t.CreatedBy}</td>
                  <td style={thtd}>{formatDate(t.CreatedAt)}</td>
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

/* ================= STYLES ================= */

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

const cardGrid = {
  display: "flex",
  gap: "15px",
  marginTop: "20px",
};

const tableContainer = {
  marginTop: "30px",
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
};

const tableStyle = { width: "100%" };
const thtd = { padding: "10px" };

/* ROW COLORS */
const getRowStyle = (status) => ({
  background:
    status === "Completed"
      ? "#dcfce7"
      : status === "Pending"
      ? "#fee2e2"
      : status === "Hold"
      ? "#fef3c7"
      : "#e0f2fe",
});

/* STATUS BADGE */
const getStatusStyle = (status) => ({
  background:
    status === "Completed"
      ? "#22c55e"
      : status === "Pending"
      ? "#ef4444"
      : status === "Hold"
      ? "#f59e0b"
      : "#38bdf8",
  color: "white",
  padding: "4px 8px",
  borderRadius: "12px",
});

/* CSS */
const style = document.createElement("style");
style.innerHTML = `
.btn-primary { background:#2563eb;color:white;padding:8px 12px;border:none;border-radius:6px;cursor:pointer;}
.btn-danger { background:#ef4444;color:white;padding:6px 10px;border:none;border-radius:6px;margin-left:5px;cursor:pointer;}
.btn-secondary { background:#e5e7eb;padding:6px 10px;border:none;border-radius:6px;cursor:pointer;margin-left:5px;}

.loader { text-align:center; margin-top:20px; font-weight:bold; }

.card { flex:1; padding:15px; border-radius:10px; cursor:pointer; text-align:center; border:1px solid #e5e7eb; }
.card.All { background:#eef2ff; }
.card.Pending { background:#fee2e2; }
.card.Completed { background:#dcfce7; }
.card.InProgress { background:#e0f2fe; }
.card.Hold { background:#fef3c7; }
`;
document.head.appendChild(style);

export default Dashboard;