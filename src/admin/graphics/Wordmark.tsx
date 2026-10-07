/** Logo chữ của admin: "RANKER.VN" HOA, Barlow Condensed 700, ".VN" màu primary. Không dùng ô ▲. */
export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <span className="rk-wordmark" style={{ fontSize: size }}>
      RANKER<span className="rk-wordmark__tld">.VN</span>
    </span>
  )
}
