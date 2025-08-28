namespace TaskAPI.Models
{
    public class TaskItem
    {
        public int Id { get; set; } //Primary Key by convention (Table: Tasks, Column: Id)
        public string Title { get; set; } = ""; //Required
        public bool isDone { get; set; } = false; //Simple status flag
        public DateTime? DueDate { get; set; } //Nullable optional due date
    }
}