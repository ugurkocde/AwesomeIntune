export function GradientMesh() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Static gradient orbs - no animations for performance */}
      <div
        className="absolute -left-[20%] -top-[20%] h-[800px] w-[800px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute -right-[10%] top-[20%] h-[600px] w-[600px] rounded-full opacity-15 blur-[100px]"
        style={{
          background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute bottom-[10%] left-[30%] h-[500px] w-[500px] rounded-full opacity-10 blur-[80px]"
        style={{
          background: "radial-gradient(circle, #0078d4 0%, transparent 70%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, var(--bg-primary) 80%)",
        }}
      />
    </div>
  );
}
