/** Dấu ▲ của logo Ranker.vn: ô vuông đỏ `primary` bo `sm` (prototype/assets/ranker.css › .logo .mark). */
export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg
      className="rk-mark"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="24" height="24" rx="6" fill="#E5262B" />
      <path d="M12 6.5 18 16.5H6Z" fill="#FFFFFF" />
    </svg>
  )
}

/** Logo chữ: dấu ▲ + "Ranker" + ".vn" (màu primary), chữ Barlow Condensed 700. */
export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <span className="rk-wordmark" style={{ fontSize: size }}>
      <Mark size={size} />
      <span>
        Ranker<span className="rk-wordmark__tld">.vn</span>
      </span>
    </span>
  )
}
