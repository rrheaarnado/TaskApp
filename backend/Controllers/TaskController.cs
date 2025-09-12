using Microsoft.AspNetCore.Mvc; 
using Microsoft.EntityFrameworkCore; 
using TaskApi.Data; 
using TaskAPI.Models; 
 
namespace TaskApi.Controllers 
{ 
    [ApiController] 
    [Route("api/[controller]")] // -> /api/tasks 
    public class TasksController : ControllerBase 
    { 
        private readonly AppDbContext _db; 
        public TasksController(AppDbContext db) => _db = db; 
 
        // READ ALL: GET /api/tasks 
        [HttpGet] 
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetAll() 
        {
            var items = await _db.Tasks
                .OrderBy(t => t.isDone) 
                .ThenBy(t => t.DueDate)
                .ToListAsync();
 
            return Ok(items);   
        } 
 
        // READ ONE: GET /api/tasks/{id} 
        [HttpGet("{id:int}")] 
        public async Task<ActionResult<TaskItem>> GetById(int id) 
        { 
            var item = await _db.Tasks.FindAsync(id); 
            if (item == null) return NotFound(); 
            return Ok(item); 
        }

        // CREATE: POST /api/tasks 
        [HttpPost]
        public async Task<ActionResult<TaskItem>> Create([FromBody] TaskItem dto)
        {
            if (dto == null)
                return BadRequest("TaskItem cannot be null.");

            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Title is required.");

            if (string.IsNullOrWhiteSpace(dto.Category))
                return BadRequest("Category is required.");
            
            if (dto.EstimateHours == null || dto.EstimateHours < 0)
                return BadRequest("Estimate Hours must not be null and less than 0.");
            try
            {
                _db.Tasks.Add(dto); 
                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred saving the task.");
            }
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }

        // UPDATE: PUT /api/tasks/{id} 
        [HttpPut("{id:int}")] 
        public async Task<IActionResult> Update(int id, TaskItem dto) 
        { 
            if (id != dto.Id) return BadRequest("ID mismatch."); 
 
            var exists = await _db.Tasks.AnyAsync(t => t.Id == id); 
            if (!exists) return NotFound(); 
 
            _db.Entry(dto).State = EntityState.Modified; 
            await _db.SaveChangesAsync(); 
 
            return NoContent(); 
        } 
 
        // DELETE: DELETE /api/tasks/{id} 
        [HttpDelete("{id:int}")] 
        public async Task<IActionResult> Delete(int id) 
        { 
            var item = await _db.Tasks.FindAsync(id); 
            if (item == null) return NotFound();    
 
            _db.Tasks.Remove(item); 
            await _db.SaveChangesAsync(); 
            return NoContent(); 
        } 
    } 
} 
