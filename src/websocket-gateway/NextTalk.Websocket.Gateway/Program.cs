using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration));

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
}
catch (Exception ex)
{
    Log.Fatal(ex, "WebSocket Gateway terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}