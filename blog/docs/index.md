---
title: 首页
hide:
  - navigation
  - toc
  - footer
---

<section id="knowledge-graph" class="knowledge-graph" data-source="assets/knowledge-graph.json" aria-label="交互式知识图谱">
  <div class="knowledge-graph__glow knowledge-graph__glow--primary" aria-hidden="true"></div>
  <div class="knowledge-graph__glow knowledge-graph__glow--accent" aria-hidden="true"></div>

  <header class="knowledge-graph__header">
    <p class="knowledge-graph__eyebrow">EXPLORE THE NOTES</p>
    <p id="knowledge-graph-summary" class="knowledge-graph__summary" aria-live="polite">
      正在整理知识之间的联系…
    </p>
  </header>

  <div id="knowledge-graph-viewport" class="knowledge-graph__viewport">
    <canvas
      id="knowledge-graph-canvas"
      role="img"
      tabindex="0"
      aria-label="由文章、栏目和标签组成的可交互知识图谱"
    >你的浏览器不支持 Canvas，请使用顶部导航和搜索浏览笔记。</canvas>
    <div id="knowledge-graph-status" class="knowledge-graph__status" role="status">
      <span class="knowledge-graph__loader" aria-hidden="true"></span>
      <span>正在加载图谱…</span>
    </div>
  </div>

  <div class="knowledge-graph__legend" aria-label="节点类型">
    <span><i class="knowledge-graph__legend-mark knowledge-graph__legend-mark--category"></i>栏目</span>
    <span><i class="knowledge-graph__legend-mark knowledge-graph__legend-mark--article"></i>文章</span>
    <span><i class="knowledge-graph__legend-mark knowledge-graph__legend-mark--tag"></i>标签</span>
  </div>

  <div class="knowledge-graph__controls" aria-label="图谱控制">
    <button type="button" data-graph-action="zoom-in" data-tooltip="放大" aria-label="放大图谱">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="10" r="6"></circle>
        <path d="M14.5 14.5 20 20M10 7v6M7 10h6"></path>
      </svg>
    </button>
    <button type="button" data-graph-action="zoom-out" data-tooltip="缩小" aria-label="缩小图谱">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="10" r="6"></circle>
        <path d="M14.5 14.5 20 20M7 10h6"></path>
      </svg>
    </button>
    <button type="button" data-graph-action="reset" data-tooltip="重置视图" aria-label="重置图谱视图">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"></path>
        <circle cx="12" cy="12" r="2.5"></circle>
      </svg>
    </button>
  </div>

  <noscript>
    <p class="knowledge-graph__noscript">知识图谱需要启用 JavaScript。你仍可使用顶部导航和搜索浏览笔记。</p>
  </noscript>
</section>
