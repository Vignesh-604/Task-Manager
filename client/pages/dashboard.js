import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/task/user', { withCredentials: true })
      .then(res => setTasks(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
      {tasks.length === 0 ? <p>No tasks found</p> : (
        <ul>
          {tasks.map(task => (
            <li key={task._id} className="border p-2 my-2">
              <p><strong>{task.title}</strong> ({task.status})</p>
              <p>{task.description}</p>
              <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
