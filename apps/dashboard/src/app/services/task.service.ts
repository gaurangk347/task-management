import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Task, CreateTaskDto, UpdateTaskDto } from '@task-management/data';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly API_URL = environment.apiUrl;
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private readonly http = inject(HttpClient);

  loadTasks(): Observable<Task[]> {
    return this.http
      .get<Task[]>(`${this.API_URL}/tasks`)
      .pipe(tap((tasks) => this.tasksSubject.next(tasks)));
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/tasks`, task).pipe(
      tap((newTask) => {
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next([...currentTasks, newTask]);
      })
    );
  }

  updateTask(id: string, updates: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/tasks/${id}`, updates).pipe(
      tap((updatedTask) => {
        const currentTasks = this.tasksSubject.value;
        const index = currentTasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          currentTasks[index] = updatedTask;
          this.tasksSubject.next([...currentTasks]);
        }
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${id}`).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next(currentTasks.filter((t) => t.id !== id));
      })
    );
  }
}
