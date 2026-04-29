namespace TaskManager.API.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Hold
        public int UserId { get; set; }
        public User ? User { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
}
