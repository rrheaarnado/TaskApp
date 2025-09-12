using System.ComponentModel.DataAnnotations;

namespace TaskAPI.Models
{
    public class TaskItem
    {
        public int Id { get; set; } //Primary Key by convention (Table: Tasks, Column: Id)
        public string Title { get; set; } = ""; //Required
        public bool isDone { get; set; } = false; //Simple status flag
        public DateTime? DueDate { get; set; } //Nullable optional due date

        //New Columns (Category and Estimated Hours)
        [Required]
        [MaxLength(50)] 
        public string Category { get; set; } = null!; //Required, Cannot be NULL

        [Range(0, int.MaxValue, ErrorMessage = "Estimate Hours must not be null and less than 0.")]
        public int EstimateHours { get; set; } = 0; //Default 0, NOT NULL

    }
}