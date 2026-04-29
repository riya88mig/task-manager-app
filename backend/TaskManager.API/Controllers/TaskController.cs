using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet]
        public IActionResult GetTasks(string? status)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);
            if (userIdClaim == null || roleClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var role = roleClaim.Value;

            IQueryable<TaskItem> query;

            // Admin → all tasks, User → only own tasks
            if (role == "Admin")
                query = _context.Tasks;
            else
                query = _context.Tasks.Where(t => t.UserId == userId);

            // Apply status filter
            if (!string.IsNullOrEmpty(status))
                query = query.Where(t => t.Status.ToLower() == status.ToLower());

            // Join with Users to get CreatedBy name
            var result = query
                .Join(_context.Users,
                      task => task.UserId,
                      user => user.Id,
                      (task, user) => new
                      {
                          task.Id,
                          task.Title,
                          task.Description,
                          task.Status,
                          task.UserId,
                          task.CreatedAt,
                          CreatedBy = user.Name
                      })
                .ToList();

            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public IActionResult CreateTask(CreateTaskDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                Status = "Pending",
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            _context.SaveChanges();

            return Ok(task);
        }

        [Authorize]
        [HttpPut("{id}")]
        public IActionResult UpdateTask(int id, UpdateTaskDto dto)
        {
            var task = _context.Tasks.Find(id);

            if (task == null) return NotFound();

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);

            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var role = roleClaim?.Value;

            // ✅ Secure check
            if (string.IsNullOrEmpty(role) || (role != "Admin" && task.UserId != userId))
                return Unauthorized();

            // ✅ Validation
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Title is required");

            var validStatuses = new[] { "Pending", "InProgress", "Completed", "Hold" };
            if (!validStatuses.Contains(dto.Status))
                return BadRequest("Invalid status");

            // ✅ Update
            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Status = dto.Status;
            task.ModifiedAt = DateTime.UtcNow;
            _context.SaveChanges();

            return Ok(task);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult DeleteTask(int id)
        {
            var task = _context.Tasks.Find(id);

            if (task == null) return NotFound();

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            if (task.UserId != userId)
                return Unauthorized();

            _context.Tasks.Remove(task);
            _context.SaveChanges();

            return Ok(new { message = "Task deleted successfully" });
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("counts")]
        public IActionResult GetTaskCounts()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);

            if (userIdClaim == null || roleClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var role = roleClaim.Value;

            IQueryable<TaskItem> query;

            // ✅ Admin → all tasks
            if (role == "Admin")
            {
                query = _context.Tasks;
            }
            else
            {
                // ✅ User → only own tasks
                query = _context.Tasks.Where(t => t.UserId == userId);
            }

            // ✅ Count by status
            var result = new
            {
                Pending = query.Count(t => t.Status == "Pending"),
                Completed = query.Count(t => t.Status == "Completed"),
                InProgress = query.Count(t => t.Status == "InProgress"),
                Hold = query.Count(t => t.Status == "Hold")
            };

            return Ok(result);
        }
    }
}