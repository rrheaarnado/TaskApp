import { useEffect, useState } from "react";
import { api } from "./api";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileDown } from "lucide-react";

export default function App() {

  // ----- state for list ----- 
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----- state for adding task ----- 
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");      // YYYY-MM-DD from <input type="date"> 
  const [category, setCategory] = useState("");
  const [estimateHours, setEstimateHours] = useState("");
  const [saving, setSaving] = useState(false);     // shows button loading state 

  // ----- edit task----- 
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editEstimateHours, setEditEstimateHours] = useState("");
  const [updating, setUpdating] = useState(false);

  // ----- toggle ----- 
  const [toggleBusyId, setToggleBusyId] = useState(null); // id currently toggling 
  const [deleteBusyId, setDeleteBusyId] = useState(null); // id currently deleting

  // Export to Excel Function
  const handleExport = () => {
    if (!tasks || tasks.length === 0) {
      setError("No tasks to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(tasks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'tasks.xlsx');
  }
  
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
  // Handle create (Create Function)
  async function handleAdd(e) {
    e.preventDefault();

    const errors = [];
    //Validations in Adding Task
    if (!title.trim()) {
      errors.push("Title is required.");
    }
    if (!category.trim()) {
      errors.push("Category is required.")
    }
    if (estimateHours === null || estimateHours.trim() === "") {
      errors.push("Estimate Hours must not be empty.");
    }
    /* Add Validation Date
    const today = new Date();
    today.setHours(0, 0, 0, 0); //remove time

    const selectedDate = new Date(dueDate);
    if(selectedDate < today) {
      errors.push("Invalid Due Date. Please select today or a future date.");
    }
    */
    if(errors.length > 0) {
      setError(errors);
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
        category: category.trim(),
        estimateHours: Number(estimateHours) || 0
      });

      // reset form + refresh list 
      setTitle("");
      setDueDate("");
      setCategory("");
      setEstimateHours("");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 1000); // to show button loading state
    }
  }
  //Toggle Done Function
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

  //Delete Function
  async function remove(id) {
  try {
    console.log("Deleting task:", id);
    setError("");
    setDeleteBusyId(id);

    await api.deleteTask(id);
    
    setTimeout(async () => {
      setDeleteBusyId(null);

      await loadTasks();
    }, 1000); 

  } catch (err) {
    setError(err.message || "Failed to delete task");
    setDeleteBusyId(null);
  } 
  }

  //Start Edit Function
  function startEdit(task) {

    setEditId(task.id);
    setEditTitle(task.title ?? "");

    // normalize due date to YYYY-MM-DD for <input type="date"> 
    const d = task.dueDate ? new Date(task.dueDate) : null;
    const ymd = d

      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

      : "";

    setEditDueDate(ymd);
    setEditCategory(task.category ?? "");
    setEditEstimateHours(task.estimateHours);
  }

  //Cancel Edit Function
  function cancelEdit() {
  setEditId(null);
  setEditTitle("");
  setEditDueDate("");
  setEditCategory("");         
  setEditEstimateHours("");    
}


  //Handle Edit Function
  async function saveEdit(originalTask) {

    const errors = [];  

     if (!editTitle.trim()) {
      errors.push("Title is required.");
    }
    if (!editCategory.trim()) {
      errors.push("Category is required.")
    }

     if (editEstimateHours === null || String(editEstimateHours).trim() === "") {
      errors.push("Estimate Hours must not be empty.");
    }

    if(errors.length > 0) {
      setError(errors);
      return;
    }

    /* Edit Validation for Due Date
    const today = new Date();
    today.setHours(0, 0, 0, 0); //remove time

    const selectedDate = new Date(editDueDate);
    if(selectedDate < today) {
      setError("Invalid Due Date. Please select today or a future date.");
      return;
    }
    */

    try {
      setUpdating(true);
      setError("");

      const payload = {
        ...originalTask,
        title: editTitle.trim(),
        // send null if empty string so API accepts it 
        dueDate: editDueDate ? editDueDate : null,
        category: editCategory.trim(),
        estimateHours: editEstimateHours ?? 0
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
    <div className="min-h-screen min-w-[630px] bg-gray-100 text-gray-900">
      <header className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-gray-600">Create a task and it will appear below.</p>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Add Task or Create Form */}
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-2xl shadow p-4 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-100">
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

          <div className="flex-1 min-w-100">
            <label className="block text-sm text-gray-600 mb-1">Category *</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Estimate Hours *</label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              value={estimateHours}
              onChange={(e) => setEstimateHours(e.target.value)}
            />
          </div>

          <div className="w-full flex justify-center">

            {/* Add Button */}
            <button
              type="submit"
              disabled={saving}
              className={`mx-auto rounded-xl px-3 py-2 text-white ${saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                "Add Task"
              )}

            </button>
          </div>

        </form>
        {/* Errors / Loading */}
        {Array.isArray(error) && error.length > 0 && (
          <ul className="text-red-600 text-sm mb-2 list-disc pl-5">
            {error.map((errMsg, index) => (
              <li key={index}>
                <strong>Error({index + 1}):</strong> {errMsg}
              </li>
            ))}
          </ul>
        )}

        {loading && <div className="text-gray-600">Loading…</div>}

        {/* Export Button */}
        <div className="flex mb-3">
          <button
            onClick={handleExport}
            disabled={loading || tasks.length === 0 || saving}
            className={`inline-flex items-center gap-2 ml-auto rounded-xl w-fit px-2 py-2 text-white transition 
            ${saving ? "bg-blue-400" : "bg-green-700 hover:bg-green-800"} 
            ${loading || tasks.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
          `}
          >
            <FileDown className="w-5 h-5" />
            Export to Excel
          </button>
        </div>

        {/* Task List */}
        <ul className="bg-white rounded-2xl shadow divide-y divide-gray-100 max-h-95 overflow-y-auto">
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
                  className="size-5 accent-green-600"
                  checked={task.isDone}
                  onChange={() => toggleDone(task)}
                  disabled={rowBusy || isEditing}
                  aria-label={`Toggle ${task.title}`}

                />

                {/* List */}
                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <div className={`font-semibold ${task.isDone ? "line-through text-gray-400" : ""}`}>
                        {task.title}
                      </div>

                      {task.category && (
                        <div
                          className={`text-sm text-white font-medium rounded-xl px-1.5 py-1 w-fit
                            ${task.isDone ? 'bg-gray-300' : 'bg-pink-500'}
                          `}
                        >
                          Category: {task.category}
                        </div>
                      )}

                      {task.dueDate && (
                        <div className="text-sm text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}

                      {task.estimateHours !== undefined && task.estimateHours !== null && (
                        <div className="text-sm text-gray-500">
                          Estimate Hour: {parseInt(task.estimateHours, 10)}h
                        </div>
                      )}

                    </>
                  ) : (
                    /*Edit View*/
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

                      <input
                        className="rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={editCategory}
                        placeholder="Category"
                        onChange={(e) => setEditCategory(e.target.value)}
                        disabled={updating}
                      />

                      <input
                        className="rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={editEstimateHours}
                        placeholder="Estimate Hours"
                        onChange={(e) => setEditEstimateHours(e.target.value)}
                        disabled={updating}
                      />
                    </div>


                  )}
                </div>

                {/* Right-side actions */}
                {!isEditing ? (
                  <div className="flex items-center gap-2">

                    {/* Edit Button */}
                    <button
                      onClick={() => startEdit(task)}
                      disabled={rowBusy}
                      className={`rounded-lg px-3 py-1 text-gray-700 ${rowBusy ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                      Edit
                    </button>

                     {/* Delete Button */}
                    <div className="w-full flex justify-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${task.title}"?`)) remove(task.id);
                        }}
                        disabled={rowBusy}
                        className={`rounded-lg px-3 py-1 text-gray-700 ${rowBusy
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        aria-label={`Delete ${task.title}`}
                      >
                        {deleteBusyId === task.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            Deleting...
                          </div>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>

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