// Infrastructure/DisplayAttributeSchemaFilter.cs
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace bektApi.Infrastructure
{
    public class DisplayAttributeSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type.IsAbstract || context.Type.IsInterface || context.Type.GetProperties() == null)
                return;

            foreach (var property in context.Type.GetProperties())
            {
                var displayAttribute = property.GetCustomAttribute<DisplayAttribute>();

                if (displayAttribute != null && displayAttribute.Name != null)
                {
                    // ⭐ 核心修正: 將屬性名轉換為 camelCase
                    string camelCaseKey = ToCamelCase(property.Name);

                    if (schema.Properties.ContainsKey(camelCaseKey))
                    {
                        var propertySchema = schema.Properties[camelCaseKey];

                        if (!propertySchema.Extensions.ContainsKey("x-display-name"))
                        {
                            propertySchema.Extensions.Add("x-display-name",
                                new Microsoft.OpenApi.Any.OpenApiString(displayAttribute.Name));
                        }
                    }
                }
            }
        }

        // ⭐ 新增輔助方法: 將 PascalCase 轉換為 camelCase
        private static string ToCamelCase(string str)
        {
            if (string.IsNullOrEmpty(str) || char.IsLower(str[0]))
                return str;

            return char.ToLowerInvariant(str[0]) + str.Substring(1);
        }
    }
}