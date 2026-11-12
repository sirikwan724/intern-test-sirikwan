export default function TaskList({ tasks, onDone, busyId }) {
  if (!tasks.length) return <div className="empty">ยังไม่มี Task ในสถานะนี้</div>;

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className="task-card" key={task.id}>
          <div className="task-icon">✓</div>
          <div className="task-content">
            <div className="task-project">{task.project}</div>
            <h3>{task.title}</h3>
            <div className="task-meta">ผู้รับผิดชอบ: {task.assigneeName}</div>
          </div>
          <span className={`status ${task.status === 'Done' ? 'done' : ''}`}>{task.status}</span>
          {onDone && task.status === 'To Do' && (
            <button className="complete-button" disabled={busyId === task.id} onClick={() => onDone(task)}>
              {busyId === task.id ? 'กำลังบันทึก…' : 'ทำเสร็จแล้ว'}
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
