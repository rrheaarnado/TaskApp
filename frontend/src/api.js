const BASE_URL = import.meta.env.VITE_API_URL; 


async function http(path, options = {}) { 

  const res = await fetch(`${BASE_URL}${path}`, { 
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }, 
    ...options, 

  }); 

 

  if (!res.ok) { 

    const text = await res.text(); 

    throw new Error(`${res.status} ${res.statusText} – ${text}`); 

  } 

 

  // Return JSON response (or null if no content) 

  return res.status === 204 ? null : res.json(); 

} 

 

export const api = { 

  getTasks: () => http("/api/Tasks"), 
  getTask: (id) => http(`/api/Tasks/${id}`), 

  createTask: (task) => 
    http("/api/Tasks", { method: "POST", body: JSON.stringify(task) }), 

  updateTask: (id, task) => 
    http(`/api/Tasks/${id}`, { method: "PUT", body: JSON.stringify(task) }), 

  deleteTask: (id) => http(`/api/Tasks/${id}`, { method: "DELETE" }), 

}; 