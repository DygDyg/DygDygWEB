using System.Drawing;
using System.Windows.Forms;

static class PatchPreviewDialog
{
    private const int MaxPreviewChars = 300000;
    private const int MaxColorizedChars = 120000;
    private const int LargeChangeLines = 200;
    private const int ApplyDelayMilliseconds = 800;
    private const int AutoConfirmSeconds = 5;

    public static void Confirm(
        string path,
        string patch,
        string beforeText,
        string afterText
    )
    {
        var normalizedPatch = Normalize(patch);
        var normalizedBefore = Normalize(beforeText);
        var normalizedAfter = Normalize(afterText);
        var statistics = CountChanges(normalizedPatch);
        var totalChangedLines = statistics.Added + statistics.Removed;

        var diffPreview = PreparePreview(normalizedPatch, "diff");
        var beforePreview = PreparePreview(normalizedBefore, "исходного файла");
        var afterPreview = PreparePreview(normalizedAfter, "итогового файла");

        using var form = new Form
        {
            Text = "ChatGPT Browser Bridge — Предпросмотр патча",
            Width = 1180,
            Height = 820,
            MinimumSize = new Size(780, 520),
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
            Text = "Проверьте изменения перед применением"
        });

        header.Controls.Add(new Label
        {
            AutoSize = true,
            MaximumSize = new Size(1120, 0),
            Padding = new Padding(0, 5, 0, 0),
            Text = path
        });

        header.Controls.Add(new Label
        {
            AutoSize = true,
            Padding = new Padding(0, 5, 0, 0),
            Text = $"Добавлено строк: {statistics.Added:N0}    " +
                   $"Удалено строк: {statistics.Removed:N0}    " +
                   $"Блоков: {statistics.Hunks:N0}    " +
                   $"Строк diff: {statistics.TotalLines:N0}    " +
                   $"До: {normalizedBefore.Length:N0} символов    " +
                   $"После: {normalizedAfter.Length:N0} символов"
        });

        if (totalChangedLines >= LargeChangeLines ||
            diffPreview.Truncated ||
            beforePreview.Truncated ||
            afterPreview.Truncated)
        {
            header.Controls.Add(new Label
            {
                AutoSize = true,
                MaximumSize = new Size(1120, 0),
                Margin = new Padding(0, 8, 0, 0),
                Padding = new Padding(8, 6, 8, 6),
                BackColor = Color.FromArgb(255, 243, 205),
                ForeColor = Color.FromArgb(102, 77, 3),
                Text = diffPreview.Truncated || beforePreview.Truncated || afterPreview.Truncated
                    ? "⚠ Один или несколько предпросмотров обрезаны. При подтверждении будет записан полный итоговый файл."
                    : $"⚠ Крупное изменение: затронуто {totalChangedLines:N0} строк. Проверьте вкладки особенно внимательно."
            });
        }

        var tabs = new TabControl
        {
            Dock = DockStyle.Fill,
            Padding = new Point(12, 5)
        };

        var diffBox = CreateTextBox(diffPreview.Text);
        if (!diffPreview.Truncated && diffPreview.Text.Length <= MaxColorizedChars)
            ColorizeDiff(diffBox);

        var beforeBox = CreateTextBox(beforePreview.Text);
        var afterBox = CreateTextBox(afterPreview.Text);

        tabs.TabPages.Add(CreateTab("Diff", diffBox));
        tabs.TabPages.Add(CreateTab("До", beforeBox));
        tabs.TabPages.Add(CreateTab("После", afterBox));

        var tabsContainer = new Panel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(12, 0, 12, 8)
        };
        tabsContainer.Controls.Add(tabs);

        var buttons = new FlowLayoutPanel
        {
            Dock = DockStyle.Bottom,
            Height = 58,
            FlowDirection = FlowDirection.RightToLeft,
            WrapContents = false,
            Padding = new Padding(12, 8, 12, 8)
        };

        var applyButton = new Button
        {
            Text = "Подождите…",
            AutoSize = true,
            Enabled = false,
            DialogResult = DialogResult.None,
            Padding = new Padding(10, 3, 10, 3)
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

        var cancelButton = new Button
        {
            Text = "Отмена",
            AutoSize = true,
            DialogResult = DialogResult.Cancel,
            Padding = new Padding(10, 3, 10, 3)
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

        form.Controls.Add(tabsContainer);
        form.Controls.Add(header);
        form.Controls.Add(buttons);
        form.CancelButton = cancelButton;

        BridgeTheme.Apply(form);
        BridgeTheme.StylePrimaryButton(applyButton);
        BridgeTheme.StyleButton(cancelButton, false);
        BridgeTheme.StyleTabControl(tabs);

        using var enableTimer = new System.Windows.Forms.Timer
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
            applyButton.Text = "Применить патч";
        }

        void StartAutoConfirm()
        {
            StopAutoConfirm();
            if (!autoConfirmCheckBox.Checked || !applyButton.Enabled)
                return;

            autoConfirmRemaining = AutoConfirmSeconds;
            autoConfirmStatus.Text = $"Автоприменение через {autoConfirmRemaining} с";
            applyButton.Text = $"Применить патч ({autoConfirmRemaining})";
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
            applyButton.Text = $"Применить патч ({autoConfirmRemaining})";
        };

        autoConfirmCheckBox.CheckedChanged += (_, _) =>
        {
            PreviewAutoConfirmSettings.Enabled = autoConfirmCheckBox.Checked;
            if (autoConfirmCheckBox.Checked)
                StartAutoConfirm();
            else
                StopAutoConfirm();
        };

        enableTimer.Tick += (_, _) =>
        {
            enableTimer.Stop();
            applyButton.Enabled = true;
            applyButton.Text = "Применить патч";
            form.AcceptButton = applyButton;
            StartAutoConfirm();
        };

        form.Shown += (_, _) =>
        {
            ResetTextBoxPosition(diffBox);
            ResetTextBoxPosition(beforeBox);
            ResetTextBoxPosition(afterBox);
            cancelButton.Focus();
            enableTimer.Start();
        };

        form.FormClosing += (_, _) =>
        {
            enableTimer.Stop();
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

    private static RichTextBox CreateTextBox(string text)
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
            Text = text,
            BackColor = BridgeTheme.Background,
            ForeColor = BridgeTheme.Text,
            ScrollBars = RichTextBoxScrollBars.Both
        };
    }

    private static void ResetTextBoxPosition(RichTextBox box)
    {
        box.SelectionStart = 0;
        box.SelectionLength = 0;
        box.ScrollToCaret();
    }

    private static PreviewText PreparePreview(string text, string description)
    {
        if (text.Length <= MaxPreviewChars)
            return new PreviewText(text, false);

        return new PreviewText(
            text[..MaxPreviewChars] +
            $"\n\n--- ПРЕДПРОСМОТР {description.ToUpperInvariant()} ОБРЕЗАН ---\n" +
            $"Полный размер: {text.Length:N0} символов.",
            true
        );
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
        var lines = patch.Split('\n');

        foreach (var line in lines)
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

        return new PatchStatistics(added, removed, hunks, lines.Length);
    }

    private static string Normalize(string value)
    {
        return value
            .Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace("\r", "\n", StringComparison.Ordinal);
    }

    private readonly record struct PreviewText(string Text, bool Truncated);

    private readonly record struct PatchStatistics(
        int Added,
        int Removed,
        int Hunks,
        int TotalLines
    );
}
