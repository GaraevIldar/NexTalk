using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((_, lc) => lc.ReadFrom.Configuration(builder.Configuration));

builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseSerilogRequestLogging(opts =>
    opts.EnrichDiagnosticContext = (dc, ctx) =>
        dc.Set("CorrelationId",
            ctx.Request.Headers["X-Request-Id"].FirstOrDefault()
            ?? ctx.Request.Headers["X-Correlation-Id"].FirstOrDefault()
            ?? ctx.TraceIdentifier));

app.MapHealthChecks("/healthz", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/readyz", new HealthCheckOptions { Predicate = _ => false });

app.Run();
