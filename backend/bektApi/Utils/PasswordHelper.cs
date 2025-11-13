using System.Security.Cryptography;
using System.Text;

namespace bektApi.Utils;

public static class PasswordHelper
{
    private const int ITERATIONS = 10000;
    private const int SALT_SIZE = 32;
    private const int HASH_SIZE = 32;

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SALT_SIZE);
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, ITERATIONS, HashAlgorithmName.SHA256);
        var hash = Convert.ToBase64String(pbkdf2.GetBytes(HASH_SIZE));
        return $"PBKDF2|{ITERATIONS}|{Convert.ToBase64String(salt)}|{hash}";
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
        if (IsLegacySha256(storedHash))
        {
            using var sha256 = SHA256.Create();
            var computed = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
            return computed == storedHash;
        }

        var parts = storedHash.Split('|');
        if (parts.Length != 4 || parts[0] != "PBKDF2") return false;

        var iterations = int.Parse(parts[1]);
        var salt = Convert.FromBase64String(parts[2]);
        var hash = parts[3];

        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
        var test = Convert.ToBase64String(pbkdf2.GetBytes(HASH_SIZE));
        return test == hash;
    }

    private static bool IsLegacySha256(string hash) =>
        !hash.Contains('|') && hash.Length == 44;
}