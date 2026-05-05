using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Prometheus;
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

app.UseHttpMetrics();

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
app.MapMetrics();

// Redis distributed cache demo — satisfies SRE requirement:
// multiple guild-service replicas share the same Redis db=1.
//
// Positive case (cache hit):  key exists → returns cached value from Redis.
// Negative case (cache miss): key absent → origin computes value, stores in Redis,
//                              next request (even on another pod) gets cache hit.
app.MapGet("/api/guilds/probe", async (IDistributedCache cache, ILogger<Program> logger) =>
{
    const string key = "guild:probe";

    var cached = await cache.GetStringAsync(key);
    if (cached is not null)
    {
        logger.LogInformation("Cache hit for key {Key}: {Value}", key, cached);
        return Results.Ok(new { source = "cache", value = cached });
    }

    var value = $"set by {Environment.MachineName} at {DateTime.UtcNow:O}";
    await cache.SetStringAsync(key, value, new DistributedCacheEntryOptions
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
    });

    logger.LogInformation("Cache miss for key {Key}, stored by {Instance}", key, Environment.MachineName);
    return Results.Ok(new { source = "origin", value });
});

app.Run();
