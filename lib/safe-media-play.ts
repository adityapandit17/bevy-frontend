/**
 * Attach a MediaStream to a media element without noisy AbortError logs
 * when srcObject is replaced while a prior play() is in flight.
 */
export async function attachMediaStream(
  element: HTMLMediaElement | null,
  stream: MediaStream | null
): Promise<void> {
  if (!element) return

  if (!stream) {
    element.pause()
    element.removeAttribute("src")
    element.srcObject = null
    return
  }

  if (element.srcObject === stream) {
    if (element.paused) {
      await safePlay(element)
    }
    return
  }

  element.srcObject = stream
  await safePlay(element)
}

export async function safePlay(element: HTMLMediaElement): Promise<void> {
  try {
    await element.play()
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return
    }
    // Autoplay policy — caller may retry after user gesture
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      return
    }
    console.warn("Media play failed:", error)
  }
}
