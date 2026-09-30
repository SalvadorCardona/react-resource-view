import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { formatDuration, SiteVideo } from "@/components/SiteVideo"

afterEach(cleanup)

function renderVideo() {
  const { container } = render(
    <SiteVideo src="tour.mp4" poster="tour.jpg" title="The tour" />
  )
  const video = container.querySelector("video")!
  const play = vi.spyOn(video, "play").mockResolvedValue()
  Object.defineProperty(video, "duration", { value: 58.5, configurable: true })
  return { video, play }
}

describe("SiteVideo", () => {
  it("formats a length as minutes and seconds", () => {
    expect(formatDuration(58.5)).toBe("0:58")
    expect(formatDuration(125)).toBe("2:05")
  })

  it("hides the native controls behind its own button until the first play", async () => {
    const user = userEvent.setup()
    const { video, play } = renderVideo()

    expect(video).not.toHaveAttribute("controls")
    fireEvent.loadedMetadata(video)
    expect(screen.getByText("Watch · 0:58 · with sound")).toBeInTheDocument()

    const button = screen.getByRole("button", { name: "Play the one-minute video" })
    await user.click(button)

    expect(play).toHaveBeenCalledOnce()
    expect(video.muted).toBe(false)
    expect(video).toHaveAttribute("controls")
    // Faded out, and out of the tab order.
    expect(button.closest("[inert]")).not.toBeNull()
  })

  it("keeps the native controls on pause and offers a replay at the end", async () => {
    const user = userEvent.setup()
    const { video, play } = renderVideo()

    fireEvent.play(video)
    fireEvent.pause(video)
    expect(video).toHaveAttribute("controls")

    fireEvent.ended(video)
    expect(video).not.toHaveAttribute("controls")

    await user.click(screen.getByRole("button", { name: "Replay the video" }))
    expect(play).toHaveBeenCalledOnce()
    expect(video).toHaveAttribute("controls")
  })
})
