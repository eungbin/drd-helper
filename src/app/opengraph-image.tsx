import { ImageResponse } from "next/og";

import { siteName, siteTitle } from "./seo";

export const alt = siteTitle;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f8fafc",
          color: "#18181b",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid #d4d4d8",
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            padding: "56px",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#52525b",
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            {siteName}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "72px",
              fontWeight: 800,
              lineHeight: 1.12,
            }}
          >
            Dragonball Random Defense
            <br />
            Combination Calculator
          </div>
          <div
            style={{
              color: "#3f3f46",
              fontSize: "34px",
              lineHeight: 1.35,
            }}
          >
            Materials, recipes, and gas shortage helper
          </div>
        </div>
      </div>
    ),
    size,
  );
}
