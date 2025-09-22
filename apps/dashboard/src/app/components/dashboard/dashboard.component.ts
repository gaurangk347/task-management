import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import {
  Task,
  CreateTaskDto,
  TaskCategory,
  TaskStatus,
  User,
} from '@task-management/data';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);

  tasks$: Observable<Task[]> = this.taskService.tasks$;
  currentUser$: Observable<User | null> = this.authService.currentUser$;

  newTask: CreateTaskDto = {
    title: '',
    description: '',
    category: TaskCategory.WORK,
    assigneeId: '',
  };

  showCreateForm = false;
  loading = false;
  error = '';

  // Expose enums to template
  TaskCategory = TaskCategory;
  TaskStatus = TaskStatus;

  ngOnInit(): void {
    this.loadTasks();

    // Set assignee to current user by default
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.newTask.assigneeId = currentUser.id;
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.loadTasks().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to load tasks';
        console.error('Error loading tasks:', error);
      },
    });
  }

  createTask(): void {
    if (!this.newTask.title.trim()) {
      this.error = 'Task title is required';
      return;
    }

    this.loading = true;
    this.error = '';

    this.taskService.createTask(this.newTask).subscribe({
      next: () => {
        this.loading = false;
        this.resetForm();
        this.showCreateForm = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to create task';
      },
    });
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus): void {
    this.taskService.updateTask(taskId, { status: newStatus }).subscribe({
      error: (error) => {
        this.error = error.error?.message || 'Failed to update task';
      },
    });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        error: (error) => {
          this.error = error.error?.message || 'Failed to delete task';
        },
      });
    }
  }

  getNextStatus(currentStatus: TaskStatus): TaskStatus {
    switch (currentStatus) {
      case TaskStatus.TODO:
        return TaskStatus.IN_PROGRESS;
      case TaskStatus.IN_PROGRESS:
        return TaskStatus.DONE;
      case TaskStatus.DONE:
        return TaskStatus.TODO;
      default:
        return TaskStatus.TODO;
    }
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case TaskStatus.DONE:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  resetForm(): void {
    const currentUser = this.authService.getCurrentUser();
    this.newTask = {
      title: '',
      description: '',
      category: TaskCategory.WORK,
      assigneeId: currentUser?.id || '',
    };
  }

  logout(): void {
    this.authService.logout();
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}
