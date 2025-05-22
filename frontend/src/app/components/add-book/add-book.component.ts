import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';

import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
    MatNativeDateModule,
    DatePipe,
  ],
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css'],
})
export class AddBookComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly bookService = inject(BookService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly minDate = new Date(1900, 0, 1);
  readonly maxDate = new Date();

  book: Omit<Book, 'id'> = {
    title: '',
    author: '',
    isbn: '',
    publicationDate: new Date(),
  };

  isSubmitting = false;
  duplicateError = false;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveBook(): void {
    if (!this.isFormValid()) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.isSubmitting = true;
    this.duplicateError = false;

    this.bookService
      .addBook(this.book)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Book added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.router.navigate(['/books']);
        },
        error: (err) => {
          this.isSubmitting = false;
          if (err.status === 409) {
            this.duplicateError = true;
            this.snackBar.open(
              err.message ||
                'A book with the same title and author already exists',
              'Close',
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
          } else {
            console.error('Error adding book:', err);
            this.snackBar.open(
              'Failed to add book. Please try again.',
              'Close',
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
          }
        },
      });
  }

  isFormValid(): boolean {
    return !!this.book.title && !!this.book.author && !!this.book.isbn;
  }

  navigateToList(): void {
    if (this.book.title || this.book.author || this.book.isbn) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '350px',
        data: {
          title: 'Unsaved Changes',
          message: 'You have unsaved changes. Are you sure you want to leave?',
          confirmText: 'Leave',
          cancelText: 'Stay',
        },
      });

      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result) {
            this.router.navigate(['/books']);
          }
        });
    } else {
      this.router.navigate(['/books']);
    }
  }
}
