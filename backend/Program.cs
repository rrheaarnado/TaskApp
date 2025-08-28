using Microsoft.EntityFrameworkCore;
using TaskApi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//Add Controllers + Swaggger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer(); //For endpoints (POST, POST (id), GET, PUT, DELETE)
builder.Services.AddSwaggerGen();

builder.Services.AddCors(opt =>

{
    opt.AddPolicy("DevCors", p =>
        p.WithOrigins("http://localhost:5173", "http://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod());

}); 

var app = builder.Build(); 

// 4) Middleware pipeline 
app.UseSwagger(); 
app.UseSwaggerUI(); 
app.UseHttpsRedirection(); 

// Enable CORS before mapping controllers 
app.UseCors("DevCors"); 
app.MapControllers(); 
app.Run(); 

