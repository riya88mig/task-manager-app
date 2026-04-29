using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;
using TaskManager.API.Services;
namespace TaskManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            var exists = _context.Users.Any(u => u.Email == dto.Email);
            if (exists)
                return BadRequest(new { message = "A user with this email already exists." });

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = dto.Password,
                Role = string.IsNullOrEmpty(dto.Role) ? "User" : dto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(new { message = "User Registered" });
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var user = _context.Users
                .FirstOrDefault(x => x.Email == dto.Email && x.Password == dto.Password);

            if (user == null)
               // return Unauthorized("Invalid credentials");
            return Unauthorized(new { message = "Invalid credentials" });
            var token = _tokenService.CreateToken(user.Id, user.Email, user.Role);
            return Ok(new { Token = token });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            var users = _context.Users.ToList();
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("users/{id}")]
        public IActionResult UpdateUser(int id, RegisterDto dto)
        {
            var user = _context.Users.Find(id);
            if (user == null) return NotFound();

            var emailTaken = _context.Users.Any(u => u.Email == dto.Email && u.Id != id);
            if (emailTaken)
                return BadRequest(new { message = "This email is already used by another user." });

            user.Name = dto.Name;
            user.Email = dto.Email;
            if (!string.IsNullOrEmpty(dto.Password))
                user.Password = dto.Password;
            user.Role = dto.Role;
            user.ModifiedAt = DateTime.UtcNow;

            _context.SaveChanges();
            return Ok(new { message = "User updated" });
        }


    }
}
