import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatDialogModule,
  ],
  templateUrl: './edit-book.component.html',
  styleUrls: ['./edit-book.component.css'],
})
export class EditBookComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private bookService = inject(BookService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly minDate = new Date(1900, 0, 1);
  readonly maxDate = new Date();

  book: Book = {
    id: 0,
    title: '',
    author: '',
    isbn: '',
    publicationDate: new Date(),
  };

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  hasUnsavedChanges = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.getBook(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getBook(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookService.getBook(id).subscribe({
      next: (book) => {
        this.book = book;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          'Failed to load book details. Please try again later.';
        this.isLoading = false;
        console.error('Error loading book:', err);
      },
    });
  }

  updateBook(): void {
    if (!this.isFormValid()) {
      this.showErrorNotification('Please fill all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.bookService
      .updateBook(this.book.id, this.book)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccessNotification('Book updated successfully!');
          this.router.navigate(['/books']);
        },
        error: (err) => {
          this.handleError('Failed to update book. Please try again.', err);
          this.isSubmitting = false;
        },
      });
  }

  private isFormValid(): boolean {
    return !!this.book.title && !!this.book.author && !!this.book.isbn;
  }

  navigateToList(): void {
    if (this.hasUnsavedChanges) {
      this.showUnsavedChangesDialog();
    } else {
      this.router.navigate(['/books']);
    }
  }

  private showUnsavedChangesDialog(): void {
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
      .subscribe((confirmed) => {
        if (confirmed) {
          this.router.navigate(['/books']);
        }
      });
  }

  private showSuccessNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    this.showErrorNotification(message);
    console.error('Error:', error);
  }
}
