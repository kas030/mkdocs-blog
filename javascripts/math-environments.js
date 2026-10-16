const mathEnvironmentTypes = [
  { selector: ".math-def", name: "定义", numbered: true },
  { selector: ".math-thm", name: "定理", numbered: true },
  { selector: ".math-lem", name: "引理", numbered: true },
  { selector: ".math-cor", name: "推论", numbered: true },
  { selector: ".math-example", name: "例", numbered: true },
  { selector: ".math-proof", name: "证明", numbered: false },
]

const getMathEnvironmentType = (element) =>
  mathEnvironmentTypes.find(({ selector }) => element.matches(selector))

const takeMathEnvironmentTitle = (environment) => {
  const explicitTitle = environment.dataset.title?.trim()
  return explicitTitle || null
}

const createMathEnvironmentHeading = (label, title) => {
  const heading = document.createElement("p")
  heading.className = "math-heading"
  heading.dataset.mathGenerated = "true"

  const labelElement = document.createElement("span")
  labelElement.className = "math-heading__label"
  labelElement.textContent = label
  heading.append(labelElement)

  if (title) {
    const titleElement = document.createElement("span")
    titleElement.className = "math-heading__title"
    titleElement.textContent = `（${title}）`
    heading.append(titleElement)
  }

  return heading
}

const initializeMathEnvironments = (body) => {
  const selector = mathEnvironmentTypes.map(({ selector }) => selector).join(", ")
  const environments = body.querySelectorAll(`.md-typeset :is(${selector})`)
  const references = new Map()
  let number = 0

  environments.forEach((environment) => {
    environment.querySelector(":scope > .math-heading[data-math-generated]")?.remove()

    const type = getMathEnvironmentType(environment)
    if (!type) return

    if (type.numbered) number += 1
    const label = type.numbered ? `${type.name} ${number}` : type.name
    const title = takeMathEnvironmentTitle(environment)

    environment.prepend(createMathEnvironmentHeading(label, title))
    environment.dataset.mathLabel = label
    if (environment.id) references.set(environment.id, label)
  })

  body.querySelectorAll('.md-typeset a.math-ref[href^="#"]').forEach((reference) => {
    const id = decodeURIComponent(reference.getAttribute("href").slice(1))
    const label = references.get(id)
    const generated = reference.dataset.mathGenerated === "true"

    if (label) {
      if (generated || !reference.textContent.trim()) {
        reference.textContent = label
        reference.dataset.mathGenerated = "true"
      }
      reference.classList.remove("math-ref--missing")
      return
    }

    if (generated || !reference.textContent.trim()) {
      reference.textContent = "??"
      reference.dataset.mathGenerated = "true"
    }
    reference.classList.add("math-ref--missing")
  })
}

document$.subscribe(({ body }) => initializeMathEnvironments(body))
