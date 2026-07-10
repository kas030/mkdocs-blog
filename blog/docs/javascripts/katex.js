const games101Macros = {
  "\\vctwo": "\\begin{bmatrix}#1\\\\#2\\end{bmatrix}",
  "\\vcthree": "\\begin{bmatrix}#1\\\\#2\\\\#3\\end{bmatrix}",
  "\\vcfour": "\\begin{bmatrix}#1\\\\#2\\\\#3\\\\#4\\end{bmatrix}",
  "\\mattwo": "\\begin{bmatrix}#1 & #2\\\\#3 & #4\\end{bmatrix}",
  "\\matthree": "\\begin{bmatrix}#1\\\\#2\\\\#3\\end{bmatrix}",
  "\\matfour": "\\begin{bmatrix}#1\\\\#2\\\\#3\\\\#4\\end{bmatrix}",
  "\\ct": "\\cos\\theta",
  "\\st": "\\sin\\theta",
  "\\ca": "\\cos\\alpha",
  "\\sa": "\\sin\\alpha"
}

const isGames101Page = () => location.pathname.includes("/courses/games101/")

document$.subscribe(({ body }) => { 
  renderMathInElement(body, {
    delimiters: [
      { left: "$$",  right: "$$",  display: true },
      { left: "$",   right: "$",   display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true }
    ],
    macros: isGames101Page() ? games101Macros : {},
  })
})
