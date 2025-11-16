// backend/bektApi/Program.cs
using bektApi.Data;
using bektApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;   // **For 設定 Swagger 的 Securit
using bektApi.Infrastructure; // ⭐ 1. 新增：引入 Filter 所在的命名空間 (請根據您的實際路徑調整)
using Swashbuckle.AspNetCore.SwaggerGen; // ⭐ 1. 新增：SchemaFilter 所需的命名空間


var builder = WebApplication.CreateBuilder(args);

// 加入 CORS 服務
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "https://localhost:5173", // Vite 預設 HTTPS 端口
                "http://localhost:5173",  // Vite 預設 HTTP 端口
                "https://localhost:5001", // 舊的環境變數，以防萬一
                "http://localhost:5000",  // 舊的環境變數，以防萬一
                "http://localhost:8080"   // 如果您用 WebPack 或其他框架
                )  // 改成分開傳入
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add services
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IProductService, ProductService>();

// JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ** 加入 Swagger JWT 授權設定 (已修正: 移除第二個 AddSwaggerGen 並將 SchemaFilter 加入此處)
builder.Services.AddSwaggerGen(options =>
{
    // ⭐ 修正點 1: 註冊您的自訂 Schema Filter，這樣才會生效
    options.SchemaFilter<bektApi.Infrastructure.DisplayAttributeSchemaFilter>();

    // 1. 定義名為 "Bearer" 的安全配置
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "請輸入 'Bearer ' [空格] + Token (例如: Bearer 12345abcdef)",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    // 2. 對所有有 Authorize 屬性的 API 啟用此安全要求
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// ❌ 修正點 2: 這裡的 builder.Services.AddSwaggerGen(); 已被移除，避免重複設定。

var app = builder.Build();

// 建立資料庫 + 種子資料
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    SeedData.Initialize(db);
}


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 啟用 CORS
app.UseCors("AllowFrontend"); // CORS 要在 UseHttpsRedirection 之前

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();