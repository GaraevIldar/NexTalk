using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapHealthChecks("/healthz", new HealthCheckOptions { Predicate = _ => false });

app.MapHealthChecks("/readyz", new HealthCheckOptions { Predicate = _ => false });

app.Run();