"""Regression coverage for graph labels without building the site."""

import json
import tempfile
import unittest
from pathlib import Path

from mkdocs.config.defaults import MkDocsConfig
from mkdocs.plugins import PluginCollection
from mkdocs.structure.files import File, Files
from mkdocs.structure.nav import Navigation, Page, Section

from blog.hooks import knowledge_graph as graph


class KnowledgeGraphTests(unittest.TestCase):
    def test_titles_are_resolved_after_pages_are_rendered(self):
        cases = [
            ("features/index.md", None, "# C++ 特性", "C++ 特性"),
            ("explicit.md", "导航标题", "# 正文标题", "导航标题"),
            (
                "metadata.md",
                None,
                "---\ntitle: 元数据标题\ntags: [C++, C++]\n---\n# 正文标题",
                "元数据标题",
            ),
            ("file-name.md", None, "没有一级标题。", "File name"),
        ]
        with tempfile.TemporaryDirectory() as directory:
            config = MkDocsConfig()
            config.site_name = "测试站点"
            config.docs_dir = directory
            config.site_dir = str(Path(directory) / "site")
            config.plugins = PluginCollection()
            pages = []
            for path, title, markdown, _ in cases:
                file = File(path, directory, config.site_dir, True)
                file.content_string = markdown
                pages.append(Page(title, file, config))
            files = Files([page.file for page in pages])
            nav = Navigation([Section("栏目", pages)], pages)

            graph.on_pre_build()
            self.assertIsNone(pages[0].title)
            self.assertIs(graph.on_nav(nav, config), nav)
            for page in pages:
                page.read_source(config)
                page.markdown = graph.on_page_markdown(page.markdown, page)
                page.render(config, files)
            graph.on_post_build(config)

            output = Path(config.site_dir) / "assets/knowledge-graph.json"
            data = json.loads(output.read_text(encoding="utf-8"))
            nodes = {node["id"]: node for node in data["nodes"]}
            for path, _, _, expected in cases:
                with self.subTest(path=path):
                    node = nodes[f"article:{path}"]
                    self.assertEqual(node["label"], expected)
                    self.assertTrue(node["url"])
            self.assertTrue(all(isinstance(n["label"], str) for n in nodes.values()))
            self.assertEqual(
                data["meta"]["counts"], {"category": 1, "article": 4, "tag": 1}
            )
            self.assertIn(
                {"source": "category:0", "target": "article:features/index.md", "type": "contains"},
                data["edges"],
            )
            self.assertEqual(
                [edge for edge in data["edges"] if edge["type"] == "tagged"],
                [{"source": "tag:C++", "target": "article:metadata.md", "type": "tagged"}],
            )

            # A subsequent live reload must discard old pages and tags.
            graph.on_pre_build()
            graph.on_nav(Navigation([], []), config)
            graph.on_post_build(config)
            data = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(data["nodes"], [{"id": "root:site", "type": "root", "label": "测试站点"}])
            self.assertEqual(data["edges"], [])


if __name__ == "__main__":
    unittest.main()
