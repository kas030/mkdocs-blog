(() => {
  const root = document.documentElement

  document.addEventListener("mousemove", event => {
    root.style.setProperty(
      "--md-cursor-tooltip-x",
      `${event.clientX + 12}px`
    )
    root.style.setProperty(
      "--md-cursor-tooltip-y",
      `${event.clientY + 16}px`
    )
  }, { passive: true })
})()
