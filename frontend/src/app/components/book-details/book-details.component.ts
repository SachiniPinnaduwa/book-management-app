import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
  providers: [DatePipe],
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private bookService = inject(BookService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private datePipe = inject(DatePipe);

  book: Book | null = null;
  isLoading = true;
  errorMessage = '';

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

  navigateToList(): void {
    this.router.navigate(['/books']);
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'fullDate') || '';
  }
}
