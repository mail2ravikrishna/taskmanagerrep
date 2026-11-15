 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, CalendarDays, Check, CheckCircle2, ChevronDown, Circle,
  Clock3, LayoutDashboard, ListTodo, MoreHorizontal, Plus, Search,
  SlidersHorizontal, Target, Trash2, X, Pencil, Flag, CalendarClock,
  ArrowUpRight, AlertCircle
} from "lucide-react";

type Status = "Not started" | "In progress" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string; title: string; description: string; category: string;
  startDate: string; dueDate: string; priority: Priority; status: Status;
  progress: number; createdAt: string;
};

const STORAGE_KEY = "taskflow.tasks.v1";
const today = () => new Date().toISOString().slice(0, 10);
const dateOffset = (days: number) => {
  const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10);
};
const initialTasks: Task[] = [
  { id: "sample-1", title: "Prepare quarterly business review", description: "Consolidate performance metrics, key achievements and next-quarter priorities.", category: "Work", startDate: today(), dueDate: dateOffset(2), priority: "High", status: "In progress", progress: 65, createdAt: new Date().toISOString() },
  { id: "sample-2", title: "Complete Salesforce architecture study", description: "Revise integration patterns, LDV and security design concepts.", category: "Learning", startDate: today(), dueDate: dateOffset(5), priority: "Medium", status: "In progress", progress: 35, createdAt: new Date().toISOString() },
  { id: "sample-3", title: "Review project transition plan", description: "Validate milestones, owners and open dependencies with stakeholders.", category: "Work", startDate: dateOffset(-2), dueDate: dateOffset(-1), priority: "High", status: "Not started", progress: 0, createdAt: new Date().toISOString() },
  { id: "sample-4", title: "Organise personal documents", description: "Sort important documents and update the digital folder structure.", category: "Personal", startDate: today(), dueDate: dateOffset(7), priority: "Low", status: "Completed", progress: 100, createdAt: new Date().toISOString() }
];

function formatDate(value: string) {
  if (!value) return "No date";
  return new Date(value + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function isOverdue(task: Task) {
  return task.status !== "Completed" && !!task.dueDate && task.dueDate < today();
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [activeView, setActiveView] = useState("All tasks");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "Work", startDate: today(),
    dueDate: dateOffset(1), priority: "Medium" as Priority,
    status: "Not started" as Status, progress: 0
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setTasks(stored ? JSON.parse(stored) : initialTasks);
    } catch { setTasks(initialTasks); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === "Completed").length,
    active: tasks.filter(t => t.status === "In progress").length,
    overdue: tasks.filter(isOverdue).length
  }), [tasks]);

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const q = search.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q) || task.category.toLowerCase().includes(q);
    const matchesPriority = priorityFilter === "All priorities" || task.priority === priorityFilter;
    let matchesView = true;
    if (activeView === "Today") matchesView = task.dueDate === today() && task.status !== "Completed";
    if (activeView === "Upcoming") matchesView = task.dueDate > today() && task.status !== "Completed";
    if (activeView === "Completed") matchesView = task.status === "Completed";
    if (activeView === "Overdue") matchesView = isOverdue(task);
    return matchesSearch && matchesPriority && matchesView;
  }).sort((a, b) => {
    if (a.status === "Completed" && b.status !== "Completed") return 1;
    if (b.status === "Completed" && a.status !== "Completed") return -1;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  }), [tasks, search, priorityFilter, activeView]);

  function openNew() {
    setEditing(null);
    setForm({ title: "", description: "", category: "Work", startDate: today(), dueDate: dateOffset(1), priority: "Medium", status: "Not started", progress: 0 });
    setModalOpen(true);
  }
  function openEdit(task: Task) {
    setEditing(task);
    setForm({ title: task.title, description: task.description, category: task.category, startDate: task.startDate, dueDate: task.dueDate, priority: task.priority, status: task.status, progress: task.progress });
    setMenuFor(null); setModalOpen(true);
  }
  function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const progress = form.status === "Completed" ? 100 : form.status === "Not started" && form.progress === 0 ? 0 : form.progress;
    if (editing) {
      setTasks(prev => prev.map(t => t.id === editing.id ? { ...t, ...form, progress } : t));
    } else {
      setTasks(prev => [{ ...form, progress, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev]);
    }
    setModalOpen(false);
  }
  function updateProgress(task: Task, value: number) {
    const progress = Math.max(0, Math.min(100, value));
    const status: Status = progress === 100 ? "Completed" : progress > 0 ? "In progress" : "Not started";
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress, status } : t));
  }
  function cycleStatus(task: Task) {
    const next: Status = task.status === "Not started" ? "In progress" : task.status === "In progress" ? "Completed" : "Not started";
    const progress = next === "Completed" ? 100 : next === "Not started" ? 0 : Math.max(10, task.progress);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next, progress } : t));
    setMenuFor(null);
  }
  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id)); setMenuFor(null);
  }

  const navItems = [
    { name: "All tasks", icon: ListTodo, count: stats.total },
    { name: "Today", icon: CalendarDays, count: tasks.filter(t => t.dueDate === today() && t.status !== "Completed").length },
    { name: "Upcoming", icon: CalendarClock, count: tasks.filter(t => t.dueDate > today() && t.status !== "Completed").length },
    { name: "Overdue", icon: AlertCircle, count: stats.overdue },
    { name: "Completed", icon: CheckCircle2, count: stats.completed }
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Check size={19} strokeWidth={3} /></div><span>taskflow</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.name} className={`nav-item ${activeView === item.name ? "active" : ""}`} onClick={() => setActiveView(item.name)}>
              <Icon size={18} /><span>{item.name}</span><span className="nav-count">{item.count}</span>
            </button>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-card">
            <div className="focus-icon"><Target size={18} /></div>
            <strong>Stay on track</strong>
            <p>Small steps every day lead to big progress.</p>
            <div className="focus-progress"><span style={{ width: `${stats.total ? Math.round(stats.completed / stats.total * 100) : 0}%` }} /></div>
            <small>{stats.total ? Math.round(stats.completed / stats.total * 100) : 0}% of tasks completed</small>
          </div>
          <div className="profile"><div className="avatar">Y</div><div><strong>My workspace</strong><small>Personal account</small></div><MoreHorizontal size={19} className="muted" /></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-sep">/</span><strong>{activeView}</strong></div>
          <div className="top-actions"><span className="today-label"><CalendarDays size={15} /> {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span><button className="primary-btn top-add" onClick={openNew}><Plus size={17} /> New task</button></div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><div className="eyebrow">YOUR PERSONAL OVERVIEW</div><h1>Good to see you <span>👋</span></h1><p>Here's what's happening with your tasks today.</p></div>
            <button className="primary-btn desktop-add" onClick={openNew}><Plus size={17} /> Create a task</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span>Total tasks</span><div className="stat-icon purple"><ListTodo size={18} /></div></div><div className="stat-number">{stats.total}</div><div className="stat-foot">Across all categories</div></div>
            <div className="stat-card"><div className="stat-top"><span>In progress</span><div className="stat-icon blue"><Activity size={18} /></div></div><div className="stat-number">{stats.active}</div><div className="stat-foot">Tasks you're working on</div></div>
            <div className="stat-card"><div className="stat-top"><span>Completed</span><div className="stat-icon green"><CheckCircle2 size={18} /></div></div><div className="stat-number">{stats.completed}</div><div className="stat-foot">{stats.total ? Math.round(stats.completed / stats.total * 100) : 0}% completion rate</div></div>
            <div className="stat-card"><div className="stat-top"><span>Overdue</span><div className="stat-icon orange"><Clock3 size={18} /></div></div><div className="stat-number">{stats.overdue}</div><div className="stat-foot">Need your attention</div></div>
          </div>

          <div className="task-section">
            <div className="section-heading"><div><h2>{activeView}</h2><p>Keep your priorities moving forward.</p></div><div className="task-total">{filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}</div></div>
            <div className="toolbar">
              <div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." /></div>
              <div className="filter-wrap"><SlidersHorizontal size={16} /><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} aria-label="Filter by priority"><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><ChevronDown size={14} /></div>
            </div>

            <div className="task-list">
              {filteredTasks.map(task => (
                <article className={`task-card ${task.status === "Completed" ? "is-complete" : ""}`} key={task.id}>
                  <button className={`task-check ${task.status === "Completed" ? "checked" : ""}`} onClick={() => cycleStatus(task)} aria-label="Change task status">
                    {task.status === "Completed" ? <Check size={14} /> : task.status === "In progress" ? <span className="check-dot" /> : null}
                  </button>
                  <div className="task-main">
                    <div className="task-title-row"><h3>{task.title}</h3><span className={`priority priority-${task.priority.toLowerCase()}`}><Flag size={11} />{task.priority}</span></div>
                    {task.description && <p className="task-description">{task.description}</p>}
                    <div className="task-meta">
                      <span className="category-tag">{task.category}</span>
                      <span className={`date-meta ${isOverdue(task) ? "overdue-text" : ""}`}><CalendarDays size={13} />{task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}</span>
                      {isOverdue(task) && <span className="overdue-pill">Overdue</span>}
                      <span className={`status-text status-${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span>
                    </div>
                    <div className="progress-row"><div className="progress-track"><span style={{ width: `${task.progress}%` }} /></div><span className="progress-value">{task.progress}%</span><button className="quick-progress" onClick={() => updateProgress(task, task.progress >= 100 ? 0 : Math.min(100, task.progress + 10))} title="Add 10% progress">+10%</button></div>
                  </div>
                  <div className="task-menu-wrap">
                    <button className="icon-btn" onClick={() => setMenuFor(menuFor === task.id ? null : task.id)} aria-label="Task options"><MoreHorizontal size={19} /></button>
                    {menuFor === task.id && <div className="task-menu"><button onClick={() => openEdit(task)}><Pencil size={14} /> Edit task</button><button onClick={() => cycleStatus(task)}><CheckCircle2 size={14} /> Change status</button><button className="delete-action" onClick={() => deleteTask(task.id)}><Trash2 size={14} /> Delete task</button></div>}
                  </div>
                </article>
              ))}
              {filteredTasks.length === 0 && <div className="empty-state"><div className="empty-icon"><ListTodo size={25} /></div><h3>No tasks found</h3><p>{search ? "Try a different search term or filter." : "You're all clear here. Add a task to get started."}</p><button className="primary-btn" onClick={openNew}><Plus size={16} /> Add your first task</button></div>}
            </div>
            <div className="list-footer"><span>Showing {filteredTasks.length} of {tasks.length} tasks</span><span><Circle size={7} fill="currentColor" /> Progress updates automatically</span></div>
          </div>
          <footer className="footer-note">Made for focused work <span>·</span> Your tasks stay in this browser</footer>
        </div>
      </section>

      {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <form className="task-modal" onSubmit={saveTask}>
          <div className="modal-header"><div><span className="eyebrow">{editing ? "UPDATE YOUR WORK" : "MAKE IT HAPPEN"}</span><h2>{editing ? "Edit task" : "Create a new task"}</h2></div><button type="button" className="icon-btn" onClick={() => setModalOpen(false)}><X size={20} /></button></div>
          <label className="field-label">Task name <span>*</span><input autoFocus required maxLength={100} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Prepare project proposal" /></label>
          <label className="field-label">Description<textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add a few details about this task..." /></label>
          <div className="form-grid">
            <label className="field-label">Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Work</option><option>Personal</option><option>Learning</option><option>Health</option><option>Other</option></select></label>
            <label className="field-label">Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}><option>Low</option><option>Medium</option><option>High</option></select></label>
            <label className="field-label">Start date<input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></label>
            <label className="field-label">Due date<input type="date" min={form.startDate || undefined} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></label>
          </div>
          <div className="form-grid status-progress">
            <label className="field-label">Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status, progress: e.target.value === "Completed" ? 100 : e.target.value === "Not started" ? 0 : Math.max(10, form.progress) })}><option>Not started</option><option>In progress</option><option>Completed</option></select></label>
            <label className="field-label">Progress <strong className="range-value">{form.status === "Completed" ? 100 : form.progress}%</strong><input type="range" min="0" max="100" step="5" disabled={form.status === "Completed"} value={form.status === "Completed" ? 100 : form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value), status: Number(e.target.value) === 0 ? "Not started" : "In progress" })} /></label>
          </div>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-btn"><Check size={16} /> {editing ? "Save changes" : "Create task"}</button></div>
        </form>
      </div>}
    </main>
  );
}