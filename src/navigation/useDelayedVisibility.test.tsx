import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useDelayedVisibility } from "@/navigation/useDelayedVisibility"

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const renderVisibility = () =>
  renderHook(({ active }) => useDelayedVisibility(active), {
    initialProps: { active: false },
  })

describe("useDelayedVisibility", () => {
  it("shows nothing before 150 ms", () => {
    const { result, rerender } = renderVisibility()

    rerender({ active: true })
    act(() => vi.advanceTimersByTime(149))
    expect(result.current).toBe(false)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(true)
  })

  it("never shows a navigation that ends within the delay", () => {
    const { result, rerender } = renderVisibility()

    rerender({ active: true })
    act(() => vi.advanceTimersByTime(100))
    rerender({ active: false })
    act(() => vi.advanceTimersByTime(1000))

    expect(result.current).toBe(false)
  })

  it("stays 300 ms at least once shown", () => {
    const { result, rerender } = renderVisibility()

    rerender({ active: true })
    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe(true)

    act(() => vi.advanceTimersByTime(10))
    rerender({ active: false })
    act(() => vi.advanceTimersByTime(289))
    expect(result.current).toBe(true)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(false)
  })

  it("hides at once what has already been shown long enough", () => {
    const { result, rerender } = renderVisibility()

    rerender({ active: true })
    act(() => vi.advanceTimersByTime(1000))
    rerender({ active: false })
    act(() => vi.advanceTimersByTime(0))

    expect(result.current).toBe(false)
  })

  it("stays shown when a navigation starts again during its minimum", () => {
    const { result, rerender } = renderVisibility()

    rerender({ active: true })
    act(() => vi.advanceTimersByTime(150))
    rerender({ active: false })
    act(() => vi.advanceTimersByTime(100))
    rerender({ active: true })
    act(() => vi.advanceTimersByTime(1000))

    expect(result.current).toBe(true)
  })
})
