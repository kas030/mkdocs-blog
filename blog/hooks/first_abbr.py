"""Mark the first occurrence of abbreviations or an explicitly selected one.

Inline definitions use ``{{abbr:term|title}}``.
"""

from __future__ import annotations

import re
import sys
from xml.etree import ElementTree as etree

from markdown.extensions import Extension
from markdown.extensions.abbr import AbbrBlockprocessor
from markdown.treeprocessors import Treeprocessor
from markdown.util import AtomicString


EXTENSION_NAME = "_blog_first_abbr"
sys.modules[EXTENSION_NAME] = sys.modules[__name__]


def on_config(config):
    """Replace the validated built-in abbr extension with this module."""
    config["markdown_extensions"] = [
        EXTENSION_NAME if extension == "abbr" else extension
        for extension in config["markdown_extensions"]
    ]

    extension_configs = config["mdx_configs"] or {}
    if "abbr" in extension_configs:
        extension_configs[EXTENSION_NAME] = extension_configs.pop("abbr")
    config["mdx_configs"] = extension_configs
    return config


class FirstAbbrExtension(Extension):
    """Collect standard abbreviation definitions and replace first matches."""

    def __init__(self, **kwargs):
        self.config = {
            "glossary": [
                {},
                "Abbreviations available before page-local definitions.",
            ],
        }
        self.abbrs: dict[str, str] = {}
        self.glossary: dict[str, str] = {}
        super().__init__(**kwargs)

    def reset(self) -> None:
        self.abbrs.clear()
        self.abbrs.update(self.glossary)

    def extendMarkdown(self, md) -> None:
        glossary = self.getConfig("glossary")
        if glossary:
            self.glossary.update(glossary)
            self.abbrs.update(self.glossary)

        md.registerExtension(self)
        md.treeprocessors.register(
            FirstAbbrTreeprocessor(md, self.abbrs),
            "first_abbr",
            7,
        )
        md.parser.blockprocessors.register(
            AbbrBlockprocessor(md.parser, self.abbrs),
            "first_abbr",
            16,
        )


class FirstAbbrTreeprocessor(Treeprocessor):
    """Match exact substrings in document order without word boundaries."""

    SKIP_TAGS = {"abbr", "code", "pre", "script", "style"}
    EXPLICIT_RE = re.compile(
        r"\{\{abbr:(?P<term>[^{}|\r\n]+?)(?:\|(?P<title>[^{}\r\n]+))?\}\}"
    )

    def __init__(self, md, abbrs: dict[str, str]):
        super().__init__(md)
        self.abbrs = abbrs
        self.used: set[str] = set()
        self.explicit: set[str] = set()

    def run(self, root: etree.Element) -> etree.Element | None:
        self.used.clear()
        self.explicit.clear()
        self._collect_explicit(root)
        if not self.abbrs and not self.explicit:
            return None

        self.used.update(self.explicit)
        self._walk(root)
        return root

    def _collect_explicit(self, element: etree.Element) -> None:
        """Reserve terms which have an explicit {{abbr:term}} marker."""
        if element.tag in self.SKIP_TAGS:
            return

        self._collect_explicit_from_text(element.text)
        for child in element:
            self._collect_explicit(child)
            self._collect_explicit_from_text(child.tail)

    def _collect_explicit_from_text(self, text: str | None) -> None:
        if not text or isinstance(text, AtomicString):
            return

        for match in self.EXPLICIT_RE.finditer(text):
            term = match.group("term").strip()
            inline_title = match.group("title")
            if term and (
                (inline_title and inline_title.strip())
                or (term in self.abbrs and self.abbrs[term])
            ):
                self.explicit.add(term)

    def _walk(self, element: etree.Element) -> None:
        if element.tag in self.SKIP_TAGS:
            return

        children = list(element)
        self._replace_text(element)

        for child in children:
            self._walk(child)
            self._replace_tail(child, element)

    def _find_matches(self, text: str) -> list[tuple[int, int, str, str]]:
        matches: list[tuple[int, int, str, str]] = []
        markers = list(self.EXPLICIT_RE.finditer(text))
        marker_index = 0
        cursor = 0

        while cursor < len(text):
            if marker_index < len(markers) and cursor == markers[marker_index].start():
                marker = markers[marker_index]
                term = marker.group("term").strip()
                inline_title = marker.group("title")
                title = inline_title.strip() if inline_title else self.abbrs.get(term)
                if term in self.explicit and title:
                    matches.append((marker.start(), marker.end(), term, title))
                cursor = marker.end()
                marker_index += 1
                continue

            region_end = (
                markers[marker_index].start()
                if marker_index < len(markers)
                else len(text)
            )
            candidate: tuple[int, int, str] | None = None

            for term, title in self.abbrs.items():
                if term in self.used or not title:
                    continue

                start = text.find(term, cursor, region_end)
                if start < 0:
                    continue

                current = (start, -len(term), term)
                if candidate is None or current < candidate:
                    candidate = current

            if candidate is None:
                cursor = region_end
                continue

            start, negative_length, term = candidate
            end = start - negative_length
            matches.append((start, end, term, self.abbrs[term]))
            self.used.add(term)
            cursor = end

        return matches

    def _create_element(self, term: str, title: str, tail: str) -> etree.Element:
        abbreviation = etree.Element("abbr", {"title": title})
        abbreviation.text = AtomicString(term)
        abbreviation.tail = tail
        return abbreviation

    def _replace_text(self, element: etree.Element) -> None:
        text = element.text
        if not text or isinstance(text, AtomicString):
            return

        matches = self._find_matches(text)
        for start, end, term, title in reversed(matches):
            element.insert(0, self._create_element(term, title, text[end:]))
            text = text[:start]
        element.text = text

    def _replace_tail(
        self,
        element: etree.Element,
        parent: etree.Element,
    ) -> None:
        tail = element.tail
        if not tail or isinstance(tail, AtomicString):
            return

        matches = self._find_matches(tail)
        insertion_index = list(parent).index(element) + 1
        for start, end, term, title in reversed(matches):
            parent.insert(
                insertion_index,
                self._create_element(term, title, tail[end:]),
            )
            tail = tail[:start]
        element.tail = tail


def makeExtension(**kwargs):
    return FirstAbbrExtension(**kwargs)
