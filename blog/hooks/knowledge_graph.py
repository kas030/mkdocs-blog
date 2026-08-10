"""Generate the data consumed by the home-page knowledge graph."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from mkdocs.structure.nav import Navigation, Page, Section


_nodes: list[dict[str, str]] = []
_edges: list[dict[str, str]] = []
_pages: dict[str, str] = {}
_page_tags: dict[str, list[str]] = {}


def on_pre_build(**kwargs: Any) -> None:
    """Clear module state before every build, including live reloads."""
    _nodes.clear()
    _edges.clear()
    _pages.clear()
    _page_tags.clear()


def on_nav(nav: Navigation, **kwargs: Any) -> Navigation:
    """Collect the visible navigation hierarchy."""

    def visit(item: Any, position: tuple[int, ...], parent_id: str | None) -> None:
        if isinstance(item, Section):
            node_id = "category:" + ".".join(map(str, position))
            _nodes.append({"id": node_id, "type": "category", "label": item.title})
            if parent_id:
                _edges.append(
                    {"source": parent_id, "target": node_id, "type": "hierarchy"}
                )
            for index, child in enumerate(item.children):
                visit(child, (*position, index), node_id)
            return

        if not isinstance(item, Page) or item.file.src_uri == "index.md":
            return

        node_id = f"article:{item.file.src_uri}"
        _nodes.append(
            {
                "id": node_id,
                "type": "article",
                "label": item.title,
                "url": item.url,
            }
        )
        _pages[item.file.src_uri] = node_id
        if parent_id:
            _edges.append(
                {"source": parent_id, "target": node_id, "type": "contains"}
            )

    for index, item in enumerate(nav.items):
        visit(item, (index,), None)

    return nav


def on_page_markdown(markdown: str, page: Page, **kwargs: Any) -> str:
    """Record tags after MkDocs has parsed each page's front matter."""
    page_id = _pages.get(page.file.src_uri)
    if not page_id:
        return markdown

    raw_tags = page.meta.get("tags", [])
    if isinstance(raw_tags, str):
        raw_tags = [raw_tags]

    tags = [str(tag).strip() for tag in raw_tags if str(tag).strip()]
    _page_tags[page_id] = list(dict.fromkeys(tags))
    return markdown


def on_post_build(config: Any, **kwargs: Any) -> None:
    """Write graph JSON into the built site without touching source content."""
    tag_names = sorted(
        {tag for tags in _page_tags.values() for tag in tags}, key=str.casefold
    )

    tag_nodes = [
        {"id": f"tag:{tag}", "type": "tag", "label": tag} for tag in tag_names
    ]
    tag_edges = [
        {"source": f"tag:{tag}", "target": page_id, "type": "tagged"}
        for page_id, tags in _page_tags.items()
        for tag in tags
    ]

    nodes = [*_nodes, *tag_nodes]
    edges = [*_edges, *tag_edges]
    counts = {
        node_type: sum(node["type"] == node_type for node in nodes)
        for node_type in ("category", "article", "tag")
    }
    graph = {
        "meta": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "counts": counts,
        },
        "nodes": nodes,
        "edges": edges,
    }

    output_path = Path(config.site_dir) / "assets" / "knowledge-graph.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
