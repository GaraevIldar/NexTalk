using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((_, lc) => lc.ReadFrom.Configuration(builder.Configuration));

var redisConnectionString = builder.Configuration.GetConnectionString("Redis")!;

builder.Services.AddStackExchangeRedisCache(opts =>
{
    opts.Configuration = redisConnectionString;
    opts.InstanceName = "nextalk:";
});

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("PostgresConnection")!, tags: ["ready"])
    .AddRedis(redisConnectionString, tags: ["ready"]);

var app = builder.Build();

app.UseSerilogRequestLogging(opts =>
    opts.EnrichDiagnosticContext = (dc, ctx) =>
        dc.Set("CorrelationId",
            ctx.Request.Headers["X-Request-Id"].FirstOrDefault()
            ?? ctx.Request.Headers["X-Correlation-Id"].FirstOrDefault()
            ?? ctx.TraceIdentifier));

app.MapHealthChecks("/healthz", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/readyz", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.Run();
