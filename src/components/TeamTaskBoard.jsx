import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';

function TeamTaskBoard({ teamId, teamMembers, isReadOnly }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const tasksRef = collection(db, 'lftPosts', teamId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
    }, (error) => {
      console.error("Error fetching tasks:", error);
    });
    return () => unsubscribe();
  }, [teamId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || isReadOnly) return;
    const tasksRef = collection(db, 'lftPosts', teamId, 'tasks');
    await addDoc(tasksRef, {
      title: newTask, status: 'todo', assignedTo: '', createdAt: serverTimestamp()
    });
    setNewTask('');
  };

  const handleMoveTask = async (taskId, newStatus) => {
    if (isReadOnly) return;
    const taskRef = doc(db, 'lftPosts', teamId, 'tasks', taskId);
    await updateDoc(taskRef, { status: newStatus });
  };

  const handleAssignTask = async (taskId, userId) => {
    if (isReadOnly) return;
    const taskRef = doc(db, 'lftPosts', teamId, 'tasks', taskId);
    await updateDoc(taskRef, { assignedTo: userId });
  };

  const handleDeleteTask = async (taskId) => {
    if (isReadOnly) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      const taskRef = doc(db, 'lftPosts', teamId, 'tasks', taskId);
      await deleteDoc(taskRef);
    }
  };

  const TaskCard = ({ task }) => {
    const assignee = teamMembers.find(m => m.id === task.assignedTo);

    // --- NEW: Dynamic Colors based on Status ---
    let statusColors = "bg-gray-700 border-transparent"; // Default
    if (task.status === 'todo') {
      statusColors = "bg-red-500/10 border-red-500/30 hover:bg-red-500/20";
    } else if (task.status === 'inprogress') {
      statusColors = "bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20";
    } else if (task.status === 'done') {
      statusColors = "bg-green-500/10 border-green-500/30 hover:bg-green-500/20";
    }

    return (
      <div className={`${statusColors} border p-3 rounded-lg mb-3 shadow-sm transition-all group relative`}>
        <p className="text-gray-200 mb-3 font-medium">{task.title}</p>

        <div className="mb-3 flex items-center gap-2">
          {assignee ? (
            <img src={assignee.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${assignee.id}`} alt={assignee.displayName} className="w-6 h-6 rounded-full border border-gray-600" title={`Assigned to ${assignee.displayName}`} />
          ) : (
            <div className="w-6 h-6 rounded-full border border-gray-600 border-dashed flex items-center justify-center text-xs text-gray-500">?</div>
          )}
          <select
            value={task.assignedTo || ''}
            onChange={(e) => handleAssignTask(task.id, e.target.value)}
            disabled={isReadOnly}
            className="bg-gray-900/50 text-xs text-gray-300 p-1 rounded border border-gray-700 focus:outline-none focus:border-blue-500 flex-1 disabled:opacity-50"
          >
            <option value="">Unassigned</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.displayName || member.email}</option>
            ))}
          </select>
        </div>

        {!isReadOnly && (
          <div className="flex justify-between items-center bg-black/20 p-2 rounded-md text-xs">
            <div>
              {task.status === 'inprogress' && <button onClick={() => handleMoveTask(task.id, 'todo')} className="text-gray-400 hover:text-white px-1">← To Do</button>}
              {task.status === 'done' && <button onClick={() => handleMoveTask(task.id, 'inprogress')} className="text-gray-400 hover:text-white px-1">← In Progress</button>}
            </div>
            <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
            <div>
              {task.status === 'todo' && <button onClick={() => handleMoveTask(task.id, 'inprogress')} className="text-gray-400 hover:text-white px-1">Start →</button>}
              {task.status === 'inprogress' && <button onClick={() => handleMoveTask(task.id, 'done')} className="text-green-400 hover:text-green-300 px-1">Done ✓</button>}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleAddTask} className="mb-6 flex gap-2 shrink-0">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder={isReadOnly ? "Task board is frozen." : "Add a new task..."}
          disabled={isReadOnly}
          className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500 disabled:opacity-50"
        />
        <button type="submit" disabled={!newTask.trim() || isReadOnly} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition disabled:bg-gray-600">
          Add Task
        </button>
      </form>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden min-h-0 h-full">

        <div className="bg-gray-800 p-4 rounded-lg flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-bold text-gray-300 mb-4 border-b-2 border-red-500/50 pb-2 shrink-0">To Do 📌 ({tasks.filter(t => t.status === 'todo').length})</h3>
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
            {tasks.filter(t => t.status === 'todo').map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-bold text-gray-300 mb-4 border-b-2 border-orange-500/50 pb-2 shrink-0">In Progress 🚧 ({tasks.filter(t => t.status === 'inprogress').length})</h3>
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
            {tasks.filter(t => t.status === 'inprogress').map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-bold text-gray-300 mb-4 border-b-2 border-green-500/50 pb-2 shrink-0">Done ✅ ({tasks.filter(t => t.status === 'done').length})</h3>
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
            {tasks.filter(t => t.status === 'done').map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>

      </div>
    </div>
  );
}

export default TeamTaskBoard;