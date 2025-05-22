using BookManagementApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        dbContext.Database.Migrate(); // This applies pending migrations
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// API Endpoints
app.MapGet("/api/books", async (AppDbContext context) =>
    await context.Books.ToListAsync());

app.MapGet("/api/books/{id}", async (AppDbContext context, int id) =>
    await context.Books.FindAsync(id) is Book book ? Results.Ok(book) : Results.NotFound());

app.MapPost("/api/books", async (AppDbContext context, Book book) =>
{
    // Check for duplicate by title and author 
    var exists = await context.Books.AnyAsync(b =>
        b.Title.ToLower() == book.Title.ToLower() &&
        b.Author.ToLower() == book.Author.ToLower());

    if (exists)
    {
        return Results.Conflict("A book with the same title and author already exists");
    }

    context.Books.Add(book);
    await context.SaveChangesAsync();
    return Results.Created($"/api/books/{book.Id}", book);
});

app.MapPut("/api/books/{id}", async (AppDbContext context, int id, Book updatedBook) =>
{
    var book = await context.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    book.Title = updatedBook.Title;
    book.Author = updatedBook.Author;
    book.ISBN = updatedBook.ISBN;
    book.PublicationDate = updatedBook.PublicationDate;

    await context.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/books/{id}", async (AppDbContext context, int id) =>
{
    var book = await context.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    context.Books.Remove(book);
    await context.SaveChangesAsync();
    return Results.NoContent();
});



app.Run();