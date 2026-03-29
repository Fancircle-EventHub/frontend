import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#23272f",
          borderRadius: 8,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fddc53", letterSpacing: "-0.05em" }}>EH</span>
      </div>
    ),
    { ...size },
  );
}
