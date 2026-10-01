import { ImageResponse } from "next/og";
import { PRODUCT_NAME } from "@/lib/site-config";

export const alt = `${PRODUCT_NAME} — Gemeinsam mehr erleben`;
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
            color: "#ff7848",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          powered by Fancircle
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
          eventees
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
          Du gehst hin. Ihr erlebt es.
        </div>
      </div>
    ),
    { ...size },
  );
}
