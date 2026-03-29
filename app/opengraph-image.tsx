import { ImageResponse } from "next/og";
import { PRODUCT_NAME } from "@/lib/site-config";

export const alt = `${PRODUCT_NAME} — private event engagement`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #121417 0%, #23272f 45%, #121417 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 72,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#fddc53",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          Fancircle
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          EventHub
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#94a3b8",
            maxWidth: 880,
            lineHeight: 1.35,
          }}
        >
          Private event engagement for organizers and guests — connect during live shows.
        </div>
      </div>
    ),
    { ...size },
  );
}
