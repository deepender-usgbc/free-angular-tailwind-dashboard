import { Injectable } from '@angular/core';
import { Task, NewTaskData } from './kanban.models';

@Injectable()
export class KanbanBoardService {
  private tasks: Task[] = [
    {
      id: this.generateId(),
      title: 'Research competitors',
      description: 'Analyze competitor products and features',
      priority: 'Medium',
      status: 'todo',
    },
    {
      id: this.generateId(),
      title: 'Design wireframes',
      description: 'Create wireframes for the main user flows',
      priority: 'High',
      status: 'todo',
    },
    {
      id: this.generateId(),
      title: 'Setup project structure',
      description: 'Initialize repo and configure build tools',
      priority: 'Low',
      status: 'todo',
    },
    {
      id: this.generateId(),
      title: 'Implement authentication',
      description: 'Add login and registration functionality',
      priority: 'High',
      status: 'inprogress',
    },
    {
      id: this.generateId(),
      title: 'Create API endpoints',
      description: 'Build REST API for core resources',
      priority: 'Medium',
      status: 'inprogress',
    },
    {
      id: this.generateId(),
      title: 'Write unit tests',
      description: 'Add test coverage for critical modules',
      priority: 'Low',
      status: 'inprogress',
    },
    {
      id: this.generateId(),
      title: 'Deploy to staging',
      description: 'Set up CI/CD pipeline and deploy',
      priority: 'Medium',
      status: 'done',
    },
    {
      id: this.generateId(),
      title: 'Code review',
      description: 'Review pull requests from the team',
      priority: 'High',
      status: 'done',
    },
  ];

  getTasksByStatus(status: 'todo' | 'inprogress' | 'done'): Task[] {
    return this.tasks.filter((task) => task.status === status);
  }

  addTask(data: NewTaskData, status: 'todo' | 'inprogress' | 'done'): Task {
    if (!data.title || !data.title.trim()) {
      throw new Error('Task title cannot be empty');
    }

    const newTask: Task = {
      id: this.generateId(),
      title: data.title.trim(),
      description: data.description,
      priority: data.priority,
      status,
    };

    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(updatedTask: Task): void {
    if (!updatedTask.title || !updatedTask.title.trim()) {
      throw new Error('Task title cannot be empty');
    }

    const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = { ...updatedTask, title: updatedTask.title.trim() };
    }
  }

  moveTask(
    taskId: string,
    newStatus: 'todo' | 'inprogress' | 'done',
    newIndex?: number
  ): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) {
      return;
    }

    task.status = newStatus;

    if (newIndex !== undefined) {
      // Remove from current position
      const currentIndex = this.tasks.indexOf(task);
      this.tasks.splice(currentIndex, 1);

      // Find the insertion point among tasks with the same status
      const tasksInColumn = this.tasks.filter((t) => t.status === newStatus);
      if (newIndex >= tasksInColumn.length) {
        // Append after the last task in the column
        const lastTask = tasksInColumn[tasksInColumn.length - 1];
        const globalIndex = lastTask
          ? this.tasks.indexOf(lastTask) + 1
          : this.tasks.length;
        this.tasks.splice(globalIndex, 0, task);
      } else {
        const targetTask = tasksInColumn[newIndex];
        const globalIndex = this.tasks.indexOf(targetTask);
        this.tasks.splice(globalIndex, 0, task);
      }
    }
  }

  reorderTask(taskId: string, direction: 'up' | 'down'): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) {
      return;
    }

    const columnTasks = this.tasks.filter((t) => t.status === task.status);
    const columnIndex = columnTasks.indexOf(task);

    if (direction === 'up' && columnIndex > 0) {
      const aboveTask = columnTasks[columnIndex - 1];
      const globalIndexCurrent = this.tasks.indexOf(task);
      const globalIndexAbove = this.tasks.indexOf(aboveTask);
      this.tasks[globalIndexCurrent] = aboveTask;
      this.tasks[globalIndexAbove] = task;
    } else if (direction === 'down' && columnIndex < columnTasks.length - 1) {
      const belowTask = columnTasks[columnIndex + 1];
      const globalIndexCurrent = this.tasks.indexOf(task);
      const globalIndexBelow = this.tasks.indexOf(belowTask);
      this.tasks[globalIndexCurrent] = belowTask;
      this.tasks[globalIndexBelow] = task;
    }
  }

  generateId(): string {
    return crypto.randomUUID();
  }
}
