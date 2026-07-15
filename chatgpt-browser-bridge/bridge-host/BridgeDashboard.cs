using System.Diagnostics;
using System.Drawing;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Windows.Forms;

static class BridgeStateStore
{
    private const int MaximumHistoryItems = 200;
    private static readonly object Sync = new();
    private static readonly List<BridgeOperationEntry> History = new();
    private static readonly DateTimeOffset HostStartedAt = DateTimeOffset.UtcNow;
    private static DateTimeOffset? _operationStartedAt;
    private static long _totalCommands;
    private static long _successfulCommands;
    private static long _failedCommands;

    private static BridgeState _state = new(
        "idle",
        null,
        null,
        null,
        null,
        DateTimeOffset.UtcNow
    );

    public static event Action<BridgeState>? Changed;
    public static event Action? HistoryChanged;

    public static BridgeState Snapshot()
    {
        lock (Sync)
            return _state;
    }

    public static IReadOnlyList<BridgeOperationEntry> HistorySnapshot()
    {
        lock (Sync)
            return History.ToArray();
    }

    public static BridgeRuntimeSnapshot RuntimeSnapshot()
    {
        lock (Sync)
        {
            var now = DateTimeOffset.UtcNow;
            var currentDuration = _operationStartedAt.HasValue
                ? Math.Max(
                    0,
                    (long)(now - _operationStartedAt.Value).TotalMilliseconds
                )
                : 0;

            return new BridgeRuntimeSnapshot(
                HostStartedAt,
                now - HostStartedAt,
                _totalCommands,
                _successfulCommands,
                _failedCommands,
                _operationStartedAt.HasValue,
                currentDuration
            );
        }
    }

    public static void MarkRunning(JsonObject request)
    {
        lock (Sync)
        {
            _operationStartedAt = DateTimeOffset.UtcNow;
            _totalCommands++;
        }

        Update(new BridgeState(
            "running",
            request["tool"]?.GetValue<string>(),
            request["id"]?.GetValue<string>(),
            null,
            null,
            DateTimeOffset.UtcNow
        ));
    }

    public static void MarkSuccess(JsonObject request, JsonObject response)
    {
        var completedAt = DateTimeOffset.UtcNow;
        var summary = BuildSummary(response);

        lock (Sync)
            _successfulCommands++;

        Update(new BridgeState(
            "success",
            request["tool"]?.GetValue<string>(),
            request["id"]?.GetValue<string>(),
            summary,
            null,
            completedAt
        ));

        AppendHistory(
            request,
            "success",
            summary,
            null,
            completedAt
        );
    }

    public static void MarkError(JsonObject request, string error)
    {
        var completedAt = DateTimeOffset.UtcNow;

        lock (Sync)
            _failedCommands++;

        Update(new BridgeState(
            "error",
            request["tool"]?.GetValue<string>(),
            request["id"]?.GetValue<string>(),
            null,
            error,
            completedAt
        ));

        AppendHistory(
            request,
            "error",
            null,
            error,
            completedAt
        );
    }

    private static void AppendHistory(
        JsonObject request,
        string status,
        string? summary,
        string? error,
        DateTimeOffset completedAt
    )
    {
        Action? handler;

        lock (Sync)
        {
            var startedAt = _operationStartedAt ?? completedAt;
            var duration = Math.Max(
                0,
                (long)(completedAt - startedAt).TotalMilliseconds
            );

            History.Add(new BridgeOperationEntry(
                completedAt,
                status,
                request["tool"]?.GetValue<string>() ?? "unknown",
                request["id"]?.GetValue<string>(),
                summary,
                error,
                duration
            ));

            if (History.Count > MaximumHistoryItems)
            {
                History.RemoveRange(
                    0,
                    History.Count - MaximumHistoryItems
                );
            }

            _operationStartedAt = null;
            handler = HistoryChanged;
        }

        handler?.Invoke();
    }

    private static void Update(BridgeState state)
    {
        Action<BridgeState>? handler;

        lock (Sync)
        {
            _state = state;
            handler = Changed;
        }

        handler?.Invoke(state);
    }

    private static string BuildSummary(JsonObject response)
    {
        if (response["status"]?.GetValue<string>() == "error")
            return response["error"]?.GetValue<string>() ?? "Ошибка";

        if (response["data"] is not JsonObject data)
            return "Операция завершена";

        if (data["transaction_id"] is not null)
        {
            var count = data["file_count"]?.GetValue<int>() ?? 0;
            return $"Транзакция завершена, файлов: {count}";
        }

        if (data["batch_id"] is not null)
        {
            var count = data["file_count"]?.GetValue<int>() ?? 0;
            return $"Пакет применён, файлов: {count}";
        }

        if (data["read_count"] is not null)
        {
            var read = data["read_count"]?.GetValue<int>() ?? 0;
            var errors = data["error_count"]?.GetValue<int>() ?? 0;
            return $"Прочитано: {read}, ошибок: {errors}";
        }

        return "Операция завершена успешно";
    }
}

sealed record BridgeState(
    string Status,
    string? Tool,
    string? RequestId,
    string? Summary,
    string? Error,
    DateTimeOffset UpdatedAt
);

sealed record BridgeOperationEntry(
    DateTimeOffset CompletedAt,
    string Status,
    string Tool,
    string? RequestId,
    string? Summary,
    string? Error,
    long DurationMilliseconds
);

sealed record BridgeRuntimeSnapshot(
    DateTimeOffset StartedAt,
    TimeSpan Uptime,
    long TotalCommands,
    long SuccessfulCommands,
    long FailedCommands,
    bool IsBusy,
    long CurrentDurationMilliseconds
);

static class DashboardHost
{
    private static readonly object Sync = new();
    private static readonly ManualResetEventSlim Started = new(false);

    private static readonly string StartupLogPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "ChatGPTBrowserBridge",
        "NativeHost",
        "dashboard-startup.log"
    );

    private static readonly string LifecycleLogPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "ChatGPTBrowserBridge",
        "NativeHost",
        "dashboard-lifecycle.log"
    );

    private static Thread? _thread;
    private static DashboardForm? _form;
    private static string? _startupError;

    public static JsonObject Open(JsonObject request)
    {
        LogLifecycle("dashboard.open requested");

        EnsureStarted();

        var startedInTime = Started.Wait(TimeSpan.FromSeconds(3));

        DashboardForm? form;
        string? startupError;

        lock (Sync)
        {
            form = _form;
            startupError = _startupError;
        }

        if (form is not null &&
            !form.IsDisposed &&
            form.IsHandleCreated)
        {
            form.BeginInvoke(() =>
            {
                if (form.IsDisposed)
                    return;

                if (form.WindowState == FormWindowState.Minimized)
                    form.WindowState = FormWindowState.Normal;

                form.Show();
                form.BringToFront();
                form.Activate();
            });
        }

        return Result.Ok(request, new JsonObject
        {
            ["opened"] = form is not null &&
                         !form.IsDisposed &&
                         form.IsHandleCreated,
            ["running"] = form is not null &&
                          !form.IsDisposed &&
                          form.IsHandleCreated,
            ["started_in_time"] = startedInTime,
            ["startup_error"] = startupError,
            ["startup_log_path"] = StartupLogPath,
            ["lifecycle_log_path"] = LifecycleLogPath
        });
    }

    public static JsonObject Status(JsonObject request)
    {
        DashboardForm? form;
        string? startupError;

        lock (Sync)
        {
            form = _form;
            startupError = _startupError;
        }

        var state = BridgeStateStore.Snapshot();

        return Result.Ok(request, new JsonObject
        {
            ["running"] = form is not null &&
                          !form.IsDisposed &&
                          form.IsHandleCreated,
            ["startup_error"] = startupError,
            ["startup_log_path"] = StartupLogPath,
            ["lifecycle_log_path"] = LifecycleLogPath,
            ["state"] = new JsonObject
            {
                ["status"] = state.Status,
                ["tool"] = state.Tool,
                ["request_id"] = state.RequestId,
                ["summary"] = state.Summary,
                ["error"] = state.Error,
                ["updated_at"] = state.UpdatedAt.ToString("O")
            }
        });
    }

    private static void EnsureStarted()
    {
        lock (Sync)
        {
            if (_thread is { IsAlive: true })
                return;

            Started.Reset();
            _startupError = null;

            _thread = new Thread(() =>
            {
                LogLifecycle("UI thread started");

                try
                {
                    Application.EnableVisualStyles();
                    LogLifecycle("Application.EnableVisualStyles completed");

                    var form = new DashboardForm();
                    LogLifecycle("DashboardForm constructed");

                    form.HandleCreated += (_, _) =>
                    {
                        LogLifecycle("HandleCreated");
                        Started.Set();
                    };

                    form.Load += (_, _) =>
                        LogLifecycle("Load");

                    form.Shown += (_, _) =>
                        LogLifecycle("Shown");

                    form.FormClosing += (_, args) =>
                        LogLifecycle(
                            $"FormClosing: reason={args.CloseReason}; cancel={args.Cancel}"
                        );

                    form.FormClosed += (_, args) =>
                        LogLifecycle(
                            $"FormClosed: reason={args.CloseReason}"
                        );

                    lock (Sync)
                        _form = form;

                    LogLifecycle("Application.Run starting");
                    Application.Run(form);
                    LogLifecycle("Application.Run finished");
                }
                catch (Exception error)
                {
                    var details = error.ToString();
                    LogLifecycle("UI thread exception: " + details);

                    lock (Sync)
                        _startupError = details;

                    try
                    {
                        Directory.CreateDirectory(
                            Path.GetDirectoryName(StartupLogPath)!
                        );

                        File.WriteAllText(
                            StartupLogPath,
                            DateTimeOffset.Now.ToString("O") +
                            Environment.NewLine +
                            details,
                            new UTF8Encoding(false)
                        );
                    }
                    catch
                    {
                        // Не заменяем исходную ошибку ошибкой записи лога.
                    }
                }
                finally
                {
                    LogLifecycle("UI thread finally entered");

                    Started.Set();

                    lock (Sync)
                    {
                        _form = null;
                        _thread = null;
                    }

                    LogLifecycle("UI thread finished");
                }
            })
            {
                IsBackground = true,
                Name = "Bridge Dashboard"
            };

            _thread.SetApartmentState(ApartmentState.STA);
            _thread.Start();
            LogLifecycle("UI thread start requested");
        }
    }

    private static void LogLifecycle(string message)
    {
        try
        {
            Directory.CreateDirectory(
                Path.GetDirectoryName(LifecycleLogPath)!
            );

            File.AppendAllText(
                LifecycleLogPath,
                DateTimeOffset.Now.ToString("O") +
                " [process " + Environment.ProcessId + "]" +
                " [thread " + Environment.CurrentManagedThreadId + "] " +
                message +
                Environment.NewLine,
                new UTF8Encoding(false)
            );
        }
        catch
        {
            // Диагностика не должна ломать запуск Dashboard.
        }
    }
}

sealed class DashboardForm : Form
{
    private const string HostVersion = "0.18.4";

    private readonly Label _statusValue;
    private readonly Label _toolValue;
    private readonly Label _requestValue;
    private readonly Label _summaryValue;
    private readonly Label _updatedValue;
    private readonly Label _uptimeValue;
    private readonly Label _commandsValue;
    private readonly Label _successValue;
    private readonly Label _errorsValue;
    private readonly Label _busyValue;
    private readonly Label _currentDurationValue;
    private readonly Label _memoryValue;
    private readonly Label _threadsValue;
    private readonly Label _handlesValue;
    private readonly ListBox _historyList;
    private readonly ListBox _workspaceList;
    private readonly CheckBox _alwaysOnTop;
    private readonly System.Windows.Forms.Timer _runtimeTimer;

    public DashboardForm()
    {
        var settings = DashboardSettings.Load();

        Text = "ChatGPT Browser Bridge Dashboard";
        Width = settings.Width;
        Height = settings.Height;
        MinimumSize = new Size(380, 520);
        StartPosition = FormStartPosition.Manual;
        Location = new Point(settings.X, settings.Y);
        TopMost = settings.AlwaysOnTop;
        ShowInTaskbar = true;
        FormBorderStyle = FormBorderStyle.Sizable;
        MaximizeBox = true;
        MinimizeBox = true;

        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 6,
            Padding = new Padding(14),
            AutoScroll = true
        };

        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 58));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 42));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));

        var header = new TableLayoutPanel
        {
            Dock = DockStyle.Top,
            ColumnCount = 2,
            AutoSize = true
        };
        header.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        header.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));

        header.Controls.Add(new Label
        {
            Text = "ChatGPT Browser Bridge",
            AutoSize = true,
            Font = new Font(
                (SystemFonts.MessageBoxFont ?? Control.DefaultFont).FontFamily,
                14f,
                FontStyle.Bold
            ),
            Margin = new Padding(0, 0, 8, 8)
        }, 0, 0);

        header.Controls.Add(new Label
        {
            Text = $"Host {HostVersion}",
            AutoSize = true,
            ForeColor = BridgeTheme.MutedText,
            Margin = new Padding(8, 5, 0, 8)
        }, 1, 0);

        var stateGroup = new GroupBox
        {
            Text = "Состояние",
            Dock = DockStyle.Top,
            AutoSize = true,
            Padding = new Padding(10)
        };

        var stateGrid = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            AutoSize = true
        };
        stateGrid.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        stateGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));

        _statusValue = AddRow(stateGrid, 0, "Статус:");
        _toolValue = AddRow(stateGrid, 1, "Команда:");
        _requestValue = AddRow(stateGrid, 2, "Request ID:");
        _summaryValue = AddRow(stateGrid, 3, "Результат:");
        _updatedValue = AddRow(stateGrid, 4, "Обновлено:");

        stateGroup.Controls.Add(stateGrid);

        var runtimeGroup = new GroupBox
        {
            Text = "Native Host",
            Dock = DockStyle.Top,
            AutoSize = true,
            Padding = new Padding(10),
            Margin = new Padding(0, 12, 0, 0)
        };

        var runtimeGrid = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 4,
            AutoSize = true
        };

        runtimeGrid.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        runtimeGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
        runtimeGrid.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        runtimeGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));

        _uptimeValue = AddRuntimeCell(runtimeGrid, 0, 0, "Uptime:");
        _busyValue = AddRuntimeCell(runtimeGrid, 2, 0, "Занят:");
        _commandsValue = AddRuntimeCell(runtimeGrid, 0, 1, "Команд:");
        _currentDurationValue = AddRuntimeCell(runtimeGrid, 2, 1, "Текущая:");
        _successValue = AddRuntimeCell(runtimeGrid, 0, 2, "Успешно:");
        _errorsValue = AddRuntimeCell(runtimeGrid, 2, 2, "Ошибок:");
        _memoryValue = AddRuntimeCell(runtimeGrid, 0, 3, "Память:");
        _threadsValue = AddRuntimeCell(runtimeGrid, 2, 3, "Потоки:");
        _handlesValue = AddRuntimeCell(runtimeGrid, 0, 4, "Handles:");

        runtimeGroup.Controls.Add(runtimeGrid);

        var historyGroup = new GroupBox
        {
            Text = "Последние операции",
            Dock = DockStyle.Fill,
            Padding = new Padding(10),
            Margin = new Padding(0, 12, 0, 0)
        };

        _historyList = new ListBox
        {
            Dock = DockStyle.Fill,
            IntegralHeight = false,
            HorizontalScrollbar = true,
            Font = new Font(FontFamily.GenericMonospace, 9f)
        };

        historyGroup.Controls.Add(_historyList);

        var workspaceGroup = new GroupBox
        {
            Text = "Рабочие пространства",
            Dock = DockStyle.Fill,
            Padding = new Padding(10),
            Margin = new Padding(0, 12, 0, 12)
        };

        _workspaceList = new ListBox
        {
            Dock = DockStyle.Fill,
            IntegralHeight = false,
            HorizontalScrollbar = true
        };
        workspaceGroup.Controls.Add(_workspaceList);

        var buttons = new FlowLayoutPanel
        {
            Dock = DockStyle.Bottom,
            AutoSize = true,
            FlowDirection = FlowDirection.LeftToRight,
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
            Margin = new Padding(12, 8, 4, 0)
        };
        _alwaysOnTop.CheckedChanged += (_, _) =>
        {
            TopMost = _alwaysOnTop.Checked;
            SaveSettings();
        };

        buttons.Controls.Add(refreshButton);
        buttons.Controls.Add(_alwaysOnTop);

        root.Controls.Add(header, 0, 0);
        root.Controls.Add(stateGroup, 0, 1);
        root.Controls.Add(runtimeGroup, 0, 2);
        root.Controls.Add(historyGroup, 0, 3);
        root.Controls.Add(workspaceGroup, 0, 4);
        root.Controls.Add(buttons, 0, 5);
        Controls.Add(root);

        BridgeTheme.Apply(this);
        BridgeTheme.StyleButton(refreshButton, false);

        _runtimeTimer = new System.Windows.Forms.Timer
        {
            Interval = 1000
        };
        _runtimeTimer.Tick += (_, _) => RefreshRuntimeInfo();

        Shown += (_, _) =>
        {
            RefreshAll();
            _runtimeTimer.Start();
        };
        FormClosing += (_, _) => SaveSettings();
        Move += (_, _) => SaveSettings();
        ResizeEnd += (_, _) => SaveSettings();

        BridgeStateStore.Changed += OnStateChanged;
        BridgeStateStore.HistoryChanged += OnHistoryChanged;

        FormClosed += (_, _) =>
        {
            _runtimeTimer.Stop();
            _runtimeTimer.Dispose();
            BridgeStateStore.Changed -= OnStateChanged;
            BridgeStateStore.HistoryChanged -= OnHistoryChanged;
        };
    }

    private static Label AddRuntimeCell(
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
            ForeColor = BridgeTheme.MutedText,
            Margin = new Padding(column == 0 ? 0 : 18, 3, 8, 3)
        }, column, row);

        var value = new Label
        {
            Text = "—",
            AutoSize = true,
            Margin = new Padding(0, 3, 0, 3)
        };

        panel.Controls.Add(value, column + 1, row);
        return value;
    }

    private static Label AddRow(
        TableLayoutPanel panel,
        int row,
        string caption
    )
    {
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));

        panel.Controls.Add(new Label
        {
            Text = caption,
            AutoSize = true,
            ForeColor = BridgeTheme.MutedText,
            Margin = new Padding(0, 4, 12, 4)
        }, 0, row);

        var value = new Label
        {
            Text = "—",
            AutoSize = true,
            MaximumSize = new Size(500, 0),
            Margin = new Padding(0, 4, 0, 4)
        };

        panel.Controls.Add(value, 1, row);
        return value;
    }

    private void OnStateChanged(BridgeState state)
    {
        if (IsDisposed || !IsHandleCreated)
            return;

        if (InvokeRequired)
        {
            BeginInvoke(() => ApplyState(state));
            return;
        }

        ApplyState(state);
    }

    private void OnHistoryChanged()
    {
        if (IsDisposed || !IsHandleCreated)
            return;

        if (InvokeRequired)
        {
            BeginInvoke(RefreshHistory);
            return;
        }

        RefreshHistory();
    }

    private void RefreshAll()
    {
        ApplyState(BridgeStateStore.Snapshot());
        RefreshRuntimeInfo();
        RefreshHistory();

        _workspaceList.BeginUpdate();
        _workspaceList.Items.Clear();

        foreach (var node in WorkspaceStore.DescribeWorkspaces())
        {
            if (node is not JsonObject workspace)
                continue;

            var name = workspace["name"]?.GetValue<string>() ?? "?";
            var path = workspace["path"]?.GetValue<string>() ?? "";
            var exists = workspace["exists"]?.GetValue<bool>() ?? false;

            _workspaceList.Items.Add(
                $"{(exists ? "●" : "○")} {name} — {path}"
            );
        }

        _workspaceList.EndUpdate();
    }

    private void RefreshRuntimeInfo()
    {
        var runtime = BridgeStateStore.RuntimeSnapshot();

        _uptimeValue.Text = FormatDuration(runtime.Uptime);
        _commandsValue.Text = runtime.TotalCommands.ToString("N0");
        _successValue.Text = runtime.SuccessfulCommands.ToString("N0");
        _errorsValue.Text = runtime.FailedCommands.ToString("N0");
        _busyValue.Text = runtime.IsBusy ? "Да" : "Нет";
        _currentDurationValue.Text = runtime.IsBusy
            ? FormatMilliseconds(runtime.CurrentDurationMilliseconds)
            : "—";

        _busyValue.ForeColor = runtime.IsBusy
            ? BridgeTheme.WarningText
            : BridgeTheme.AddedText;

        try
        {
            using var process = Process.GetCurrentProcess();
            process.Refresh();

            _memoryValue.Text = FormatBytes(process.WorkingSet64);
            _threadsValue.Text = process.Threads.Count.ToString("N0");
            _handlesValue.Text = process.HandleCount.ToString("N0");
        }
        catch (Exception error)
        {
            _memoryValue.Text = "Ошибка";
            _threadsValue.Text = "—";
            _handlesValue.Text = "—";
            _memoryValue.Tag = error.Message;
        }
    }

    private static string FormatDuration(TimeSpan value)
    {
        return value.TotalDays >= 1
            ? $"{(int)value.TotalDays}.{value:hh\\:mm\\:ss}"
            : value.ToString(@"hh\:mm\:ss");
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
        const double gigabyte = megabyte * 1024d;

        return value >= gigabyte
            ? $"{value / gigabyte:0.00} GB"
            : $"{value / megabyte:0.0} MB";
    }

    private void RefreshHistory()
    {
        var history = BridgeStateStore.HistorySnapshot();

        _historyList.BeginUpdate();
        _historyList.Items.Clear();

        foreach (var item in history.Reverse())
        {
            var status = item.Status switch
            {
                "success" => "OK ",
                "error" => "ERR",
                _ => "..."
            };

            var duration = item.DurationMilliseconds < 1000
                ? $"{item.DurationMilliseconds,5} ms"
                : $"{item.DurationMilliseconds / 1000d,5:0.0} s ";

            var details = item.Error ?? item.Summary ?? "";

            _historyList.Items.Add(
                $"{item.CompletedAt.ToLocalTime():HH:mm:ss}  " +
                $"{status}  {duration}  " +
                $"{item.Tool}  {details}"
            );
        }

        _historyList.EndUpdate();
    }

    private void ApplyState(BridgeState state)
    {
        _statusValue.Text = state.Status;
        _toolValue.Text = state.Tool ?? "—";
        _requestValue.Text = state.RequestId ?? "—";
        _summaryValue.Text = state.Error ?? state.Summary ?? "—";
        _updatedValue.Text = state.UpdatedAt.ToLocalTime()
            .ToString("yyyy-MM-dd HH:mm:ss");

        _statusValue.ForeColor = state.Status switch
        {
            "running" => BridgeTheme.WarningText,
            "success" => BridgeTheme.AddedText,
            "error" => BridgeTheme.RemovedText,
            _ => BridgeTheme.Text
        };
    }

    private void SaveSettings()
    {
        if (WindowState != FormWindowState.Normal)
            return;

        DashboardSettings.Save(new DashboardSettingsModel
        {
            X = Left,
            Y = Top,
            Width = Width,
            Height = Height,
            AlwaysOnTop = _alwaysOnTop.Checked
        });
    }
}

static class DashboardSettings
{
    private static readonly object Sync = new();

    private static readonly string SettingsPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "ChatGPTBrowserBridge",
        "NativeHost",
        "dashboard.json"
    );

    public static DashboardSettingsModel Load()
    {
        lock (Sync)
        {
            if (!File.Exists(SettingsPath))
                return DashboardSettingsModel.Default();

            try
            {
                var json = File.ReadAllText(SettingsPath, Encoding.UTF8);
                return JsonSerializer.Deserialize<DashboardSettingsModel>(json)
                    ?? DashboardSettingsModel.Default();
            }
            catch
            {
                return DashboardSettingsModel.Default();
            }
        }
    }

    public static void Save(DashboardSettingsModel settings)
    {
        lock (Sync)
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
    }
}

sealed class DashboardSettingsModel
{
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public bool AlwaysOnTop { get; set; }

    public static DashboardSettingsModel Default()
    {
        var area = Screen.PrimaryScreen?.WorkingArea ??
            new Rectangle(0, 0, 1920, 1080);

        const int width = 460;
        const int height = 760;

        return new DashboardSettingsModel
        {
            X = Math.Max(area.Left, area.Right - width - 30),
            Y = area.Top + 30,
            Width = width,
            Height = height,
            AlwaysOnTop = true
        };
    }
}
