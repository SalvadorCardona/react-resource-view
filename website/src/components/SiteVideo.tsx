/**
 * A video from public/videos, played by the browser's own player.
 *
 * `src` and `poster` are file names inside public/videos: their URL is built on
 * BASE_URL, so it carries the same /<repository>/ prefix as every other asset.
 * Only the metadata loads until the reader presses play, and nothing ever
 * starts on its own — the videos have a voice-over.
 */
export function SiteVideo({
  src,
  poster,
  title,
}: Readonly<{ src: string; poster: string; title: string }>) {
  const base = `${import.meta.env.BASE_URL}videos/`

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[#07070d] shadow-2xl">
      <video
        className="block aspect-video w-full"
        controls
        playsInline
        preload="metadata"
        poster={`${base}${poster}`}
        aria-label={title}
      >
        <source src={`${base}${src}`} type="video/mp4" />
      </video>
    </div>
  )
}
