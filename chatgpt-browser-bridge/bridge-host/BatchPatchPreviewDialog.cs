using System.Drawing;
using System.Windows.Forms;

static class BatchPatchPreviewDialog
{
    private const int MaxPreviewChars = 300000;
    private const int MaxColorizedChars = 120000;
    private const int ApplyDelayMilliseconds = 1000;
    private const int AutoConfirmSeconds = 5;

    public static void Confirm(
        IReadOnlyList<BatchPatchTool.PreparedPatch> files
    )
    {
        if (files.Count == 0)
            throw new InvalidOperationException("Нет файлов для предпросмотра");

        using var form = new Form
        {
            Text = "ChatGPT Browser Bridge — Пакетный патч",
            Width = 1320,
            Height = 860,
            MinimumSize = new Size(900, 580),
            StartPosition = FormStartPosition.CenterScreen,
            FormBorderStyle = FormBorderStyle.Sizable,
            MaximizeBox = true,
            MinimizeBox = false,
            ShowInTaskbar = true
        };

        var header = new TableLayoutPanel
        {
            Dock = DockStyle.Top,
            AutoSize = true,
            AutoSizeMode = AutoSizeMode.GrowAndShrink,
            ColumnCount = 1,
            Padding = new Padding(12, 10, 12, 8)
        };

        header.Controls.Add(new Label
        {
            AutoSize = true,
            Font = new Font(
                SystemFonts.MessageBoxFont ?? Control.DefaultFont,
                FontStyle.Bold
            ),
            Text = "Проверьте пакет изменений перед применением"
        });

        var totals = files
            .Select(file => CountChanges(file.Patch))
            .Aggregate(
                new PatchStatistics(0, 0, 0),
                (sum, item) => new PatchStatistics(
                    sum.Added + item.Added,
                    sum.Removed + item.Removed,
                    sum.Hunks + item.Hunks
                )
            );

        header.Controls.Add(new Label
        {
            AutoSize = true,
            Padding = new Padding(0, 5, 0, 0),
            Text = $"Файлов: {files.Count:N0}    " +
                   $"Добавлено строк: {totals.Added:N0}    " +
                   $"Удалено строк: {totals.Removed:N0}    " +
                   $"Блоков: {totals.Hunks:N0}"
        });

        var split = new SplitContainer
        {
            Dock = DockStyle.Fill,
            Orientation = Orientation.Vertical,
            Padding = new Padding(12, 0, 12, 8)
        };

        var fileList = new ListBox
        {
            Dock = DockStyle.Fill,
            IntegralHeight = false,
            HorizontalScrollbar = true,
            Font = new Font(
                SystemFonts.MessageBoxFont ?? Control.DefaultFont,
                FontStyle.Regular
            )
        };

        foreach (var file in files)
            fileList.Items.Add(new FileListItem(file));

        split.Panel1.Padding = new Padding(0, 0, 8, 0);
        split.Panel1.Controls.Add(fileList);

        var tabs = new TabControl
        {
            Dock = DockStyle.Fill,
            Padding = new Point(12, 5)
        };

        var diffBox = CreateTextBox();
        var beforeBox = CreateTextBox();
        var afterBox = CreateTextBox();

        tabs.TabPages.Add(CreateTab("Diff", diffBox));
        tabs.TabPages.Add(CreateTab("До", beforeBox));
        tabs.TabPages.Add(CreateTab("После", afterBox));

        split.Panel2.Controls.Add(tabs);

        var selectedPath = new Label
        {
            Dock = DockStyle.Top,
            AutoEllipsis = true,
            Height = 28,
            Padding = new Padding(2, 5, 2, 2),
            Font = new Font(SystemFonts.MessageBoxFont, FontStyle.Bold)
        };
        split.Panel2.Controls.Add(selectedPath);
        selectedPath.BringToFront();

        void ShowFile(BatchPatchTool.PreparedPatch file)
        {
            selectedPath.Text = file.Path;
            selectedPath.Tag = file.Path;

            SetPreview(diffBox, file.Patch, true, "diff");
            SetPreview(beforeBox, file.OldText, false, "исходного файла");
            SetPreview(afterBox, file.NewText, false, "итогового файла");
        }

        fileList.SelectedIndexChanged += (_, _) =>
        {
            if (fileList.SelectedItem is FileListItem item)
                ShowFile(item.File);
        };

        var buttons = new FlowLayoutPanel
        {
            Dock = DockStyle.Bottom,
            Height = 60,
            FlowDirection = FlowDirection.RightToLeft,
            WrapContents = false,
            Padding = new Padding(12, 9, 12, 9)
        };

        var applyButton = new Button
        {
            Text = "Подождите…",
            AutoSize = true,
            Enabled = false,
            DialogResult = DialogResult.None,
            Padding = new Padding(12, 4, 12, 4)
        };

        var cancelButton = new Button
        {
            Text = "Отмена",
            AutoSize = true,
            DialogResult = DialogResult.Cancel,
            Padding = new Padding(12, 4, 12, 4)
        };

        var autoConfirmCheckBox = new CheckBox
        {
            Text = "Автоприменение",
            AutoSize = true,
            Checked = PreviewAutoConfirmSettings.Enabled,
            Margin = new Padding(14, 8, 4, 0)
        };

        var autoConfirmStatus = new Label
        {
            Text = "",
            AutoSize = true,
            Margin = new Padding(4, 9, 10, 0),
            ForeColor = BridgeTheme.MutedText
        };

        applyButton.Click += (_, _) =>
        {
            form.DialogResult = DialogResult.OK;
            form.Close();
        };

        buttons.Controls.Add(applyButton);
        buttons.Controls.Add(cancelButton);
        buttons.Controls.Add(autoConfirmStatus);
        buttons.Controls.Add(autoConfirmCheckBox);

        form.Controls.Add(split);
        form.Controls.Add(header);
        form.Controls.Add(buttons);
        form.CancelButton = cancelButton;

        BridgeTheme.Apply(form);
        BridgeTheme.StylePrimaryButton(applyButton);
        BridgeTheme.StyleButton(cancelButton, false);
        BridgeTheme.StyleTabControl(tabs);

        using var timer = new System.Windows.Forms.Timer
        {
            Interval = ApplyDelayMilliseconds
        };

        var autoConfirmRemaining = AutoConfirmSeconds;
        using var autoConfirmTimer = new System.Windows.Forms.Timer
        {
            Interval = 1000
        };

        void StopAutoConfirm()
        {
            autoConfirmTimer.Stop();
            autoConfirmStatus.Text = "";
            applyButton.Text = $"Применить пакет ({files.Count})";
        }

        void StartAutoConfirm()
        {
            StopAutoConfirm();
            if (!autoConfirmCheckBox.Checked || !applyButton.Enabled)
                return;

            autoConfirmRemaining = AutoConfirmSeconds;
            autoConfirmStatus.Text = $"Автоприменение через {autoConfirmRemaining} с";
            applyButton.Text = $"Применить пакет ({files.Count}) · {autoConfirmRemaining}";
            autoConfirmTimer.Start();
        }

        autoConfirmTimer.Tick += (_, _) =>
        {
            autoConfirmRemaining--;
            if (autoConfirmRemaining <= 0)
            {
                autoConfirmTimer.Stop();
                form.DialogResult = DialogResult.OK;
                form.Close();
                return;
            }

            autoConfirmStatus.Text = $"Автоприменение через {autoConfirmRemaining} с";
            applyButton.Text = $"Применить пакет ({files.Count}) · {autoConfirmRemaining}";
        };

        autoConfirmCheckBox.CheckedChanged += (_, _) =>
        {
            PreviewAutoConfirmSettings.Enabled = autoConfirmCheckBox.Checked;
            if (autoConfirmCheckBox.Checked)
                StartAutoConfirm();
            else
                StopAutoConfirm();
        };

        timer.Tick += (_, _) =>
        {
            timer.Stop();
            applyButton.Enabled = true;
            applyButton.Text = $"Применить пакет ({files.Count})";
            form.AcceptButton = applyButton;
            StartAutoConfirm();
        };

        form.Shown += (_, _) =>
        {
            form.PerformLayout();

            var availableWidth = Math.Max(1, split.ClientSize.Width);
            var panel1Minimum = Math.Min(220, Math.Max(1, availableWidth / 3));
            var panel2Minimum = Math.Min(450, Math.Max(1, availableWidth - panel1Minimum - split.SplitterWidth));

            split.Panel1MinSize = panel1Minimum;
            split.Panel2MinSize = panel2Minimum;

            var preferredDistance = Math.Min(
                330,
                Math.Max(panel1Minimum, availableWidth - panel2Minimum - split.SplitterWidth)
            );
            split.SplitterDistance = preferredDistance;

            fileList.SelectedIndex = 0;
            cancelButton.Focus();
            timer.Start();
        };

        form.FormClosing += (_, _) =>
        {
            timer.Stop();
            autoConfirmTimer.Stop();
        };

        if (form.ShowDialog() != DialogResult.OK)
            throw new OperationCanceledException("Операция отменена пользователем");
    }

    private static TabPage CreateTab(string title, Control content)
    {
        var page = new TabPage(title)
        {
            Padding = new Padding(6)
        };
        page.Controls.Add(content);
        return page;
    }

    private static RichTextBox CreateTextBox()
    {
        return new RichTextBox
        {
            Dock = DockStyle.Fill,
            ReadOnly = true,
            WordWrap = false,
            DetectUrls = false,
            HideSelection = false,
            BorderStyle = BorderStyle.None,
            Font = new Font(FontFamily.GenericMonospace, 10f),
            BackColor = BridgeTheme.Background,
            ForeColor = BridgeTheme.Text,
            ScrollBars = RichTextBoxScrollBars.Both
        };
    }

    private static void SetPreview(
        RichTextBox box,
        string source,
        bool colorize,
        string description
    )
    {
        var normalized = Normalize(source);
        var truncated = normalized.Length > MaxPreviewChars;

        box.Text = truncated
            ? normalized[..MaxPreviewChars] +
              $"\n\n--- ПРЕДПРОСМОТР {description.ToUpperInvariant()} ОБРЕЗАН ---\n" +
              $"Полный размер: {normalized.Length:N0} символов."
            : normalized;

        BridgeTheme.ResetEditor(box);

        if (colorize && !truncated && box.Text.Length <= MaxColorizedChars)
            ColorizeDiff(box);

        box.SelectionStart = 0;
        box.SelectionLength = 0;
        box.ScrollToCaret();
    }

    private static void ColorizeDiff(RichTextBox box)
    {
        var position = 0;
        box.SuspendLayout();

        try
        {
            foreach (var line in box.Text.Split('\n'))
            {
                var length = line.Length;
                var background = SystemColors.Window;
                var foreground = SystemColors.WindowText;
                var style = FontStyle.Regular;

                if (line.StartsWith("@@", StringComparison.Ordinal))
                {
                    background = BridgeTheme.HunkBackground;
                    foreground = BridgeTheme.HunkText;
                    style = FontStyle.Bold;
                }
                else if (line.StartsWith("+++", StringComparison.Ordinal) ||
                         line.StartsWith("---", StringComparison.Ordinal))
                {
                    background = BridgeTheme.HeaderBackground;
                    foreground = BridgeTheme.HeaderText;
                    style = FontStyle.Bold;
                }
                else if (line.StartsWith("+", StringComparison.Ordinal))
                {
                    background = BridgeTheme.AddedBackground;
                    foreground = BridgeTheme.AddedText;
                }
                else if (line.StartsWith("-", StringComparison.Ordinal))
                {
                    background = BridgeTheme.RemovedBackground;
                    foreground = BridgeTheme.RemovedText;
                }

                box.Select(position, length);
                box.SelectionBackColor = background;
                box.SelectionColor = foreground;
                box.SelectionFont = new Font(box.Font, style);
                position += length + 1;
            }
        }
        finally
        {
            box.Select(0, 0);
            box.ResumeLayout();
        }
    }

    private static PatchStatistics CountChanges(string patch)
    {
        var added = 0;
        var removed = 0;
        var hunks = 0;

        foreach (var line in Normalize(patch).Split('\n'))
        {
            if (line.StartsWith("@@", StringComparison.Ordinal))
            {
                hunks++;
                continue;
            }

            if (line.StartsWith("+++", StringComparison.Ordinal) ||
                line.StartsWith("---", StringComparison.Ordinal))
                continue;

            if (line.StartsWith("+", StringComparison.Ordinal))
                added++;
            else if (line.StartsWith("-", StringComparison.Ordinal))
                removed++;
        }

        return new PatchStatistics(added, removed, hunks);
    }

    private static string Normalize(string value)
    {
        return value
            .Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace("\r", "\n", StringComparison.Ordinal);
    }

    private sealed class FileListItem
    {
        public FileListItem(BatchPatchTool.PreparedPatch file)
        {
            File = file;
        }

        public BatchPatchTool.PreparedPatch File { get; }

        public override string ToString()
        {
            return Path.GetFileName(File.Path) + "  —  " + File.Path;
        }
    }

    private readonly record struct PatchStatistics(
        int Added,
        int Removed,
        int Hunks
    );
}
