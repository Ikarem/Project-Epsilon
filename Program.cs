var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ProjectManagerService>();
builder.Services.AddSingleton<IProjectService>(sp => sp.GetRequiredService<ProjectManagerService>()); 

builder.Services.AddSingleton<ITimelineService, TimelineService>();
builder.Services.AddSingleton<IAnalyticsService, AnalyticsService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors("AllowAll");
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/index.html")
    {
        context.Response.Redirect("/home.html");
        return;
    }
    await next();
});

app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();