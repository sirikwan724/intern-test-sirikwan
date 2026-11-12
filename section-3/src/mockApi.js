const users = [
  { id: 1, username: 'admin', displayName: 'Ariya Admin', role: 'admin' },
  { id: 2, username: 'mali', displayName: 'Mali Employee', role: 'employee' },
  { id: 3, username: 'niran', displayName: 'Niran Employee', role: 'employee' },
];

let tasks = [
  { id: 101, project: 'Website refresh', title: 'Review homepage copy', assignedTo: 2, status: 'To Do' },
  { id: 102, project: 'Website refresh', title: 'Check mobile layout', assignedTo: 3, status: 'To Do' },
  { id: 103, project: 'Website refresh', title: 'Prepare image assets', assignedTo: 2, status: 'Done' },
  { id: 104, project: 'Internal tools', title: 'Document sign-in flow', assignedTo: 3, status: 'To Do' },
  { id: 105, project: 'Internal tools', title: 'List user permissions', assignedTo: 2, status: 'To Do' },
];

const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 450));
const fail = (message) => new Promise((_, reject) => setTimeout(() => reject(new Error(message)), 450));

function userFor(token) {
  const id = Number(token?.replace('demo-token-', ''));
  return users.find((user) => user.id === id);
}

export const mockApi = {
  async login(username) {
    const user = users.find((item) => item.username === username.trim().toLowerCase());
    if (!user) return fail('ไม่พบชื่อผู้ใช้นี้ในระบบ');
    return wait({ user, token: `demo-token-${user.id}` });
  },

  async getTasks(token) {
    const user = userFor(token);
    if (!user) return fail('กรุณาเข้าสู่ระบบใหม่');
    const visibleTasks = user.role === 'admin'
      ? tasks
      : tasks.filter((task) => task.assignedTo === user.id);
    return wait(visibleTasks.map((task) => ({ ...task })));
  },

  async createTask(token, { title, assignedTo }) {
    const user = userFor(token);
    if (!user || user.role !== 'admin') return fail('เฉพาะ Admin เท่านั้นที่สร้าง Task ได้');
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 120) {
      return fail('ชื่อ Task ต้องมี 1–120 ตัวอักษร');
    }
    const employee = users.find((item) => item.id === Number(assignedTo) && item.role === 'employee');
    if (!employee) return fail('กรุณาเลือกพนักงานที่มีอยู่ในระบบ');
    const task = {
      id: Date.now(), project: 'New project', title: title.trim(),
      assignedTo: employee.id, status: 'To Do',
    };
    tasks = [task, ...tasks];
    return wait({ ...task });
  },

  async updateStatus(token, taskId, status) {
    const user = userFor(token);
    const task = tasks.find((item) => item.id === Number(taskId));
    if (!user) return fail('กรุณาเข้าสู่ระบบใหม่');
    if (!task) return fail('ไม่พบ Task นี้');
    if (user.role !== 'admin' && task.assignedTo !== user.id) return fail('คุณไม่มีสิทธิ์แก้ Task นี้');
    if (user.role !== 'admin' && (task.status !== 'To Do' || status !== 'Done')) {
      return fail('พนักงานเปลี่ยนสถานะได้เฉพาะ To Do เป็น Done');
    }
    if (!['To Do', 'Done'].includes(status)) return fail('สถานะไม่ถูกต้อง');
    task.status = status;
    return wait({ ...task });
  },
};

export const employees = users.filter((user) => user.role === 'employee');
export const demoAccounts = users;
