export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'inprogress' | 'done';
}

export interface NewTaskData {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface ColumnDef {
  id: 'todo' | 'inprogress' | 'done';
  name: string;
}

export const PRIORITY_COLORS: Record<Task['priority'], { bg: string; text: string; darkBg: string; darkText: string }> = {
  Low:    { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900/30', darkText: 'dark:text-green-400' },
  Medium: { bg: 'bg-orange-100', text: 'text-orange-800', darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-400' },
  High:   { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-900/30', darkText: 'dark:text-red-400' },
};
