(() => {
  const scriptUrl = document.currentScript?.src ?? document.baseURI
  const workerUrl = new URL("knowledge-graph-worker.js", scriptUrl)

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

  const MAX_ZOOM = 3

  const clamp = (value, minimum, maximum) =>
    Math.min(maximum, Math.max(minimum, value))

  const shortenLabel = label => {
    const limit = window.matchMedia("(max-width: 44.99em)").matches ? 10 : 16
    return label.length > limit ? `${label.slice(0, limit)}…` : label
  }

  let activeRoot = null

  const initialiseGraph = root => {
    if (!root || root.dataset.initialised === "true") return
    if (activeRoot && activeRoot !== root) {
      activeRoot.dispatchEvent(new Event("graph:destroy"))
    }
    activeRoot = root
    root.dataset.initialised = "true"

    const canvas = root.querySelector("#knowledge-graph-canvas")
    const viewport = root.querySelector("#knowledge-graph-viewport")
    const status = root.querySelector("#knowledge-graph-status")
    const summary = root.querySelector("#knowledge-graph-summary")
    const context = canvas.getContext("2d", { alpha: true })

    const showError = () => {
      status.classList.remove("knowledge-graph__status--hidden")
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

    if (!context || typeof Worker === "undefined") {
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
      let width = Math.max(1, viewport.clientWidth)
      let height = Math.max(1, viewport.clientHeight)
      let pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      let transform = { x: 0, y: 0, k: 1 }
      let transformAnimation = null
      let animationFrame = null
      let focusedId = null
      let hoveredId = null
      let gesture = null
      let draggedNode = null
      let workerSettled = false
      let destroyed = false

      const nodes = data.nodes.map((node, index) => {
        const angle = index * 2.399963229728653
        const radius = 10 + Math.sqrt(index) * 2.2
        const x = width / 2 + Math.cos(angle) * radius
        const y = height / 2 + Math.sin(angle) * radius
        return { ...node, x, y, targetX: x, targetY: y }
      })
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

      let colors = {}
      let nodeSprites = new Map()
      let labelSprites = new Map()

      const readColors = () => {
        const styles = getComputedStyle(root)
        const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback
        return {
          category: read("--kg-category", "#5577ff"),
          article: read("--kg-article", "#29b8a6"),
          tag: read("--kg-tag", "#a66df2"),
          text: read("--kg-text", "#29313d"),
          outline: read("--kg-label-outline", "#f5f6f8"),
          edge: read("--kg-edge", "rgb(92 102 119 / 24%)"),
          hierarchy: read("--kg-edge-hierarchy", "rgb(85 119 255 / 46%)"),
          tagged: read("--kg-edge-tagged", "rgb(166 109 242 / 34%)")
        }
      }

      const createNodeSprite = type => {
        const size = 56
        const renderScale = pixelRatio * MAX_ZOOM
        const sprite = document.createElement("canvas")
        sprite.width = Math.ceil(size * renderScale)
        sprite.height = Math.ceil(size * renderScale)
        const spriteContext = sprite.getContext("2d")
        spriteContext.scale(renderScale, renderScale)
        spriteContext.translate(size / 2, size / 2)
        spriteContext.fillStyle = colors[type]
        spriteContext.strokeStyle = "rgb(255 255 255 / 72%)"
        spriteContext.lineWidth = 1
        spriteContext.shadowColor = colors[type]
        spriteContext.shadowBlur = type === "category" ? 10 : 8
        const radius = TYPE_RADII[type]

        spriteContext.beginPath()
        if (type === "category") {
          spriteContext.roundRect(-radius, -radius, radius * 2, radius * 2, 6)
        } else if (type === "tag") {
          spriteContext.moveTo(0, -radius)
          spriteContext.lineTo(radius, 0)
          spriteContext.lineTo(0, radius)
          spriteContext.lineTo(-radius, 0)
          spriteContext.closePath()
        } else {
          spriteContext.arc(0, 0, radius, 0, Math.PI * 2)
        }
        spriteContext.fill()
        spriteContext.shadowBlur = 0
        spriteContext.stroke()
        return { canvas: sprite, size }
      }

      const createLabelSprite = label => {
        const text = shortenLabel(label)
        const styles = getComputedStyle(root)
        const family = styles.getPropertyValue("--md-text-font-family").trim() || "sans-serif"
        const font = `560 10px ${family}`
        const measuring = document.createElement("canvas").getContext("2d")
        measuring.font = font
        const width = Math.ceil(measuring.measureText(text).width) + 8
        const height = 18
        const renderScale = pixelRatio * MAX_ZOOM
        const sprite = document.createElement("canvas")
        sprite.width = Math.ceil(width * renderScale)
        sprite.height = Math.ceil(height * renderScale)
        const spriteContext = sprite.getContext("2d")
        spriteContext.scale(renderScale, renderScale)
        spriteContext.font = font
        spriteContext.textBaseline = "middle"
        spriteContext.lineJoin = "round"
        spriteContext.lineWidth = 3
        spriteContext.strokeStyle = colors.outline
        spriteContext.fillStyle = colors.text
        spriteContext.strokeText(text, 4, height / 2)
        spriteContext.fillText(text, 4, height / 2)
        return { canvas: sprite, width, height }
      }

      const rebuildSprites = () => {
        colors = readColors()
        nodeSprites = new Map(Object.keys(TYPE_RADII).map(type => [type, createNodeSprite(type)]))
        labelSprites = new Map(nodes.map(node => [node.id, createLabelSprite(node.label)]))
      }

      const resizeCanvas = () => {
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.max(1, Math.round(width * pixelRatio))
        canvas.height = Math.max(1, Math.round(height * pixelRatio))
      }

      const activeSet = () => {
        return focusedId
          ? neighbours.get(focusedId) ?? new Set([focusedId])
          : null
      }

      const drawGraph = () => {
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.setTransform(
          pixelRatio * transform.k,
          0,
          0,
          pixelRatio * transform.k,
          pixelRatio * transform.x,
          pixelRatio * transform.y
        )

        const selected = activeSet()
        context.lineCap = "round"

        for (const edge of edges) {
          const source = nodeById.get(edge.source)
          const target = nodeById.get(edge.target)
          if (!source || !target) continue
          const dimmed = selected && (!selected.has(source.id) || !selected.has(target.id))
          context.globalAlpha = dimmed ? 0.08 : 1
          context.strokeStyle = edge.type === "hierarchy"
            ? colors.hierarchy
            : edge.type === "tagged"
              ? colors.tagged
              : colors.edge
          context.lineWidth = edge.type === "hierarchy" ? 1.5 : 1
          context.setLineDash(edge.type === "tagged" ? [2, 4] : [])
          context.beginPath()
          context.moveTo(source.x, source.y)
          context.lineTo(target.x, target.y)
          context.stroke()
        }

        context.setLineDash([])
        for (const node of nodes) {
          const dimmed = selected && !selected.has(node.id)
          const focused = node.id === focusedId
          const hovered = node.id === hoveredId
          const sprite = nodeSprites.get(node.type)
          const label = labelSprites.get(node.id)
          const scale = focused ? 1.18 : hovered ? 1.1 : 1
          const spriteSize = sprite.size * scale
          context.globalAlpha = dimmed ? 0.08 : 1
          context.drawImage(
            sprite.canvas,
            node.x - spriteSize / 2,
            node.y - spriteSize / 2,
            spriteSize,
            spriteSize
          )
          context.drawImage(
            label.canvas,
            node.x + TYPE_RADII[node.type] + 4,
            node.y - label.height / 2,
            label.width,
            label.height
          )
        }
        context.globalAlpha = 1
      }

      const requestRender = () => {
        if (animationFrame === null) {
          animationFrame = requestAnimationFrame(renderFrame)
        }
      }

      const renderFrame = time => {
        animationFrame = null
        let moving = false
        const interpolation = workerSettled ? 0.32 : 0.2

        for (const node of nodes) {
          if (node === draggedNode) continue
          const dx = node.targetX - node.x
          const dy = node.targetY - node.y
          if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
            node.x += dx * interpolation
            node.y += dy * interpolation
            moving = true
          } else {
            node.x = node.targetX
            node.y = node.targetY
          }
        }

        if (transformAnimation) {
          const progress = clamp((time - transformAnimation.startedAt) / transformAnimation.duration, 0, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          transform = {
            x: transformAnimation.from.x + (transformAnimation.to.x - transformAnimation.from.x) * eased,
            y: transformAnimation.from.y + (transformAnimation.to.y - transformAnimation.from.y) * eased,
            k: transformAnimation.from.k + (transformAnimation.to.k - transformAnimation.from.k) * eased
          }
          if (progress < 1) moving = true
          else transformAnimation = null
        }

        drawGraph()
        if (moving) requestRender()
      }

      const animateTransform = (target, duration = 360) => {
        transformAnimation = {
          from: { ...transform },
          to: target,
          startedAt: performance.now(),
          duration
        }
        requestRender()
      }

      const localPoint = event => {
        const bounds = canvas.getBoundingClientRect()
        return {
          x: (event.clientX - bounds.left) * width / bounds.width,
          y: (event.clientY - bounds.top) * height / bounds.height
        }
      }

      const graphPoint = point => ({
        x: (point.x - transform.x) / transform.k,
        y: (point.y - transform.y) / transform.k
      })

      const findNode = point => {
        const graph = graphPoint(point)
        for (let index = nodes.length - 1; index >= 0; index -= 1) {
          const node = nodes[index]
          const radius = TYPE_RADII[node.type] + 7 / transform.k
          const dx = graph.x - node.x
          const dy = graph.y - node.y
          if (dx * dx + dy * dy <= radius * radius) return node
        }
        return null
      }

      const centreNode = node => {
        const scale = 1.35
        animateTransform({
          x: width / 2 - node.x * scale,
          y: height / 2 - node.y * scale,
          k: scale
        }, 420)
      }

      const activateNode = node => {
        if (node.type === "article" && node.url) {
          window.location.assign(new URL(node.url, document.baseURI))
          return
        }
        focusedId = focusedId === node.id ? null : node.id
        requestRender()
        if (focusedId) centreNode(node)
      }

      rebuildSprites()
      resizeCanvas()
      drawGraph()

      const worker = new Worker(workerUrl)
      worker.addEventListener("message", event => {
        if (destroyed) return
        if (event.data.type === "error") {
          console.error("Knowledge graph worker failed:", event.data.message)
          showError()
          return
        }
        if (event.data.type !== "positions" && event.data.type !== "settled") return

        const positions = event.data.positions
        workerSettled = event.data.type === "settled"
        for (let index = 0; index < nodes.length; index += 1) {
          const node = nodes[index]
          if (node === draggedNode) continue
          node.targetX = positions[index * 2]
          node.targetY = positions[index * 2 + 1]
        }
        requestRender()
      })
      worker.addEventListener("error", event => {
        console.error("Knowledge graph worker failed:", event.message)
        showError()
      })
      worker.postMessage({
        type: "init",
        width,
        height,
        radii: TYPE_RADII,
        nodes: nodes.map(({ id, type }) => ({ id, type })),
        edges
      })

      canvas.addEventListener("pointerdown", event => {
        if (event.button !== 0) return
        transformAnimation = null
        const point = localPoint(event)
        const node = findNode(point)
        canvas.setPointerCapture(event.pointerId)
        gesture = node
          ? {
              type: "node",
              node,
              startClientX: event.clientX,
              startClientY: event.clientY,
              workerStarted: false
            }
          : {
              type: "pan",
              startX: point.x,
              startY: point.y,
              transform: { ...transform },
              moved: false
            }
      })

      canvas.addEventListener("pointermove", event => {
        const point = localPoint(event)
        if (!gesture) {
          const node = findNode(point)
          const nextHoveredId = node?.id ?? null
          if (nextHoveredId !== hoveredId) {
            hoveredId = nextHoveredId
            canvas.classList.toggle("knowledge-graph__canvas--interactive", Boolean(node))
            requestRender()
          }
          return
        }

        if (gesture.type === "pan") {
          const dx = point.x - gesture.startX
          const dy = point.y - gesture.startY
          gesture.moved ||= Math.abs(dx) + Math.abs(dy) > 2
          transform.x = gesture.transform.x + dx
          transform.y = gesture.transform.y + dy
          canvas.classList.add("knowledge-graph__canvas--dragging")
          requestRender()
          return
        }

        const distance = Math.hypot(
          event.clientX - gesture.startClientX,
          event.clientY - gesture.startClientY
        )
        if (!gesture.workerStarted && distance > 3) {
          gesture.workerStarted = true
          draggedNode = gesture.node
          workerSettled = false
          worker.postMessage({
            type: "drag-start",
            id: draggedNode.id,
            x: draggedNode.x,
            y: draggedNode.y
          })
        }
        if (!gesture.workerStarted) return

        const graph = graphPoint(point)
        draggedNode.x = graph.x
        draggedNode.y = graph.y
        draggedNode.targetX = graph.x
        draggedNode.targetY = graph.y
        worker.postMessage({ type: "drag", id: draggedNode.id, x: graph.x, y: graph.y })
        canvas.classList.add("knowledge-graph__canvas--dragging")
        requestRender()
      })

      const finishPointer = event => {
        if (!gesture) return
        if (gesture.type === "node") {
          if (gesture.workerStarted) {
            worker.postMessage({ type: "drag-end", id: gesture.node.id })
            gesture.node.targetX = gesture.node.x
            gesture.node.targetY = gesture.node.y
          } else if (event.type === "pointerup") {
            activateNode(gesture.node)
          }
        } else if (!gesture.moved && event.type === "pointerup") {
          focusedId = null
          requestRender()
        }
        draggedNode = null
        gesture = null
        canvas.classList.remove("knowledge-graph__canvas--dragging")
      }

      canvas.addEventListener("pointerup", finishPointer)
      canvas.addEventListener("pointercancel", finishPointer)
      canvas.addEventListener("pointerleave", () => {
        if (gesture) return
        hoveredId = null
        canvas.classList.remove("knowledge-graph__canvas--interactive")
        requestRender()
      })

      canvas.addEventListener("wheel", event => {
        event.preventDefault()
        transformAnimation = null
        const point = localPoint(event)
        const nextScale = clamp(transform.k * Math.exp(-event.deltaY * 0.0012), 0.35, MAX_ZOOM)
        const graph = graphPoint(point)
        transform = {
          x: point.x - graph.x * nextScale,
          y: point.y - graph.y * nextScale,
          k: nextScale
        }
        requestRender()
      }, { passive: false })

      canvas.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          focusedId = null
          requestRender()
        }
      })

      const zoomAroundCentre = factor => {
        const nextScale = clamp(transform.k * factor, 0.35, MAX_ZOOM)
        const graphX = (width / 2 - transform.x) / transform.k
        const graphY = (height / 2 - transform.y) / transform.k
        animateTransform({
          x: width / 2 - graphX * nextScale,
          y: height / 2 - graphY * nextScale,
          k: nextScale
        }, 220)
      }

      root.querySelector('[data-graph-action="zoom-in"]').addEventListener("click", () => {
        zoomAroundCentre(1.35)
      })
      root.querySelector('[data-graph-action="zoom-out"]').addEventListener("click", () => {
        zoomAroundCentre(0.74)
      })
      root.querySelector('[data-graph-action="reset"]').addEventListener("click", () => {
        focusedId = null
        hoveredId = null
        animateTransform({ x: 0, y: 0, k: 1 }, 420)
      })

      const resizeObserver = new ResizeObserver(() => {
        const nextWidth = Math.max(1, viewport.clientWidth)
        const nextHeight = Math.max(1, viewport.clientHeight)
        if (nextWidth === width && nextHeight === height) return
        width = nextWidth
        height = nextHeight
        resizeCanvas()
        workerSettled = false
        worker.postMessage({ type: "resize", width, height })
        requestRender()
      })
      resizeObserver.observe(viewport)

      const paletteElement = document.querySelector("[data-md-color-scheme]") ?? document.documentElement
      const paletteObserver = new MutationObserver(() => {
        rebuildSprites()
        requestRender()
      })
      paletteObserver.observe(paletteElement, {
        attributes: true,
        attributeFilter: ["data-md-color-scheme", "data-md-color-primary"]
      })

      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      const handleSystemTheme = () => {
        rebuildSprites()
        requestRender()
      }
      systemTheme.addEventListener("change", handleSystemTheme)
      document.fonts?.ready.then(() => {
        if (destroyed) return
        rebuildSprites()
        requestRender()
      })

      root.addEventListener("graph:destroy", () => {
        destroyed = true
        resizeObserver.disconnect()
        paletteObserver.disconnect()
        systemTheme.removeEventListener("change", handleSystemTheme)
        worker.postMessage({ type: "stop" })
        worker.terminate()
        if (animationFrame !== null) cancelAnimationFrame(animationFrame)
        if (activeRoot === root) activeRoot = null
      }, { once: true })
    }
  }

  const initialiseDocument = () => {
    const root = document.querySelector("#knowledge-graph")
    if (!root && activeRoot) {
      activeRoot.dispatchEvent(new Event("graph:destroy"))
      return
    }
    initialiseGraph(root)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseDocument, { once: true })
  } else {
    initialiseDocument()
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(initialiseDocument)
  }
})()
