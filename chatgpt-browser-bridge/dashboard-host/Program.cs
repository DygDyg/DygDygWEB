using System.Diagnostics;
using System.Drawing;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Windows.Forms;

using var mutex = new Mutex(
    initiallyOwned: true,
    name: "Local\\ChatGPTBrowserBridgeDashboard",
    createdNew: out var createdNew
);

if (!createdNew)
    return;

ApplicationConfiguration.Initialize();
Application.Run(new DashboardForm());

sealed class DashboardForm : Form
{
    private const string ApplicationName =
        "ChatGPT Browser Bridge Dashboard";

    private const string DashboardVersion = "0.18.5";

    private static readonly string DataDirectory = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "ChatGPTBrowserBridge",
        "NativeHost"
    );

    private static readonly string StatePath = Path.Combine(
        DataDirectory,
        "dashboard-state.json"
    );

    private static readonly string HistoryPath = Path.Combine(
        DataDirectory,
        "history.jsonl"
    );

    private static readonly string WorkspacesPath = Path.Combine(
        DataDirectory,
        "workspaces.json"
    );

    private static readonly string SettingsPath = Path.Combine(
        DataDirectory,
        "dashboard.json"
    );

    private readonly Label _connectionValue;
    private readonly Label _statusValue;
    private readonly Label _toolValue;
    private readonly Label _requestValue;
    private readonly Label _summaryValue;
    private readonly Label _updatedValue;
    private readonly Label _commandsValue;
    private readonly Label _successValue;
    private readonly Label _errorsValue;
    private readonly Label _durationValue;
    private readonly Label _dashboardMemoryValue;
    private readonly Label _dashboardUptimeValue;
    private readonly ListBox _historyList;
    private readonly ListBox _workspaceList;
    private readonly CheckBox _alwaysOnTop;
    private readonly System.Windows.Forms.Timer _timer;
    private readonly Stopwatch _uptime = Stopwatch.StartNew();

    public DashboardForm()
    {
        var settings = LoadSettings();

        Text = ApplicationName;
        Width = settings.Width;
        Height = settings.Height;
        MinimumSize = new Size(420, 600);
        StartPosition = FormStartPosition.Manual;
        Location = ValidateLocation(settings);
        TopMost = settings.AlwaysOnTop;
        ShowInTaskbar = true;

        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 6,
            Padding = new Padding(14)
        };

        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 58));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 42));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));

        var title = new Label
        {
            Text = $"ChatGPT Browser Bridge  ·  Dashboard {DashboardVersion}",
            AutoSize = true,
            Font = new Font(
                SystemFonts.MessageBoxFont.FontFamily,
                13f,
                FontStyle.Bold
            ),
            Margin = new Padding(0, 0, 0, 10)
        };

        var stateGroup = CreateGroup("Последнее состояние Bridge");
        var stateGrid = CreateGrid(2);

        _connectionValue = AddRow(stateGrid, 0, "Связь:");
        _statusValue = AddRow(stateGrid, 1, "Статус:");
        _toolValue = AddRow(stateGrid, 2, "Команда:");
        _requestValue = AddRow(stateGrid, 3, "Request ID:");
        _summaryValue = AddRow(stateGrid, 4, "Результат:");
        _updatedValue = AddRow(stateGrid, 5, "Обновлено:");
        stateGroup.Controls.Add(stateGrid);

        var runtimeGroup = CreateGroup("Статистика");
        var runtimeGrid = CreateGrid(4);

        _commandsValue = AddCell(runtimeGrid, 0, 0, "Команд:");
        _successValue = AddCell(runtimeGrid, 2, 0, "Успешно:");
        _errorsValue = AddCell(runtimeGrid, 0, 1, "Ошибок:");
        _durationValue = AddCell(runtimeGrid, 2, 1, "Последняя:");
        _dashboardUptimeValue = AddCell(runtimeGrid, 0, 2, "Dashboard:");
        _dashboardMemoryValue = AddCell(runtimeGrid, 2, 2, "Память:");
        runtimeGroup.Controls.Add(runtimeGrid);

        var historyGroup = CreateGroup("Последние операции");
        historyGroup.Dock = DockStyle.Fill;
        _historyList = new ListBox
        {
            Dock = DockStyle.Fill,
            IntegralHeight = false,
            HorizontalScrollbar = true,
            Font = new Font(FontFamily.GenericMonospace, 9f)
        };
        historyGroup.Controls.Add(_historyList);

        var workspaceGroup = CreateGroup("Рабочие пространства");
        workspaceGroup.Dock = DockStyle.Fill;
        _workspaceList = new ListBox
        {
            Dock = DockStyle.Fill,
            IntegralHeight = false,
            HorizontalScrollbar = true
        };
        workspaceGroup.Controls.Add(_workspaceList);

        var footer = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            AutoSize = true,
            WrapContents = true
        };

        var refreshButton = new Button
        {
            Text = "Обновить",
            AutoSize = true,
            Padding = new Padding(8, 3, 8, 3)
        };
        refreshButton.Click += (_, _) => RefreshAll();

        _alwaysOnTop = new CheckBox
        {
            Text = "Поверх окон",
            AutoSize = true,
            Checked = settings.AlwaysOnTop,
            Margin = new Padding(12, 8, 0, 0)
        };
        _alwaysOnTop.CheckedChanged += (_, _) =>
        {
            TopMost = _alwaysOnTop.Checked;
            SaveSettings();
        };

        footer.Controls.Add(refreshButton);
        footer.Controls.Add(_alwaysOnTop);

        root.Controls.Add(title, 0, 0);
        root.Controls.Add(stateGroup, 0, 1);
        root.Controls.Add(runtimeGroup, 0, 2);
        root.Controls.Add(historyGroup, 0, 3);
        root.Controls.Add(workspaceGroup, 0, 4);
        root.Controls.Add(footer, 0, 5);
        Controls.Add(root);

        ApplyDarkTheme(this);

        _timer = new System.Windows.Forms.Timer { Interval = 1000 };
        _timer.Tick += (_, _) => RefreshAll();

        Shown += (_, _) =>
        {
            RefreshAll();
            _timer.Start();
        };

        FormClosing += (_, _) => SaveSettings();
        Move += (_, _) => SaveSettings();
        ResizeEnd += (_, _) => SaveSettings();
    }

    private void RefreshAll()
    {
        var state = ReadState();
        ApplyState(state);
        RefreshRuntime();
        RefreshHistory();
        RefreshWorkspaces();
    }

    private void ApplyState(DashboardState state)
    {
        var age = DateTimeOffset.UtcNow - state.UpdatedAt;
        var recent = age <= TimeSpan.FromSeconds(10);
        var hostAlive = IsProcessAlive(state.HostProcessId);

        _connectionValue.Text = hostAlive
            ? "🟢 Host работает"
            : recent
                ? "🟡 Host недавно отвечал"
                : "⚪ Host не активен";

        _statusValue.Text = state.Status;
        _toolValue.Text = state.Tool ?? "—";
        _requestValue.Text = state.RequestId ?? "—";
        _summaryValue.Text = state.Error ?? state.Summary ?? "—";
        _updatedValue.Text = state.UpdatedAt == default
            ? "—"
            : state.UpdatedAt.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss");

        _commandsValue.Text = state.TotalCommands.ToString("N0");
        _successValue.Text = state.SuccessfulCommands.ToString("N0");
        _errorsValue.Text = state.FailedCommands.ToString("N0");
        _durationValue.Text = FormatMilliseconds(state.LastDurationMilliseconds);

        _statusValue.ForeColor = state.Status switch
        {
            "running" => Color.Gold,
            "success" => Color.LightGreen,
            "error" => Color.Salmon,
            _ => ForeColor
        };
    }

    private void RefreshRuntime()
    {
        _dashboardUptimeValue.Text = _uptime.Elapsed.TotalDays >= 1
            ? $"{(int)_uptime.Elapsed.TotalDays}.{_uptime.Elapsed:hh\\:mm\\:ss}"
            : _uptime.Elapsed.ToString(@"hh\:mm\:ss");

        try
        {
            using var process = Process.GetCurrentProcess();
            process.Refresh();
            _dashboardMemoryValue.Text = FormatBytes(process.WorkingSet64);
        }
        catch
        {
            _dashboardMemoryValue.Text = "—";
        }
    }

    private void RefreshHistory()
    {
        if (!File.Exists(HistoryPath))
            return;

        string[] lines;

        try
        {
            lines = File.ReadLines(HistoryPath, Encoding.UTF8)
                .TakeLast(80)
                .Reverse()
                .ToArray();
        }
        catch
        {
            return;
        }

        _historyList.BeginUpdate();
        _historyList.Items.Clear();

        foreach (var line in lines)
        {
            try
            {
                var record = JsonNode.Parse(line)?.AsObject();
                if (record is null)
                    continue;

                var timestamp = record["timestamp"]?.GetValue<DateTimeOffset?>()
                    ?.ToLocalTime().ToString("HH:mm:ss") ?? "--:--:--";
                var tool = record["tool"]?.GetValue<string>() ?? "unknown";
                var kind = record["kind"]?.GetValue<string>() ?? "";
                var path = record["path"]?.GetValue<string>();
                var detail = string.IsNullOrWhiteSpace(path)
                    ? kind
                    : Path.GetFileName(path);

                _historyList.Items.Add(
                    $"{timestamp}  {tool,-38}  {detail}"
                );
            }
            catch
            {
            }
        }

        _historyList.EndUpdate();
    }

    private void RefreshWorkspaces()
    {
        _workspaceList.BeginUpdate();
        _workspaceList.Items.Clear();

        try
        {
            if (File.Exists(WorkspacesPath))
            {
                var json = File.ReadAllText(WorkspacesPath, Encoding.UTF8);
                var workspaces = JsonSerializer.Deserialize<Dictionary<string, string>>(json)
                    ?? new Dictionary<string, string>();

                foreach (var item in workspaces.OrderBy(x => x.Key))
                {
                    _workspaceList.Items.Add(
                        $"{(Directory.Exists(item.Value) ? "🟢" : "🔴")} " +
                        $"{item.Key} — {item.Value}"
                    );
                }
            }
        }
        catch (Exception error)
        {
            _workspaceList.Items.Add("Ошибка: " + error.Message);
        }

        _workspaceList.EndUpdate();
    }

    private static DashboardState ReadState()
    {
        if (!File.Exists(StatePath))
            return new DashboardState();

        try
        {
            var json = File.ReadAllText(StatePath, Encoding.UTF8);
            return JsonSerializer.Deserialize<DashboardState>(json)
                ?? new DashboardState();
        }
        catch
        {
            return new DashboardState();
        }
    }

    private static bool IsProcessAlive(int processId)
    {
        if (processId <= 0)
            return false;

        try
        {
            using var process = Process.GetProcessById(processId);
            return !process.HasExited;
        }
        catch
        {
            return false;
        }
    }

    private static GroupBox CreateGroup(string text)
    {
        return new GroupBox
        {
            Text = text,
            Dock = DockStyle.Top,
            AutoSize = true,
            Padding = new Padding(10),
            Margin = new Padding(0, 0, 0, 10)
        };
    }

    private static TableLayoutPanel CreateGrid(int columns)
    {
        var grid = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = columns,
            AutoSize = true
        };

        if (columns == 2)
        {
            grid.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            grid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        }
        else
        {
            grid.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            grid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
            grid.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            grid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
        }

        return grid;
    }

    private static Label AddRow(TableLayoutPanel panel, int row, string caption)
    {
        return AddCell(panel, 0, row, caption);
    }

    private static Label AddCell(
        TableLayoutPanel panel,
        int column,
        int row,
        string caption
    )
    {
        while (panel.RowStyles.Count <= row)
            panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));

        panel.Controls.Add(new Label
        {
            Text = caption,
            AutoSize = true,
            ForeColor = Color.FromArgb(165, 165, 165),
            Margin = new Padding(column == 0 ? 0 : 16, 3, 8, 3)
        }, column, row);

        var value = new Label
        {
            Text = "—",
            AutoSize = true,
            MaximumSize = new Size(520, 0),
            Margin = new Padding(0, 3, 0, 3)
        };

        panel.Controls.Add(value, column + 1, row);
        return value;
    }

    private static void ApplyDarkTheme(Control root)
    {
        root.BackColor = Color.FromArgb(30, 30, 30);
        root.ForeColor = Color.FromArgb(220, 220, 220);

        foreach (Control child in root.Controls)
        {
            child.BackColor = child switch
            {
                TextBoxBase => Color.FromArgb(24, 24, 24),
                ListBox => Color.FromArgb(24, 24, 24),
                Button => Color.FromArgb(55, 55, 58),
                _ => Color.FromArgb(30, 30, 30)
            };
            child.ForeColor = Color.FromArgb(220, 220, 220);

            if (child is Button button)
            {
                button.FlatStyle = FlatStyle.Flat;
                button.FlatAppearance.BorderColor = Color.FromArgb(75, 75, 78);
            }

            ApplyDarkTheme(child);
        }
    }

    private static string FormatMilliseconds(long value)
    {
        return value < 1000
            ? $"{value:N0} ms"
            : $"{value / 1000d:0.0} s";
    }

    private static string FormatBytes(long value)
    {
        const double megabyte = 1024d * 1024d;
        return $"{value / megabyte:0.0} MB";
    }

    private Point ValidateLocation(DashboardSettings settings)
    {
        var proposed = new Rectangle(
            settings.X,
            settings.Y,
            Math.Max(settings.Width, MinimumSize.Width),
            Math.Max(settings.Height, MinimumSize.Height)
        );

        if (Screen.AllScreens.Any(screen =>
                screen.WorkingArea.IntersectsWith(proposed)))
        {
            return new Point(settings.X, settings.Y);
        }

        var area = Screen.PrimaryScreen?.WorkingArea
            ?? new Rectangle(0, 0, 1920, 1080);

        return new Point(
            Math.Max(area.Left, area.Right - settings.Width - 30),
            area.Top + 30
        );
    }

    private static DashboardSettings LoadSettings()
    {
        try
        {
            if (File.Exists(SettingsPath))
            {
                var json = File.ReadAllText(SettingsPath, Encoding.UTF8);
                return JsonSerializer.Deserialize<DashboardSettings>(json)
                    ?? DashboardSettings.Default();
            }
        }
        catch
        {
        }

        return DashboardSettings.Default();
    }

    private void SaveSettings()
    {
        if (WindowState != FormWindowState.Normal)
            return;

        try
        {
            Directory.CreateDirectory(DataDirectory);

            var settings = new DashboardSettings
            {
                X = Left,
                Y = Top,
                Width = Width,
                Height = Height,
                AlwaysOnTop = _alwaysOnTop.Checked
            };

            var json = JsonSerializer.Serialize(
                settings,
                new JsonSerializerOptions { WriteIndented = true }
            );

            File.WriteAllText(SettingsPath, json, new UTF8Encoding(false));
        }
        catch
        {
        }
    }
}

sealed class DashboardState
{
    public string HostVersion { get; set; } = "0.18.5";
    public int HostProcessId { get; set; }
    public string Status { get; set; } = "idle";
    public string? Tool { get; set; }
    public string? RequestId { get; set; }
    public string? Summary { get; set; }
    public string? Error { get; set; }
    public long TotalCommands { get; set; }
    public long SuccessfulCommands { get; set; }
    public long FailedCommands { get; set; }
    public long LastDurationMilliseconds { get; set; }
    public DateTimeOffset? OperationStartedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

sealed class DashboardSettings
{
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public bool AlwaysOnTop { get; set; }

    public static DashboardSettings Default()
    {
        var area = Screen.PrimaryScreen?.WorkingArea
            ?? new Rectangle(0, 0, 1920, 1080);

        const int width = 500;
        const int height = 780;

        return new DashboardSettings
        {
            X = Math.Max(area.Left, area.Right - width - 30),
            Y = area.Top + 30,
            Width = width,
            Height = height,
            AlwaysOnTop = true
        };
    }
}
