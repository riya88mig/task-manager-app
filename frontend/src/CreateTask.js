import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

function CreateTask() {
  const navigate = useNavigate();

  const [task, setTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState([]);

  const [editTaskId, setEditTaskId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    status: "Pending",
  });

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("https://taskmanagerappriya-avc6dhenhvgjeyd4.centralindia-01.azurewebsites.net/api/Task", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setTasks(data);
  };

  const handleRefresh = () => {
    setSearchText("");
    setActiveTab("All");
    setCurrentPage(1);
    fetchTasks();
  };

  // FILTER + SEARCH
  const filteredTasks = tasks
    .filter((t) => (activeTab === "All" ? true : t.Status === activeTab))
    .filter((t) =>
      (t.Title + " " + t.Description)
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );

  // PAGINATION
  const indexOfLast = currentPage * recordsPerPage;
  const currentTasks = filteredTasks.slice(
    indexOfLast - recordsPerPage,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredTasks.length / recordsPerPage);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!task.title) {
      Swal.fire("Warning", "Title is required!", "warning");
      return;
    }

    const res = await fetch("https://taskmanagerappriya-avc6dhenhvgjeyd4.centralindia-01.azurewebsites.net/api/Task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        Title: task.title,
        Description: task.description,
      }),
    });

    if (!res.ok) {
      Swal.fire("Error", "Failed ❌", "error");
      return;
    }

    Swal.fire("Success", "Task Created ✅", "success");

    setTask({ title: "", description: "" });
    fetchTasks();
    setCurrentPage(1);
  };

  const handleEdit = (t) => {
    setEditTaskId(t.Id);
    setEditData({
      title: t.Title,
      description: t.Description,
      status: t.Status,
    });
  };

  const handleUpdate = async (id) => {
    const confirm = await Swal.fire({
      title: "Update task?",
      icon: "question",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`https://taskmanagerappriya-avc6dhenhvgjeyd4.centralindia-01.azurewebsites.net/api/Task/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        Title: editData.title,
        Description: editData.description,
        Status: editData.status,
      }),
    });

    if (!res.ok) {
      Swal.fire("Error", "Update failed ❌", "error");
      return;
    }

    Swal.fire("Updated!", "Task updated ✅", "success");

    setEditTaskId(null);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete task?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`https://taskmanagerappriya-avc6dhenhvgjeyd4.centralindia-01.azurewebsites.net/api/Task/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      Swal.fire("Error", "Delete failed ❌", "error");
      return;
    }

    Swal.fire("Deleted!", "Task removed", "success");
    fetchTasks();
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
          <h2 style={titleStyle}>Task Manager</h2>
          <p style={subtitle}>Create and manage your tasks</p>
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
          <h3>Create Task</h3>

          <input
            placeholder="Task title"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            style={smallInput}
          />

          <input
            placeholder="Task description"
            value={task.description}
            onChange={(e) =>
              setTask({ ...task, description: e.target.value })
            }
            style={smallInput}
          />

          <button className="btn-primary" onClick={handleSubmit}>
            Create
          </button>
        </div>

        {/* SEARCH */}
        <div style={cardStyle}>
          <h3>Search & Filter</h3>

          <input
            placeholder="Search..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            style={smallInput}
          />

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", "Pending", "InProgress", "Completed", "Hold"].map((tab) => (
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
              <th style={thtd}>Title</th>
              <th style={thtd}>Description</th>
              <th style={thtd}>Status</th>
              <th style={thtd}>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentTasks.map((t, index) => (
              <tr key={t.Id} style={getRowStyle(t.Status)}>
                
                {/* S.NO */}
                <td style={thtd}>
                  {(currentPage - 1) * recordsPerPage + index + 1}
                </td>

                {/* TITLE */}
                <td style={thtd}>
                  {editTaskId === t.Id ? (
                    <input
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                    />
                  ) : (
                    t.Title
                  )}
                </td>

                {/* DESCRIPTION */}
                <td style={thtd}>
                  {editTaskId === t.Id ? (
                    <input
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    t.Description
                  )}
                </td>

                {/* STATUS */}
                <td style={thtd}>
                  {editTaskId === t.Id ? (
                    <select
                      value={editData.status}
                      onChange={(e) =>
                        setEditData({ ...editData, status: e.target.value })
                      }
                    >
                      <option>Pending</option>
                      <option>InProgress</option>
                      <option>Completed</option>
                      <option>Hold</option>
                    </select>
                  ) : (
                    <span style={getStatusStyle(t.Status)}>{t.Status}</span>
                  )}
                </td>

                {/* ACTION */}
                <td style={thtd}>
                  {editTaskId === t.Id ? (
                    <>
                      <button className="btn-primary" onClick={() => handleUpdate(t.Id)}>
                        Save
                      </button>
                      <button className="btn-secondary" onClick={() => setEditTaskId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-edit" onClick={() => handleEdit(t)}>
                        Edit
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(t.Id)}>
                        Delete
                      </button>
                    </>
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

/* STYLES SAME AS YOURS (UNCHANGED) */

/* STYLES */

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

/* BUTTON HOVER */
const style = document.createElement("style");
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

export default CreateTask;