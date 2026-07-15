using System.Text;
using System.Text.Json;

static class PreviewAutoConfirmSettings
{
    private static readonly object Sync = new();

    private static readonly string SettingsPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "ChatGPTBrowserBridge",
        "NativeHost",
        "settings.json"
    );

    public static bool Enabled
    {
        get
        {
            lock (Sync)
                return LoadUnsafe().PreviewAutoConfirm;
        }
        set
        {
            lock (Sync)
            {
                var settings = LoadUnsafe();
                settings.PreviewAutoConfirm = value;
                SaveUnsafe(settings);
            }
        }
    }

    private static SettingsModel LoadUnsafe()
    {
        if (!File.Exists(SettingsPath))
            return new SettingsModel();

        try
        {
            var json = File.ReadAllText(SettingsPath, Encoding.UTF8);
            return JsonSerializer.Deserialize<SettingsModel>(json)
                ?? new SettingsModel();
        }
        catch (JsonException)
        {
            return new SettingsModel();
        }
        catch (IOException)
        {
            return new SettingsModel();
        }
    }

    private static void SaveUnsafe(SettingsModel settings)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(SettingsPath)!);

        var temporaryPath = SettingsPath + ".tmp-" +
            Guid.NewGuid().ToString("N");

        var json = JsonSerializer.Serialize(
            settings,
            new JsonSerializerOptions { WriteIndented = true }
        );

        File.WriteAllText(
            temporaryPath,
            json,
            new UTF8Encoding(false)
        );

        File.Move(temporaryPath, SettingsPath, true);
    }

    private sealed class SettingsModel
    {
        public bool PreviewAutoConfirm { get; set; }
    }
}
