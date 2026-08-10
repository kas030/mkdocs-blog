"""Render compact RISC-V instruction-format fences as bit-field diagrams."""

from __future__ import annotations

from html import escape

from pymdownx.superfences import SuperFencesException


FENCE_NAME = "riscv-format"
CSS_CLASS = "cs61c-instruction-format"


def _fail(message: str) -> None:
    raise SuperFencesException(f"Invalid {FENCE_NAME} block: {message}")


def _split_fields(source: str) -> list[str]:
    r"""Split on unescaped pipes, allowing ``\|`` inside field labels."""
    fields: list[str] = []
    current: list[str] = []
    index = 0

    while index < len(source):
        character = source[index]
        if character == "\\" and index + 1 < len(source):
            escaped = source[index + 1]
            if escaped in {"\\", "|"}:
                current.append(escaped)
                index += 2
                continue
        if character == "|":
            fields.append("".join(current))
            current.clear()
        else:
            current.append(character)
        index += 1

    fields.append("".join(current))
    return fields


def _parse_fields(source: str) -> list[tuple[str, int]]:
    if not source.strip():
        _fail("the block is empty")

    fields: list[tuple[str, int]] = []
    for raw_field in _split_fields(source):
        field = raw_field.strip()
        if not field:
            _fail("fields separated by '|' cannot be empty")

        try:
            label, raw_width = field.rsplit(":", 1)
        except ValueError:
            _fail(f"field {field!r} must use the form 'label:width'")

        label = label.strip()
        raw_width = raw_width.strip()
        if not label:
            _fail("field labels cannot be empty")

        try:
            width = int(raw_width)
        except ValueError:
            _fail(f"width {raw_width!r} for field {label!r} is not an integer")

        if width <= 0:
            _fail(f"width for field {label!r} must be positive")
        fields.append((label, width))

    total_width = sum(width for _, width in fields)
    if total_width != 32:
        _fail(f"field widths must add up to 32, got {total_width}")

    return fields


def format_instruction_format(
    source,
    language,
    css_class,
    options,
    md,
    **kwargs,
):
    """SuperFences formatter for a 32-bit RISC-V instruction layout."""
    fields = _parse_fields(source)
    high_bit = 31
    visual_fields: list[str] = []
    descriptions: list[str] = []

    for label, width in fields:
        low_bit = high_bit - width + 1
        safe_label = escape(label)
        field_classes = [f"{CSS_CLASS}__field"]
        if width <= 2:
            field_classes.append(f"{CSS_CLASS}__field--narrow")
        if width == 1:
            field_classes.append(f"{CSS_CLASS}__field--single")
        descriptions.append(
            f"{label}: bit {high_bit}"
            if high_bit == low_bit
            else f"{label}: bits {high_bit} through {low_bit}"
        )

        if high_bit == low_bit:
            bit_numbers = f'<span class="{CSS_CLASS}__bit">{high_bit}</span>'
        else:
            bit_numbers = (
                f'<span class="{CSS_CLASS}__bit">{high_bit}</span>'
                f'<span class="{CSS_CLASS}__bit">{low_bit}</span>'
            )

        visual_fields.append(
            f'<div class="{" ".join(field_classes)}" '
            f'style="--cs61c-field-width: {width}">'
            f'<span class="{CSS_CLASS}__bits">{bit_numbers}</span>'
            f'<span class="{CSS_CLASS}__label">{safe_label}</span>'
            "</div>"
        )
        high_bit = low_bit - 1

    aria_label = escape(
        "32-bit RISC-V instruction format. " + "; ".join(descriptions),
        quote=True,
    )
    return (
        f'<figure class="{CSS_CLASS}" role="img" aria-label="{aria_label}">'
        f'<div class="{CSS_CLASS}__scroll">'
        f'<div class="{CSS_CLASS}__diagram" aria-hidden="true">'
        f'{"".join(visual_fields)}'
        "</div></div></figure>"
    )


def on_config(config):
    """Register the formatter without requiring a YAML Python-name tag."""
    extension_configs = config["mdx_configs"] or {}
    superfences_config = extension_configs.setdefault("pymdownx.superfences", {})
    custom_fences = list(superfences_config.get("custom_fences", []))

    if not any(fence.get("name") == FENCE_NAME for fence in custom_fences):
        custom_fences.append(
            {
                "name": FENCE_NAME,
                "class": CSS_CLASS,
                "format": format_instruction_format,
            }
        )

    superfences_config["custom_fences"] = custom_fences
    extension_configs["pymdownx.superfences"] = superfences_config
    config["mdx_configs"] = extension_configs
    return config
