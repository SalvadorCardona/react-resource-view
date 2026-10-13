import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { VideoDialog } from "@/components/VideoDialog"

afterEach(cleanup)

// jsdom has the element but none of its modal behaviour: the stand-ins open
// it, and close it with the `close` event a browser sends.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "")
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open")
    this.dispatchEvent(new Event("close"))
  }
})

function renderDialog() {
  const { container } = render(
    <VideoDialog src="tour.mp4" poster="tour.jpg" title="The tour">
      Watch the demo
    </VideoDialog>
  )
  const dialog = container.querySelector("dialog")!
  const video = container.querySelector("video")!
  video.muted = true
  const play = vi.spyOn(video, "play").mockResolvedValue()
  const pause = vi.spyOn(video, "pause").mockImplementation(() => {})
  return { dialog, video, play, pause }
}

describe("VideoDialog", () => {
  it("opens the video and plays it with its sound, in the click itself", async () => {
    const user = userEvent.setup()
    const { dialog, video, play } = renderDialog()

    expect(dialog).not.toHaveAttribute("open")
    await user.click(screen.getByRole("button", { name: "Watch the demo" }))

    expect(dialog).toHaveAttribute("open")
    expect(play).toHaveBeenCalledOnce()
    expect(video.muted).toBe(false)
  })

  it("pauses the video whichever way the dialog closes", async () => {
    const user = userEvent.setup()
    const { dialog, pause } = renderDialog()
    const open = () =>
      user.click(screen.getByRole("button", { name: "Watch the demo" }))

    await open()
    await user.click(screen.getByRole("button", { name: "Close the video" }))
    expect(dialog).not.toHaveAttribute("open")
    expect(pause).toHaveBeenCalledTimes(1)

    // A click on the backdrop lands on the dialog element itself.
    await open()
    fireEvent.click(dialog)
    expect(dialog).not.toHaveAttribute("open")
    expect(pause).toHaveBeenCalledTimes(2)

    // Escape: the browser closes the dialog, the `close` event follows.
    await open()
    dialog.close()
    expect(pause).toHaveBeenCalledTimes(3)
  })

  it("stays open when the click lands on the video", async () => {
    const user = userEvent.setup()
    const { dialog, video } = renderDialog()

    await user.click(screen.getByRole("button", { name: "Watch the demo" }))
    fireEvent.click(video)

    expect(dialog).toHaveAttribute("open")
  })
})
