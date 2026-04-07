import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Task, PRIORITY_COLORS } from '../kanban.models';

@Component({
  selector: 'app-kanban-task-card',
  imports: [CommonModule, CdkDrag],
  templateUrl: './kanban-task-card.component.html',
})
export class KanbanTaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input({ required: true }) columnName!: string;
  @Input() isFirst = false;
  @Input() isLast = false;

  @Output() taskClick = new EventEmitter<Task>();
  @Output() moveUp = new EventEmitter<Task>();
  @Output() moveDown = new EventEmitter<Task>();

  @HostBinding('attr.aria-label')
  get ariaLabel(): string {
    return `${this.task.title} - ${this.columnName}`;
  }

  getPriorityColors(priority: Task['priority']) {
    return PRIORITY_COLORS[priority];
  }

  onCardClick(): void {
    this.taskClick.emit(this.task);
  }

  onMoveUp(event: Event): void {
    event.stopPropagation();
    this.moveUp.emit(this.task);
  }

  onMoveDown(event: Event): void {
    event.stopPropagation();
    this.moveDown.emit(this.task);
  }
}
