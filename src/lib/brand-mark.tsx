// PWA / favicon ikonu (ImageResponse ile çizilir)
export function BrandMark({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#A8432C",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#F5F0EA",
        fontSize: size * 0.62,
        fontStyle: "italic",
        fontFamily: "serif",
        paddingBottom: size * 0.08,
      }}
    >
      d
    </div>
  );
}
