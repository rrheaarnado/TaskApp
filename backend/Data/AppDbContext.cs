using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using TaskAPI.Models;

namespace TaskApi.Data
{
    //AppDbContext: The EF Core gateway to your database and your tables
    public class AppDbContext : DbContext
    {
        // This constructor lets ASP.NET inject options (like the connection string) 
        public AppDbContext(DbContextOptions<AppDbContext> options) 
            : base(options)
        {
        }
        // DbSet<T> maps your model to a table (TaskItem -> Tasks) 
        public DbSet<TaskItem> Tasks => Set<TaskItem>();
    }




    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            optionsBuilder.UseSqlServer(connectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}

