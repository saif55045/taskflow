import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch tasks
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_URL}/tasks`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      setError('Unable to connect to server. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Add task
  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), priority })
      })
      if (!res.ok) throw new Error('Failed to create task')
      const newTask = await res.json()
      setTasks(prev => [newTask, ...prev])
      setTitle('')
      setDescription('')
      setPriority('medium')
    } catch (err) {
      setError('Failed to add task. Please try again.')
    }
  }

  // Toggle complete
  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      setTasks(prev => prev.map(t => t._id === id ? updated : t))
    } catch (err) {
      setError('Failed to update task.')
    }
  }

  // Delete task
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setTasks(prev => prev.filter(t => t._id !== id))
    } catch (err) {
      setError('Failed to delete task.')
    }
  }

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <span className="header__icon">✦</span>
        <h1 className="header__title">TaskFlow</h1>
        <p className="header__subtitle">Organize your day, one task at a time</p>
      </header>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-card__value stat-card__value--accent">{totalTasks}</div>
          <div className="stat-card__label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{totalTasks - completedTasks}</div>
          <div className="stat-card__label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value stat-card__value--success">{completedTasks}</div>
          <div className="stat-card__label">Done</div>
        </div>
      </div>

      {/* Add Task Form */}
      <form className="add-form" onSubmit={handleAddTask}>
        <div className="add-form__row">
          <input
            id="task-title-input"
            className="add-form__input"
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>
        <div className="add-form__row">
          <input
            id="task-desc-input"
            className="add-form__input add-form__input--desc"
            type="text"
            placeholder="Add a description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
          />
          <select
            id="task-priority-select"
            className="add-form__select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
          <button id="add-task-btn" className="add-form__btn" type="submit" disabled={!title.trim()}>
            Add Task
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            id={`filter-${f}-btn`}
            className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="loading">
          <div className="loading__spinner"></div>
          <p>Loading tasks...</p>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="task-list__empty">
              <span className="task-list__empty-icon">
                {filter === 'completed' ? '🎯' : filter === 'active' ? '🎉' : '📝'}
              </span>
              <p className="task-list__empty-text">
                {filter === 'completed'
                  ? 'No completed tasks yet'
                  : filter === 'active'
                  ? 'All tasks completed!'
                  : 'No tasks yet'}
              </p>
              <p className="task-list__empty-hint">
                {filter === 'all' && 'Add your first task above to get started'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task._id}
                className={`task-card ${task.completed ? 'task-card--completed' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  className="task-card__check"
                  onClick={() => handleToggle(task._id)}
                  aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {task.completed ? '✓' : ''}
                </button>
                <div className="task-card__content">
                  <div className="task-card__title">{task.title}</div>
                  {task.description && (
                    <div className="task-card__desc">{task.description}</div>
                  )}
                  <div className="task-card__meta">
                    <span className={`priority-badge priority-badge--${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className="task-card__date">{formatDate(task.createdAt)}</span>
                  </div>
                </div>
                <button
                  className="task-card__delete"
                  onClick={() => handleDelete(task._id)}
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default App
