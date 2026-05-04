using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks()
    .AddNpgSql(
        builder.Configuration.GetConnectionString("PostgresConnection")!,
        tags: ["ready"]);

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapHealthChecks("/healthz", new HealthCheckOptions { Predicate = _ => false });

app.MapHealthChecks("/readyz", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.Run();