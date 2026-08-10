(() => {
  const TYPE_LABELS = {
    category: "栏目",
    article: "文章",
    tag: "标签"
  }

  const TYPE_RADII = {
    category: 12,
    article: 8,
    tag: 7
  }

  const initialiseGraph = root => {
    if (!root || root.dataset.initialised === "true") return
    root.dataset.initialised = "true"

    const svgElement = root.querySelector("#knowledge-graph-canvas")
    const viewport = root.querySelector("#knowledge-graph-viewport")
    const status = root.querySelector("#knowledge-graph-status")
    const summary = root.querySelector("#knowledge-graph-summary")

    const showError = () => {
      status.classList.add("knowledge-graph__status--error")
      status.innerHTML = ""

      const message = document.createElement("span")
      message.textContent = "图谱暂时无法加载"
      const retry = document.createElement("button")
      retry.type = "button"
      retry.textContent = "重试"
      retry.addEventListener("click", () => window.location.reload())
      status.append(message, retry)
      summary.textContent = "你仍可通过顶部导航和搜索浏览全部笔记。"
    }

    if (typeof window.d3 === "undefined") {
      showError()
      return
    }

    const dataUrl = new URL(root.dataset.source, document.baseURI)

    fetch(dataUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then(data => {
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error("Invalid graph data")
        }
        renderGraph(data)
      })
      .catch(error => {
        console.error("Knowledge graph could not be loaded:", error)
        showError()
      })

    const renderGraph = data => {
      const d3 = window.d3
      const nodes = data.nodes.map(node => ({ ...node }))
      const edges = data.edges.map(edge => ({ ...edge }))
      const nodeById = new Map(nodes.map(node => [node.id, node]))
      const neighbours = new Map(nodes.map(node => [node.id, new Set([node.id])]))

      for (const edge of edges) {
        neighbours.get(edge.source)?.add(edge.target)
        neighbours.get(edge.target)?.add(edge.source)
      }

      const counts = data.meta?.counts ?? {}
      summary.textContent = `${counts.article ?? 0} 篇文章 · ${counts.category ?? 0} 个栏目 · ${counts.tag ?? 0} 个标签`
      status.classList.add("knowledge-graph__status--hidden")

      const svg = d3.select(svgElement)
      const scene = svg.append("g").attr("class", "knowledge-graph__scene")
      const linksLayer = scene.append("g").attr("class", "knowledge-graph__links")
      const nodesLayer = scene.append("g").attr("class", "knowledge-graph__nodes")

      const link = linksLayer
        .selectAll("line")
        .data(edges)
        .join("line")
        .attr("class", edge => `knowledge-graph__link knowledge-graph__link--${edge.type}`)

      const node = nodesLayer
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("class", item => `knowledge-graph__node knowledge-graph__node--${item.type}`)
        .attr("tabindex", 0)
        .attr("role", item => item.type === "article" ? "link" : "button")
        .attr("aria-label", item => `${TYPE_LABELS[item.type]}：${item.label}`)

      node.each(function (item) {
        const selection = d3.select(this)
        const radius = TYPE_RADII[item.type]

        if (item.type === "category") {
          selection.append("rect")
            .attr("x", -radius)
            .attr("y", -radius)
            .attr("width", radius * 2)
            .attr("height", radius * 2)
            .attr("rx", 6)
        } else if (item.type === "tag") {
          selection.append("path")
            .attr("d", `M 0 ${-radius} L ${radius} 0 L 0 ${radius} L ${-radius} 0 Z`)
        } else {
          selection.append("circle").attr("r", radius)
        }

        selection.append("text")
          .attr("x", radius + 6)
          .attr("y", 4)
          .text(shortenLabel(item.label))
        selection.append("title").text(`${TYPE_LABELS[item.type]}：${item.label}`)
      })

      let width = viewport.clientWidth
      let height = viewport.clientHeight
      let focusedId = null
      let hoveredId = null

      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges)
          .id(item => item.id)
          .distance(edge => edge.type === "hierarchy" ? 92 : edge.type === "tagged" ? 72 : 82)
          .strength(edge => edge.type === "hierarchy" ? 0.8 : 0.55))
        .force("charge", d3.forceManyBody().strength(item => item.type === "category" ? -330 : item.type === "tag" ? -120 : -190))
        .force("collision", d3.forceCollide().radius(item => TYPE_RADII[item.type] + 17).iterations(2))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(0.025))
        .force("y", d3.forceY(height / 2).strength(0.025))
        .on("tick", () => {
          link
            .attr("x1", edge => edge.source.x)
            .attr("y1", edge => edge.source.y)
            .attr("x2", edge => edge.target.x)
            .attr("y2", edge => edge.target.y)
          node.attr("transform", item => `translate(${item.x},${item.y})`)
        })

      const zoom = d3.zoom()
        .scaleExtent([0.35, 3])
        .on("zoom", event => scene.attr("transform", event.transform))

      svg.call(zoom).on("dblclick.zoom", null)

      const drag = d3.drag()
        .on("start", (event, item) => {
          if (!event.active) simulation.alphaTarget(0.22).restart()
          item.fx = item.x
          item.fy = item.y
        })
        .on("drag", (event, item) => {
          item.fx = event.x
          item.fy = event.y
        })
        .on("end", (event, item) => {
          if (!event.active) simulation.alphaTarget(0)
          item.fx = null
          item.fy = null
        })

      node.call(drag)

      const activeSet = id => id ? neighbours.get(id) ?? new Set([id]) : null

      const updateEmphasis = () => {
        const selected = activeSet(hoveredId ?? focusedId)

        node.classed("knowledge-graph__node--dimmed", item =>
          selected && !selected.has(item.id))
        node.classed("knowledge-graph__node--focused", item => item.id === focusedId)
        link.classed("knowledge-graph__link--dimmed", edge => {
          const sourceId = edge.source.id ?? edge.source
          const targetId = edge.target.id ?? edge.target
          return selected && (!selected.has(sourceId) || !selected.has(targetId))
        })
      }

      const centreNode = item => {
        const scale = 1.35
        const transform = d3.zoomIdentity
          .translate(width / 2 - item.x * scale, height / 2 - item.y * scale)
          .scale(scale)
        svg.transition().duration(420).call(zoom.transform, transform)
      }

      const activateNode = item => {
        if (item.type === "article" && item.url) {
          window.location.assign(new URL(item.url, document.baseURI))
          return
        }
        focusedId = focusedId === item.id ? null : item.id
        updateEmphasis()
        if (focusedId) centreNode(item)
      }

      node
        .on("mouseenter", (_, item) => {
          hoveredId = item.id
          updateEmphasis()
        })
        .on("mouseleave", () => {
          hoveredId = null
          updateEmphasis()
        })
        .on("click", (event, item) => {
          event.stopPropagation()
          activateNode(item)
        })
        .on("keydown", (event, item) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            activateNode(item)
          }
        })

      svg.on("click", () => {
        focusedId = null
        updateEmphasis()
      })

      root.querySelector('[data-graph-action="zoom-in"]').addEventListener("click", () => {
        svg.transition().duration(220).call(zoom.scaleBy, 1.35)
      })
      root.querySelector('[data-graph-action="zoom-out"]').addEventListener("click", () => {
        svg.transition().duration(220).call(zoom.scaleBy, 0.74)
      })
      root.querySelector('[data-graph-action="reset"]').addEventListener("click", () => {
        focusedId = null
        hoveredId = null
        updateEmphasis()
        svg.transition().duration(420).call(zoom.transform, d3.zoomIdentity)
      })

      const clearFocus = event => {
        if (event.key !== "Escape") return
        focusedId = null
        updateEmphasis()
      }
      document.addEventListener("keydown", clearFocus)

      const resizeObserver = new ResizeObserver(() => {
        width = viewport.clientWidth
        height = viewport.clientHeight
        svg.attr("viewBox", `0 0 ${width} ${height}`)
        simulation
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("x", d3.forceX(width / 2).strength(0.025))
          .force("y", d3.forceY(height / 2).strength(0.025))
          .alpha(0.25)
          .restart()
      })
      resizeObserver.observe(viewport)
      svg.attr("viewBox", `0 0 ${width} ${height}`)

      root.addEventListener("graph:destroy", () => {
        resizeObserver.disconnect()
        simulation.stop()
        document.removeEventListener("keydown", clearFocus)
      }, { once: true })
    }
  }

  const shortenLabel = label => {
    const limit = window.matchMedia("(max-width: 44.99em)").matches ? 10 : 16
    return label.length > limit ? `${label.slice(0, limit)}…` : label
  }

  const initialiseDocument = () => initialiseGraph(document.querySelector("#knowledge-graph"))

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseDocument, { once: true })
  } else {
    initialiseDocument()
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(() => initialiseDocument())
  }
})()
