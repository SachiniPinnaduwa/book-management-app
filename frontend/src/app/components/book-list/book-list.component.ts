import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  providers: [DatePipe],
})
export class BookListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly displayedColumns: string[] = [
    'title',
    'author',
    'isbn',
    'publicationDate',
    'actions',
  ];
  books: Book[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private bookService: BookService,
    private router: Router,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookService
      .getBooks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (books) => {
          this.books = books;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load books. Please try again later.';
          this.isLoading = false;
          console.error('Error loading books:', err);
        },
      });
  }

  deleteBook(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this book?',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.bookService
            .deleteBook(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.books = this.books.filter((book) => book.id !== id);
              },
              error: (err) => {
                console.error('Error deleting book:', err);
              },
            });
        }
      });
  }

  addBook(): void {
    this.router.navigate(['/books/add']);
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'mediumDate') || '';
  }
}
