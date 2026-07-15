using System.Drawing;
using System.Windows.Forms;

static class BridgeTheme
{
    public static readonly Color Background = Color.FromArgb(30, 30, 30);
    public static readonly Color Panel = Color.FromArgb(37, 37, 38);
    public static readonly Color Surface = Color.FromArgb(45, 45, 48);
    public static readonly Color Border = Color.FromArgb(62, 62, 66);
    public static readonly Color Text = Color.FromArgb(212, 212, 212);
    public static readonly Color MutedText = Color.FromArgb(160, 160, 160);

    public static readonly Color Primary = Color.FromArgb(14, 99, 156);
    public static readonly Color PrimaryHover = Color.FromArgb(17, 119, 187);

    public static readonly Color AddedBackground = Color.FromArgb(23, 54, 31);
    public static readonly Color AddedText = Color.FromArgb(126, 231, 135);
    public static readonly Color RemovedBackground = Color.FromArgb(59, 18, 24);
    public static readonly Color RemovedText = Color.FromArgb(255, 161, 152);
    public static readonly Color HunkBackground = Color.FromArgb(43, 45, 66);
    public static readonly Color HunkText = Color.FromArgb(138, 180, 248);
    public static readonly Color HeaderBackground = Color.FromArgb(48, 54, 61);
    public static readonly Color HeaderText = Color.FromArgb(230, 237, 243);

    public static readonly Color WarningBackground = Color.FromArgb(77, 58, 0);
    public static readonly Color WarningText = Color.FromArgb(255, 216, 102);

    public static void Apply(Form form)
    {
        form.BackColor = Background;
        form.ForeColor = Text;
        ApplyRecursive(form);
    }

    public static void ApplyRecursive(Control root)
    {
        foreach (Control control in root.Controls)
        {
            ApplyControl(control);
            ApplyRecursive(control);
        }
    }

    public static void ApplyControl(Control control)
    {
        switch (control)
        {
            case RichTextBox richTextBox:
                richTextBox.BackColor = Background;
                richTextBox.ForeColor = Text;
                richTextBox.BorderStyle = BorderStyle.FixedSingle;
                break;

            case TextBox textBox:
                textBox.BackColor = Background;
                textBox.ForeColor = Text;
                textBox.BorderStyle = BorderStyle.FixedSingle;
                break;

            case ListBox listBox:
                listBox.BackColor = Background;
                listBox.ForeColor = Text;
                listBox.BorderStyle = BorderStyle.FixedSingle;
                break;

            case Button button:
                StyleButton(button, false);
                break;

            case TabControl tabControl:
                StyleTabControl(tabControl);
                break;

            case TabPage tabPage:
                tabPage.BackColor = Panel;
                tabPage.ForeColor = Text;
                break;

            case SplitContainer splitContainer:
                splitContainer.BackColor = Border;
                splitContainer.Panel1.BackColor = Panel;
                splitContainer.Panel2.BackColor = Panel;
                break;

            case FlowLayoutPanel flowPanel:
                flowPanel.BackColor = Panel;
                flowPanel.ForeColor = Text;
                break;

            case TableLayoutPanel tablePanel:
                tablePanel.BackColor = Panel;
                tablePanel.ForeColor = Text;
                break;

            case Panel panel:
                panel.BackColor = Panel;
                panel.ForeColor = Text;
                break;

            case Label label:
                var hasCustomBackground =
                    label.BackColor != Color.Transparent &&
                    label.BackColor != SystemColors.Control;

                if (!hasCustomBackground)
                {
                    label.BackColor = Panel;
                    label.ForeColor = Text;
                }
                break;

            default:
                control.BackColor = Panel;
                control.ForeColor = Text;
                break;
        }
    }

    public static void StyleTabControl(TabControl tabs)
    {
        tabs.BackColor = Panel;
        tabs.ForeColor = Text;
        tabs.DrawMode = TabDrawMode.OwnerDrawFixed;
        tabs.Appearance = TabAppearance.FlatButtons;
        tabs.SizeMode = TabSizeMode.Fixed;
        tabs.ItemSize = new Size(88, 28);
        tabs.Padding = new Point(10, 4);

        if (tabs.Tag as string == "cbb-dark-tabs")
            return;

        tabs.Tag = "cbb-dark-tabs";
        tabs.DrawItem += (_, args) =>
        {
            var selected = args.Index == tabs.SelectedIndex;
            var bounds = args.Bounds;
            var background = selected ? Surface : Panel;

            using var backgroundBrush = new SolidBrush(background);
            args.Graphics.FillRectangle(backgroundBrush, bounds);

            if (selected)
            {
                using var accentBrush = new SolidBrush(Primary);
                args.Graphics.FillRectangle(
                    accentBrush,
                    bounds.Left,
                    bounds.Bottom - 2,
                    bounds.Width,
                    2
                );
            }

            TextRenderer.DrawText(
                args.Graphics,
                tabs.TabPages[args.Index].Text,
                tabs.Font ?? Control.DefaultFont,
                bounds,
                selected ? Color.White : MutedText,
                TextFormatFlags.HorizontalCenter |
                TextFormatFlags.VerticalCenter |
                TextFormatFlags.EndEllipsis
            );
        };
    }

    public static void StylePrimaryButton(Button button)
    {
        StyleButton(button, true);
    }

    public static void StyleButton(Button button, bool primary)
    {
        button.UseVisualStyleBackColor = false;
        button.FlatStyle = FlatStyle.Flat;
        button.FlatAppearance.BorderSize = 1;
        button.FlatAppearance.BorderColor = primary ? PrimaryHover : Border;
        button.FlatAppearance.MouseOverBackColor = primary ? PrimaryHover : Color.FromArgb(60, 60, 60);
        button.FlatAppearance.MouseDownBackColor = primary ? Color.FromArgb(10, 80, 130) : Color.FromArgb(70, 70, 70);
        button.BackColor = primary ? Primary : Surface;
        button.ForeColor = Color.White;
    }

    public static void StyleWarning(Label label)
    {
        label.BackColor = WarningBackground;
        label.ForeColor = WarningText;
    }

    public static void ResetEditor(RichTextBox box)
    {
        box.SelectAll();
        box.SelectionBackColor = Background;
        box.SelectionColor = Text;
        box.SelectionFont = new Font(box.Font, FontStyle.Regular);
        box.Select(0, 0);
    }
}
