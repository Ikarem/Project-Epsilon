public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    
    
    public List<int> ProjectIds { get; set; } = new();
    
    public void AssociateWithProject(int projectId)
    {
        if (!ProjectIds.Contains(projectId))
        {
            ProjectIds.Add(projectId);
        }
    }
}