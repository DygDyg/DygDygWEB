using System.Text.RegularExpressions;

static class UnifiedPatch
{
    public static string Apply(string original, string patch)
    {
        var lines = Normalize(original).Split('\n').ToList();
        var patchLines = Normalize(patch).Split('\n');
        var patchIndex = 0;
        var offset = 0;
        var appliedHunks = 0;

        while (patchIndex < patchLines.Length)
        {
            if (!patchLines[patchIndex].StartsWith("@@", StringComparison.Ordinal))
            {
                patchIndex++;
                continue;
            }

            var header = patchLines[patchIndex++];
            var coordinateMatch = Regex.Match(
                header,
                @"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?:.*)?$"
            );

            var isSmartHunk = string.Equals(
                header.Trim(),
                "@@",
                StringComparison.Ordinal
            );

            if (!coordinateMatch.Success && !isSmartHunk)
                throw new InvalidOperationException(
                    "Некорректный заголовок unified diff: " + header
                );

            var expectedIndex = coordinateMatch.Success
                ? int.Parse(coordinateMatch.Groups[1].Value) - 1 + offset
                : (int?)null;

            var remove = new List<string>();
            var add = new List<string>();

            while (patchIndex < patchLines.Length &&
                   !patchLines[patchIndex].StartsWith("@@", StringComparison.Ordinal))
            {
                var line = patchLines[patchIndex++];

                if (line.StartsWith("---", StringComparison.Ordinal) ||
                    line.StartsWith("+++", StringComparison.Ordinal))
                {
                    continue;
                }

                if (line.StartsWith(" ", StringComparison.Ordinal))
                {
                    remove.Add(line[1..]);
                    add.Add(line[1..]);
                }
                else if (line.StartsWith("-", StringComparison.Ordinal))
                {
                    remove.Add(line[1..]);
                }
                else if (line.StartsWith("+", StringComparison.Ordinal))
                {
                    add.Add(line[1..]);
                }
                else if (line == "\\ No newline at end of file")
                {
                    // Metadata only.
                }
            }

            var actualIndex = expectedIndex.HasValue
                ? ResolveHunkIndex(lines, remove, expectedIndex.Value)
                : ResolveSmartHunkIndex(lines, remove);

            lines.RemoveRange(actualIndex, remove.Count);
            lines.InsertRange(actualIndex, add);

            offset += add.Count - remove.Count;
            appliedHunks++;
        }

        if (appliedHunks == 0)
            throw new InvalidOperationException("Патч не содержит ни одного блока @@");

        return string.Join("\n", lines);
    }

    private static int ResolveSmartHunkIndex(
        IReadOnlyList<string> lines,
        IReadOnlyList<string> remove
    )
    {
        if (remove.Count == 0)
        {
            throw new InvalidOperationException(
                "Упрощённый блок @@ должен содержать хотя бы одну строку " +
                "контекста или удаления. Чистая вставка без позиции неоднозначна."
            );
        }

        var matches = new List<int>();

        for (var index = 0; index <= lines.Count - remove.Count; index++)
        {
            if (MatchesAt(lines, remove, index))
                matches.Add(index);
        }

        if (matches.Count == 1)
            return matches[0];

        if (matches.Count == 0)
        {
            throw new InvalidOperationException(
                "Контекст упрощённого блока @@ не найден в файле."
            );
        }

        throw new InvalidOperationException(
            "Контекст упрощённого блока @@ неоднозначен: " +
            "найдено несколько совпадений на строках " +
            $"{string.Join(", ", matches.Select(index => index + 1))}. " +
            "Добавьте больше неизменённых строк контекста."
        );
    }

    private static int ResolveHunkIndex(
        IReadOnlyList<string> lines,
        IReadOnlyList<string> remove,
        int expectedIndex
    )
    {
        if (MatchesAt(lines, remove, expectedIndex))
            return expectedIndex;

        var matches = new List<int>();

        for (var index = 0; index <= lines.Count - remove.Count; index++)
        {
            if (MatchesAt(lines, remove, index))
                matches.Add(index);
        }

        if (matches.Count == 1)
            return matches[0];

        if (matches.Count == 0)
        {
            throw new InvalidOperationException(
                "Контекст патча не найден в файле. " +
                $"Ожидалась строка около {expectedIndex + 1}."
            );
        }

        var nearestDistance = matches.Min(index => Math.Abs(index - expectedIndex));
        var nearest = matches
            .Where(index => Math.Abs(index - expectedIndex) == nearestDistance)
            .ToArray();

        if (nearest.Length == 1)
            return nearest[0];

        throw new InvalidOperationException(
            "Контекст патча неоднозначен: найдено несколько одинаковых совпадений " +
            $"на строках {string.Join(", ", matches.Select(x => x + 1))}."
        );
    }

    private static bool MatchesAt(
        IReadOnlyList<string> lines,
        IReadOnlyList<string> expected,
        int index
    )
    {
        if (index < 0 || index + expected.Count > lines.Count)
            return false;

        for (var offset = 0; offset < expected.Count; offset++)
        {
            if (!string.Equals(
                    lines[index + offset],
                    expected[offset],
                    StringComparison.Ordinal
                ))
            {
                return false;
            }
        }

        return true;
    }

    private static string Normalize(string value)
    {
        return value
            .Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace("\r", "\n", StringComparison.Ordinal);
    }
}
