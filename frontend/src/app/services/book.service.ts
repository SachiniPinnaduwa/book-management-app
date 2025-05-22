import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, shareReplay } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Book } from '../models/book';

const API_BASE_URL = 'https://localhost:7038/api';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private readonly apiUrl = `${API_BASE_URL}/books`;

  // Cache for all books
  private booksCache$?: Observable<Book[]>;

  // Cache for individual books (by ID)
  private bookCache = new Map<number, Observable<Book>>();

  //Retrieves all books from the API
  getBooks(): Observable<Book[]> {
    if (!this.booksCache$) {
      this.booksCache$ = this.http.get<Book[]>(this.apiUrl).pipe(
        shareReplay(1), // Cache the most recent response
        catchError(this.handleError)
      );
    }
    return this.booksCache$;
  }

  //Retrieves a single book by ID
  getBook(id: number): Observable<Book> {
    if (id <= 0) {
      return throwError(() => new Error('Invalid book ID'));
    }

    if (!this.bookCache.has(id)) {
      const book$ = this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
        shareReplay(1), // Cache this book
        catchError(this.handleError)
      );
      this.bookCache.set(id, book$);
    }
    return this.bookCache.get(id)!;
  }

  // Adds a new book
  addBook(book: Omit<Book, 'id'>): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book).pipe(
      tap(() => {
        this.clearCache(); // Clear cache since data changed
        this.showSuccessNotification('Book added successfully!');
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 409) {
          // Handle duplicate book error specifically
          const errorMessage =
            error.error ||
            'A book with the same title and author already exists';
          this.showErrorNotification(errorMessage);
          return throwError(() => ({
            status: error.status,
            message: errorMessage,
          }));
        }
        // Handle other errors
        return this.handleError(error);
      })
    );
  }

  //Updates an existing book
  updateBook(id: number, book: Book): Observable<any> {
    if (id <= 0) {
      return throwError(() => new Error('Invalid book ID'));
    }

    return this.http.put(`${this.apiUrl}/${id}`, book).pipe(
      tap(() => {
        this.clearCache(); // Clear cache since data changed
        this.showSuccessNotification('Book updated successfully!');
      }),
      catchError(this.handleError)
    );
  }

  //Deletes a book by ID
  deleteBook(id: number): Observable<any> {
    if (id <= 0) {
      return throwError(() => new Error('Invalid book ID'));
    }

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.clearCache(); // Clear cache since data changed
        this.showSuccessNotification('Book deleted successfully!');
      }),
      catchError(this.handleError)
    );
  }

  // Clears all cached data
  private clearCache(): void {
    this.booksCache$ = undefined;
    this.bookCache.clear();
  }

  //Shows a success notification
  private showSuccessNotification(message: string): void {
    this.showNotification(message, 'success');
  }

  //Shows an error notification
  private showErrorNotification(message: string): void {
    this.showNotification(message, 'error');
  }

  //Displays a snackbar notification
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`${type}-snackbar`],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  //Handles HTTP errors
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    const errorMessage = this.parseErrorMessage(error);
    this.showErrorNotification(errorMessage);
    console.error('BookService error:', error);
    return throwError(() => new Error(errorMessage));
  };

  //Parses an HTTP error into a user-friendly message
  private parseErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 409) {
      // Skip showing notification for 409 errors since we already showed it
      return (
        error.error || 'A book with the same title and author already exists'
      );
    }

    if (error.error instanceof ErrorEvent) {
      return `Client error: ${error.error.message}`;
    }

    switch (error.status) {
      case 0:
        return 'Network error: Could not connect to server';
      case 400:
        return 'Bad request: Invalid book data';
      case 404:
        return 'Book not found';
      case 409:
        return 'Conflict: Book already exists';
      case 500:
        return 'Server error: Please try again later';
      default:
        return `Unexpected error: ${error.message}`;
    }
  }
}
