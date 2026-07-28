(() => {
  const shellLanguageClasses = new Set([
    "language-bash",
    "language-console",
    "language-sh",
    "language-shell",
    "language-zsh"
  ])

  const commandPrefixes = new Set([
    "builtin",
    "command",
    "doas",
    "env",
    "exec",
    "noglob",
    "nohup",
    "sudo",
    "time"
  ])

  const commandPattern = /[A-Za-z0-9_./:@+-]/
  const assignmentPattern = /^[A-Za-z_][A-Za-z0-9_]*=/

  const hasShellLanguage = element => {
    for (
      let current = element;
      current && current !== document.body;
      current = current.parentElement
    ) {
      for (const className of current.classList) {
        if (shellLanguageClasses.has(className)) {
          return true
        }
      }
    }

    return false
  }

  const isAlreadyHighlighted = node =>
    node.parentElement?.closest(".sh-command")

  const isInsideSkippedToken = node =>
    node.parentElement?.closest(
      ".c, .c1, .cm, .cp, .cs, .s, .s1, .s2, .sa, .sb, .sc, .sd, .se, .sh, .si, .sr, .ss, .sx"
    )

  const isCommandChar = character => commandPattern.test(character)

  const isPrompt = (text, index) =>
    ["$", ">"].includes(text[index]) &&
    (index + 1 === text.length || /\s/.test(text[index + 1]))

  const markShellCommands = block => {
    if (block.dataset.shellCommandsHighlighted === "true") {
      return
    }

    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
    const ranges = []
    let atCommandPosition = true
    let afterPrefixCommand = false
    let inComment = false

    while (walker.nextNode()) {
      const node = walker.currentNode
      const text = node.nodeValue
      let index = 0

      while (index < text.length) {
        const character = text[index]

        if (character === "\n") {
          atCommandPosition = true
          afterPrefixCommand = false
          inComment = false
          index += 1
          continue
        }

        if (inComment) {
          index += 1
          continue
        }

        if (!atCommandPosition) {
          if (character === "#") {
            inComment = true
          } else if (character === ";" || character === "|") {
            atCommandPosition = true
            afterPrefixCommand = false
            if (character === "|" && text[index + 1] === "|") {
              index += 1
            }
          } else if (
            character === "&" &&
            text[index + 1] === "&"
          ) {
            atCommandPosition = true
            afterPrefixCommand = false
            index += 1
          }

          index += 1
          continue
        }

        if (/\s/.test(character)) {
          index += 1
          continue
        }

        if (!afterPrefixCommand && isPrompt(text, index)) {
          index += 1
          continue
        }

        if (character === "#") {
          inComment = true
          index += 1
          continue
        }

        if (!isCommandChar(character)) {
          atCommandPosition = false
          index += 1
          continue
        }

        const start = index
        while (index < text.length && isCommandChar(text[index])) {
          index += 1
        }

        const value = text.slice(start, index)
        const commandName = value.split("/").pop()

        if (assignmentPattern.test(value)) {
          continue
        }

        if (!isAlreadyHighlighted(node) && !isInsideSkippedToken(node)) {
          ranges.push({ node, start, end: index })
        }

        if (commandPrefixes.has(commandName)) {
          afterPrefixCommand = true
          continue
        }

        atCommandPosition = false
        afterPrefixCommand = false
      }
    }

    for (let index = ranges.length - 1; index >= 0; index -= 1) {
      const { node, start, end } = ranges[index]
      const commandNode = node.splitText(start)
      commandNode.splitText(end - start)
      const wrapper = document.createElement("span")

      wrapper.className = "sh-command"
      wrapper.textContent = commandNode.nodeValue
      commandNode.parentNode.replaceChild(wrapper, commandNode)
    }

    block.dataset.shellCommandsHighlighted = "true"
  }

  const highlightShellBlocks = root => {
    const blocks = [
      ...root.querySelectorAll("pre code"),
      ...root.querySelectorAll(".highlight > pre")
    ].filter((block, index, blocks) =>
      blocks.indexOf(block) === index &&
      block.querySelector("code") === null &&
      hasShellLanguage(block)
    )

    for (const block of blocks) {
      markShellCommands(block)
    }
  }

  const highlightDocument = () => highlightShellBlocks(document)

  highlightDocument()
  document.addEventListener("DOMContentLoaded", highlightDocument)

  if (typeof document$ !== "undefined") {
    document$.subscribe(({ body }) => {
      highlightShellBlocks(body)
    })
  }
})()
