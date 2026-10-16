/* global d3 */

try {
  importScripts("https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js")
} catch (error) {
  self.postMessage({ type: "error", message: String(error) })
  throw error
}

let nodes = []
let simulation = null
let nodeById = new Map()
let width = 0
let height = 0
let lastPublishedAt = 0

const publishPositions = type => {
  const positions = new Float32Array(nodes.length * 2)
  for (let index = 0; index < nodes.length; index += 1) {
    positions[index * 2] = nodes[index].x
    positions[index * 2 + 1] = nodes[index].y
  }
  self.postMessage({ type, positions }, [positions.buffer])
}

const createSimulation = data => {
  simulation?.stop()
  width = data.width
  height = data.height
  nodes = data.nodes.map(node => ({ ...node }))
  nodeById = new Map(nodes.map(node => [node.id, node]))
  const edges = data.edges.map(edge => ({ ...edge }))

  simulation = d3.forceSimulation(nodes)
    .alphaDecay(0.035)
    .alphaMin(0.0025)
    .velocityDecay(0.42)
    .force("link", d3.forceLink(edges)
      .id(node => node.id)
      .distance(edge => edge.type === "root" ? 124 : edge.type === "hierarchy" ? 92 : edge.type === "tagged" ? 72 : 82)
      .strength(edge => edge.type === "root" ? 0.9 : edge.type === "hierarchy" ? 0.8 : 0.55))
    .force("charge", d3.forceManyBody()
      .strength(node => node.type === "root" ? -360 : node.type === "category" ? -250 : node.type === "tag" ? -90 : -145))
    .force("collision", d3.forceCollide()
      .radius(node => data.radii[node.type] + 17))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.025))
    .force("y", d3.forceY(height / 2).strength(0.025))
    .on("tick", () => {
      const now = performance.now()
      if (now - lastPublishedAt < 32) return
      lastPublishedAt = now
      publishPositions("positions")
    })
    .on("end", () => publishPositions("settled"))
}

const resizeSimulation = data => {
  if (!simulation || width <= 0 || height <= 0) return
  const scale = Math.min(data.width / width, data.height / height)
  for (const node of nodes) {
    node.x = data.width / 2 + (node.x - width / 2) * scale
    node.y = data.height / 2 + (node.y - height / 2) * scale
  }
  width = data.width
  height = data.height
  simulation
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.025))
    .force("y", d3.forceY(height / 2).strength(0.025))
    .alpha(0.12)
    .restart()
}

self.addEventListener("message", event => {
  const data = event.data

  if (data.type === "init") {
    createSimulation(data)
    return
  }

  if (data.type === "resize") {
    resizeSimulation(data)
    return
  }

  if (data.type === "stop") {
    simulation?.stop()
    self.close()
    return
  }

  const node = nodeById.get(data.id)
  if (!simulation || !node) return

  if (data.type === "drag-start") {
    node.fx = data.x
    node.fy = data.y
    simulation.alphaTarget(0.08).alpha(Math.max(simulation.alpha(), 0.14)).restart()
  } else if (data.type === "drag") {
    node.fx = data.x
    node.fy = data.y
  } else if (data.type === "drag-end") {
    node.fx = null
    node.fy = null
    simulation.alphaTarget(0).alpha(Math.max(simulation.alpha(), 0.09)).restart()
  }
})
