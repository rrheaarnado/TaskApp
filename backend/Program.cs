using Microsoft.EntityFrameworkCore;
using TaskApi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

//Add Controllers + Swaggger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer(); //allows Swagger to see your routes and parameters.
builder.Services.AddSwaggerGen(); //adds Swagger UI /swagger

builder.Services.AddCors(opt =>

{
    opt.AddPolicy("DevCors", p =>
        p.WithOrigins("http://localhost:5173", "http://localhost:3000") //Allows request from these two, without this frotnend would get COR errors
         .AllowAnyHeader()
         .AllowAnyMethod());

});

var app = builder.Build(); //build application based on the configuration above

// 4) Middleware pipeline 
app.UseSwagger();  //Test APIS (GET,PUT,DELETE,POST) in browser
app.UseSwaggerUI();
app.UseHttpsRedirection(); ///rediects HTTP requests to HTTPS  

// Enable CORS before mapping controllers 
app.UseCors("DevCors"); //must call UseCors() before your endpoints (MapControllers) to allow cross-origin access.
app.MapControllers();  //map controller routes (like /api/tasks) so they respond to HTTP requests.
app.Run();

