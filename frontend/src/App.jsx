import { useEffect, useState } from "react"; 
import { api } from "./api"; 
 
export default function App() { 

  // ----- state for list ----- 
  const [tasks, setTasks] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(""); 

  // ----- state for create form ----- 
  const [title, setTitle] = useState(""); 
  const [dueDate, setDueDate] = useState("");      // YYYY-MM-DD from <input type="date"> 
  const [saving, setSaving] = useState(false);     // shows button loading state 

  // ----- edit ----- 
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [updating, setUpdating] = useState(false); 

   // ----- toggle ----- 
  const [toggleBusyId, setToggleBusyId] = useState(null); // id currently toggling 
  const [deleteBusyId, setDeleteBusyId] = useState(null); // id currently deleting

  // Load tasks from API 
  async function loadTasks() { 
    try { 
      setError(""); 
      setLoading(true); 
      const data = await api.getTasks(); 
      setTasks(data); 
    } catch (err) { 
      setError(err.message || "Failed to load tasks"); 
    } finally { 
      setLoading(false); 
    } 

  } 
  useEffect(() => { loadTasks(); }, []); 

  // Handle create 
  async function handleAdd(e) { 
    e.preventDefault(); 
    if (!title.trim()) { 
      setError("Title is required."); 
      return; 
    } 

    try { 
      setSaving(true); 
      setError(""); 

      // Send null if no date picked; the API accepts either ISO date or null 
      await api.createTask({ 
        title: title.trim(), 
        isDone: false, 
        dueDate: dueDate || null, 
      }); 

      // reset form + refresh list 
      setTitle(""); 
      setDueDate(""); 
      await loadTasks(); 
    } catch (err) { 
      setError(err.message || "Failed to create task"); 
    } finally { 
      setSaving(false); 
    } 
  } 

//Done
  async function toggleDone(task) {
    try {
      setError("");
      setToggleBusyId(task.id);
      await api.updateTask(task.id, { ...task, isDone: !task.isDone });
      await loadTasks();

    } catch (err) {
      setError(err.message || "Failed to update task");
    } finally {
      setToggleBusyId(null);
    }
  } 

//Delete
  async function remove(id) { 
  try { 
    setError(""); 
    setDeleteBusyId(id); 
    await api.deleteTask(id); 
    await loadTasks(); 
  } catch (err) { 
    setError(err.message || "Failed to delete task"); 
  } finally { 
    setDeleteBusyId(null); 
  } 
} 


  function startEdit(task) {

    setEditId(task.id);
    setEditTitle(task.title ?? "");

    // normalize due date to YYYY-MM-DD for <input type="date"> 
    const d = task.dueDate ? new Date(task.dueDate) : null;
    const ymd = d

      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

      : "";

    setEditDueDate(ymd);
  }

  function cancelEdit() {
    setEditId(null);
    setEditTitle("");
    setEditDueDate("");
  }

  async function saveEdit(originalTask) {
    if (!editTitle.trim()) {
      setError("Title is required.");
      return;
    }
    try {
      setUpdating(true);
      setError("");

      const payload = {
        ...originalTask,
        title: editTitle.trim(),

        // send null if empty string so API accepts it 
        dueDate: editDueDate ? editDueDate : null,
      };

      await api.updateTask(originalTask.id, payload);
      cancelEdit();
      await loadTasks();
    } catch (err) {
      setError(err.message || "Failed to update task");
    } finally {
      setUpdating(false);
    }
  } 

  const sorted = [...tasks].sort((a, b) => {
    // Pending first (false < true) 
    if (a.isDone !== b.isDone) return a.isDone - b.isDone;
    // Then by due date (nulls last) 
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return ad - bd;
  }); 

  return ( 
    <div className="min-h-screen bg-gray-100 text-gray-900"> 
      <header className="max-w-3xl mx-auto p-6"> 
        <h1 className="text-3xl font-bold">Tasks</h1> 
        <p className="text-gray-600">Create a task and it will appear below.</p> 
      </header> 

      <main className="max-w-3xl mx-auto p-6 space-y-6"> 
        {/* Create Form */} 
        <form 
          onSubmit={handleAdd} 
          className="bg-white rounded-2xl shadow p-4 flex flex-wrap gap-3 items-end" 
        > 

          <div className="flex-1 min-w-56"> 
            <label className="block text-sm text-gray-600 mb-1">Title *</label> 
            <input 
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Enter Task" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            /> 
          </div> 

          <div> 
            <label className="block text-sm text-gray-600 mb-1">Due date</label> 
            <input 
              type="date" 
              className="rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
            /> 
          </div> 
 
          <button 
            type="submit" 
            disabled={saving} 
            className={`rounded-xl px-4 py-2 text-white ${ 
              saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700" 
            }`} 
          > 
            {saving ? "Adding..." : "Add"} 
          </button> 
        </form> 

        {/* Errors / Loading */} 
        {error && ( 
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3"> 
            {error} 
          </div> 
        )} 
        {loading && <div className="text-gray-600">Loading…</div>} 
 

        {/* Task List */} 
        <ul className="bg-white rounded-2xl shadow divide-y divide-gray-100">
          {(sorted ?? tasks).length === 0 && !loading && (
            <li className="p-8 text-center text-gray-500">
              <div className="text-lg font-medium">No tasks yet</div>
              <div className="text-sm">Add your first task using the form above.</div>
            </li>
          )}

          {(sorted ?? tasks).map((task) => {
            const isEditing = editId === task.id;
            const rowBusy = toggleBusyId === task.id || deleteBusyId === task.id;

            return (
              <li key={task.id} className="p-4 flex items-center gap-3">
                {/* Done checkbox */}
                <input
                  type="checkbox"
                  className="size-5 accent-blue-600"
                  checked={task.isDone}
                  onChange={() => toggleDone(task)}
                  disabled={rowBusy || isEditing}
                  aria-label={`Toggle ${task.title}`}
                />

                {/* Content area */}
                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <div className={`font-medium ${task.isDone ? "line-through text-gray-400" : ""}`}>
                        {task.title}
                      </div>
                      {task.dueDate && (
                        <div className="text-sm text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <input
                        className="rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 min-w-56 flex-1"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                        disabled={updating}
                      />
                      <input
                        type="date"
                        className="rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        disabled={updating}
                      />
                    </div>
                  )}
                </div>

                {/* Right-side actions */}
                {!isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(task)}
                      disabled={rowBusy}
                      className={`rounded-lg px-3 py-1 text-gray-700 ${rowBusy ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${task.title}"?`)) remove(task.id);
                      }}
                      disabled={rowBusy}
                      className={`rounded-lg px-3 py-1 text-gray-700 ${rowBusy ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      aria-label={`Delete ${task.title}`}
                    >
                      {deleteBusyId === task.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveEdit(task)}
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1"
                      disabled={updating}
                    >
                      {updating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-1 text-gray-700"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul> 


      </main> 
    </div> 
  ); 
} 