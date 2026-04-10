import "./commands"

// Ignore benign browser ResizeObserver noise that can surface as an uncaught exception
// in headless runs (commonly triggered by layout thrash during initial render).
Cypress.on("uncaught:exception", (err) => {
  if (err?.message?.includes("ResizeObserver loop completed with undelivered notifications")) {
    return false
  }
  return true
})
