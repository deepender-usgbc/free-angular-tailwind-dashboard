import { TestBed } from '@angular/core/testing';
import { KanbanBoardService } from './kanban-board.service';
import { Task, NewTaskData } from './kanban.models';

describe('KanbanBoardService', () => {
  let service: KanbanBoardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KanbanBoardService],
    });
    service = TestBed.inject(KanbanBoardService);
  });

  // --- Seed data ---
  describe('seed data', () => {
    it('should initialize with tasks across all three statuses', () => {
      const todo = service.getTasksByStatus('todo');
      const inprogress = service.getTasksByStatus('inprogress');
      const done = service.getTasksByStatus('done');

      expect(todo.length).toBeGreaterThan(0);
      expect(inprogress.length).toBeGreaterThan(0);
      expect(done.length).toBeGreaterThan(0);
    });

    it('should initialize with 8 total seed tasks', () => {
      const total =
        service.getTasksByStatus('todo').length +
        service.getTasksByStatus('inprogress').length +
        service.getTasksByStatus('done').length;
      expect(total).toBe(8);
    });

    it('should have unique IDs for all seed tasks', () => {
      const allTasks = [
        ...service.getTasksByStatus('todo'),
        ...service.getTasksByStatus('inprogress'),
        ...service.getTasksByStatus('done'),
      ];
      const ids = allTasks.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // --- getTasksByStatus ---
  describe('getTasksByStatus', () => {
    it('should return correct tasks for todo status', () => {
      const tasks = service.getTasksByStatus('todo');
      expect(tasks.length).toBe(3);
      tasks.forEach((t) => expect(t.status).toBe('todo'));
    });

    it('should return correct tasks for inprogress status', () => {
      const tasks = service.getTasksByStatus('inprogress');
      expect(tasks.length).toBe(3);
      tasks.forEach((t) => expect(t.status).toBe('inprogress'));
    });

    it('should return correct tasks for done status', () => {
      const tasks = service.getTasksByStatus('done');
      expect(tasks.length).toBe(2);
      tasks.forEach((t) => expect(t.status).toBe('done'));
    });

    it('should return empty array for status with no tasks after moving all out', () => {
      // Move all done tasks to todo
      const doneTasks = service.getTasksByStatus('done');
      doneTasks.forEach((t) => service.moveTask(t.id, 'todo'));
      expect(service.getTasksByStatus('done').length).toBe(0);
    });
  });

  // --- addTask ---
  describe('addTask', () => {
    it('should add a task with correct properties', () => {
      const data: NewTaskData = {
        title: 'New Task',
        description: 'A description',
        priority: 'High',
      };
      const task = service.addTask(data, 'todo');

      expect(task.title).toBe('New Task');
      expect(task.description).toBe('A description');
      expect(task.priority).toBe('High');
      expect(task.status).toBe('todo');
      expect(task.id).toBeTruthy();
    });

    it('should generate a unique ID for the new task', () => {
      const data: NewTaskData = {
        title: 'Task A',
        description: '',
        priority: 'Low',
      };
      const task1 = service.addTask(data, 'todo');
      const task2 = service.addTask({ ...data, title: 'Task B' }, 'todo');
      expect(task1.id).not.toBe(task2.id);
    });

    it('should trim the title', () => {
      const data: NewTaskData = {
        title: '  Trimmed Title  ',
        description: '',
        priority: 'Medium',
      };
      const task = service.addTask(data, 'inprogress');
      expect(task.title).toBe('Trimmed Title');
    });

    it('should throw error for empty title', () => {
      const data: NewTaskData = {
        title: '',
        description: 'desc',
        priority: 'Medium',
      };
      expect(() => service.addTask(data, 'todo')).toThrowError(
        'Task title cannot be empty'
      );
    });

    it('should throw error for whitespace-only title', () => {
      const data: NewTaskData = {
        title: '   ',
        description: 'desc',
        priority: 'Medium',
      };
      expect(() => service.addTask(data, 'todo')).toThrowError(
        'Task title cannot be empty'
      );
    });

    it('should increase the task count in the target status', () => {
      const before = service.getTasksByStatus('done').length;
      service.addTask(
        { title: 'Done task', description: '', priority: 'Low' },
        'done'
      );
      expect(service.getTasksByStatus('done').length).toBe(before + 1);
    });
  });

  // --- updateTask ---
  describe('updateTask', () => {
    it('should update task properties correctly', () => {
      const tasks = service.getTasksByStatus('todo');
      const original = tasks[0];
      const updated: Task = {
        ...original,
        title: 'Updated Title',
        description: 'Updated desc',
        priority: 'High',
      };

      service.updateTask(updated);

      const refreshed = service
        .getTasksByStatus('todo')
        .find((t) => t.id === original.id);
      expect(refreshed).toBeTruthy();
      expect(refreshed!.title).toBe('Updated Title');
      expect(refreshed!.description).toBe('Updated desc');
      expect(refreshed!.priority).toBe('High');
    });

    it('should trim the title on update', () => {
      const tasks = service.getTasksByStatus('todo');
      const original = tasks[0];
      service.updateTask({ ...original, title: '  Trimmed  ' });

      const refreshed = service
        .getTasksByStatus('todo')
        .find((t) => t.id === original.id);
      expect(refreshed!.title).toBe('Trimmed');
    });

    it('should throw error for empty title', () => {
      const tasks = service.getTasksByStatus('todo');
      const original = tasks[0];
      expect(() =>
        service.updateTask({ ...original, title: '' })
      ).toThrowError('Task title cannot be empty');
    });

    it('should throw error for whitespace-only title', () => {
      const tasks = service.getTasksByStatus('todo');
      const original = tasks[0];
      expect(() =>
        service.updateTask({ ...original, title: '   ' })
      ).toThrowError('Task title cannot be empty');
    });

    it('should do nothing for non-existent task ID', () => {
      const allBefore = [
        ...service.getTasksByStatus('todo'),
        ...service.getTasksByStatus('inprogress'),
        ...service.getTasksByStatus('done'),
      ];

      service.updateTask({
        id: 'non-existent-id',
        title: 'Ghost',
        description: '',
        priority: 'Low',
        status: 'todo',
      });

      const allAfter = [
        ...service.getTasksByStatus('todo'),
        ...service.getTasksByStatus('inprogress'),
        ...service.getTasksByStatus('done'),
      ];
      expect(allAfter.length).toBe(allBefore.length);
    });
  });

  // --- moveTask ---
  describe('moveTask', () => {
    it('should change task status', () => {
      const todoTasks = service.getTasksByStatus('todo');
      const task = todoTasks[0];

      service.moveTask(task.id, 'done');

      const updatedTodo = service.getTasksByStatus('todo');
      const updatedDone = service.getTasksByStatus('done');

      expect(updatedTodo.find((t) => t.id === task.id)).toBeUndefined();
      expect(updatedDone.find((t) => t.id === task.id)).toBeTruthy();
    });

    it('should move task to specific index in target column', () => {
      const todoTasks = service.getTasksByStatus('todo');
      const task = todoTasks[0];

      service.moveTask(task.id, 'inprogress', 0);

      const inprogress = service.getTasksByStatus('inprogress');
      expect(inprogress[0].id).toBe(task.id);
    });

    it('should move task to end of target column when index exceeds length', () => {
      const todoTasks = service.getTasksByStatus('todo');
      const task = todoTasks[0];

      service.moveTask(task.id, 'inprogress', 100);

      const inprogress = service.getTasksByStatus('inprogress');
      expect(inprogress[inprogress.length - 1].id).toBe(task.id);
    });

    it('should handle move without index (just status change)', () => {
      const todoTasks = service.getTasksByStatus('todo');
      const task = todoTasks[0];
      const todoBefore = todoTasks.length;
      const doneBefore = service.getTasksByStatus('done').length;

      service.moveTask(task.id, 'done');

      expect(service.getTasksByStatus('todo').length).toBe(todoBefore - 1);
      expect(service.getTasksByStatus('done').length).toBe(doneBefore + 1);
    });

    it('should do nothing for non-existent task ID', () => {
      const todoBefore = service.getTasksByStatus('todo').length;
      service.moveTask('non-existent', 'done');
      expect(service.getTasksByStatus('todo').length).toBe(todoBefore);
    });
  });

  // --- reorderTask ---
  describe('reorderTask', () => {
    it('should swap task up correctly', () => {
      const tasks = service.getTasksByStatus('todo');
      expect(tasks.length).toBeGreaterThanOrEqual(2);

      const secondTask = tasks[1];
      const firstTask = tasks[0];

      service.reorderTask(secondTask.id, 'up');

      const reordered = service.getTasksByStatus('todo');
      expect(reordered[0].id).toBe(secondTask.id);
      expect(reordered[1].id).toBe(firstTask.id);
    });

    it('should swap task down correctly', () => {
      const tasks = service.getTasksByStatus('todo');
      expect(tasks.length).toBeGreaterThanOrEqual(2);

      const firstTask = tasks[0];
      const secondTask = tasks[1];

      service.reorderTask(firstTask.id, 'down');

      const reordered = service.getTasksByStatus('todo');
      expect(reordered[0].id).toBe(secondTask.id);
      expect(reordered[1].id).toBe(firstTask.id);
    });

    it('should do nothing when moving first task up (boundary)', () => {
      const tasks = service.getTasksByStatus('todo');
      const firstTask = tasks[0];
      const originalOrder = tasks.map((t) => t.id);

      service.reorderTask(firstTask.id, 'up');

      const reordered = service.getTasksByStatus('todo').map((t) => t.id);
      expect(reordered).toEqual(originalOrder);
    });

    it('should do nothing when moving last task down (boundary)', () => {
      const tasks = service.getTasksByStatus('todo');
      const lastTask = tasks[tasks.length - 1];
      const originalOrder = tasks.map((t) => t.id);

      service.reorderTask(lastTask.id, 'down');

      const reordered = service.getTasksByStatus('todo').map((t) => t.id);
      expect(reordered).toEqual(originalOrder);
    });

    it('should work with single-task column (no swap possible)', () => {
      // Move all done tasks except one to todo
      const doneTasks = service.getTasksByStatus('done');
      for (let i = 1; i < doneTasks.length; i++) {
        service.moveTask(doneTasks[i].id, 'todo');
      }

      const singleDone = service.getTasksByStatus('done');
      expect(singleDone.length).toBe(1);

      const task = singleDone[0];
      service.reorderTask(task.id, 'up');
      expect(service.getTasksByStatus('done')[0].id).toBe(task.id);

      service.reorderTask(task.id, 'down');
      expect(service.getTasksByStatus('done')[0].id).toBe(task.id);
    });

    it('should preserve all tasks in the column after reorder', () => {
      const before = service.getTasksByStatus('todo');
      const beforeIds = new Set(before.map((t) => t.id));

      service.reorderTask(before[1].id, 'up');

      const after = service.getTasksByStatus('todo');
      const afterIds = new Set(after.map((t) => t.id));
      expect(afterIds).toEqual(beforeIds);
    });

    it('should do nothing for non-existent task ID', () => {
      const before = service.getTasksByStatus('todo').map((t) => t.id);
      service.reorderTask('non-existent', 'up');
      const after = service.getTasksByStatus('todo').map((t) => t.id);
      expect(after).toEqual(before);
    });
  });

  // --- generateId ---
  describe('generateId', () => {
    it('should return unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(service.generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('should return a non-empty string', () => {
      const id = service.generateId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });
});
