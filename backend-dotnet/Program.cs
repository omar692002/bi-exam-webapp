using BiBackend.Config;
using BiBackend.Exceptions;
using BiBackend.Mdx;
using BiBackend.Repository;
using BiBackend.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;

const string CorsPolicy = "BiCors";

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<SsasOptions>(builder.Configuration.GetSection(SsasOptions.SectionName));

var allowedOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                     ?? new[] { "http://localhost:5173", "http://localhost:3000" };

builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p => p
    .WithOrigins(allowedOrigins)
    .WithMethods("GET", "POST", "OPTIONS")
    .WithHeaders("Accept", "Content-Type", "Origin")));

builder.Services.AddSingleton<SsasClient>();
builder.Services.AddSingleton<ResultSetMapper>();
builder.Services.AddSingleton<AnalyticsRepository>();
builder.Services.AddSingleton<AnalyticsService>();

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        o.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
        o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    var feature = ctx.Features.Get<IExceptionHandlerFeature>();
    var ex = feature?.Error;
    var (status, reason) = ex switch
    {
        MdxExecutionException => (StatusCodes.Status502BadGateway, "Bad Gateway"),
        BiException           => (StatusCodes.Status400BadRequest, "Bad Request"),
        ArgumentException     => (StatusCodes.Status400BadRequest, "Bad Request"),
        _                     => (StatusCodes.Status500InternalServerError, "Internal Server Error")
    };
    ctx.Response.StatusCode = status;
    ctx.Response.ContentType = "application/json";
    var body = new
    {
        timestamp = DateTimeOffset.UtcNow.ToString("o"),
        status,
        error = reason,
        message = ex?.Message ?? "Unexpected error",
        type = ex?.GetType().Name ?? "Exception"
    };
    await ctx.Response.WriteAsync(JsonSerializer.Serialize(body));
}));

app.UseCors(CorsPolicy);
app.UseSwagger();
app.UseSwaggerUI(c => c.RoutePrefix = "swagger-ui");
app.MapControllers();

app.Run();
