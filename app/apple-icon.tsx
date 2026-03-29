import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #2e323a, #121417)",
          borderRadius: 36,
        }}
      >
        <span style={{ fontSize: 56, fontWeight: 800, color: "#fddc53", letterSpacing: "-0.04em" }}>EH</span>
      </div>
    ),
    { ...size },
  );
}
