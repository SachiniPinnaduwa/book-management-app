# Book Management System 📚

![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)
![.NET](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet)
![SQL Server](https://img.shields.io/badge/SQL_Server-2019-CC2927?logo=microsoft-sql-server)

A modern full-stack application for managing book collections with a responsive Angular frontend and .NET API backend.

---

## Features ✨

- **Complete CRUD Operations**
- **Real-time Data Sync**
- **Form Validation**
- **Responsive Material Design UI**
- **Confirmation Dialogs**
- **Error Handling**
- **API Response Caching**

---

## Screenshots 🖼️ 

### Book List
![BookList](screenshots/bookList.png)

### Add Book
![AddBook](screenshots/addBook.png)

### View a book
![ViewBoo](screenshots/viewBook.png)

### Edit Book
![EditBook](screenshots/editBook.png)

### Delete Book
![DeleteBook](screenshots/deleteBook.png)

---

## Demo Video 🎥


---

## Tech Stack 🛠️

### Frontend
- Angular 19 (Standalone Components)
- Angular Material
- RxJS (Reactive Programming)
- TypeScript

### Backend
- .NET 8 Minimal APIs
- Entity Framework Core
- SQL Server
- RESTful Architecture

---

## Project Structure 📂
```bash
book-management/
├── frontend/ # Angular 19
│ ├── src/
│ │ ├── app/
│ │ │ ├── components/ # Feature components
│ │ │ ├── services/ # BookService
│ │ │ ├── models/ # Interfaces
│ │ │ └── shared/ # Reusable components
│ │ └── assets/ # Static files
│
├── backend/ # .NET 8
│ ├── Models/ # Data models
│ ├── Migrations/ # Database schema
│ └── appsettings.json # Configuration

```
---

## Getting Started 🚀

### Prerequisites
- Node.js v18+
- .NET 8 SDK
- SQL Server 
### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SachiniPinnaduwa/book-management-app.git
   cd book-management
   ```

2. **Frontend Setup**
```bash   
cd frontend
npm install
ng serve
 ```

3. **Backend Setup**
```bash 
cd backend
dotnet restore
dotnet ef database update
dotnet run
 ```
4. **Access the app**
- Frontend: http://localhost:4200
- API: https://localhost:7038

---

## API Endpoints 🌐

| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | `/api/books`        | Get all books        |
| GET    | `/api/books/{id}`   | Get single book      |
| POST   | `/api/books`        | Add new book         |
| PUT    | `/api/books/{id}`   | Update book          |
| DELETE | `/api/books/{id}`   | Delete book          |




