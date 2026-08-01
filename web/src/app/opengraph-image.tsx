import { ImageResponse } from "next/og";
import { layers } from "@/data/layers";
import { tools } from "@/data/tools";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.name;

const ramp = ["#333333", "#4d4d4d", "#666666", "#8a8a8a", "#a8a8a8", "#c6c6c6"];

export default function OpengraphImage() {
  const counts = layers.map((l) => tools.filter((t) => t.layer === l.id).length);
  const total = counts.reduce((n, c) => n + c, 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 20, height: 20, background: "#e3120b" }} />
          <div
            style={{ display: "flex", fontSize: 26, letterSpacing: 2, color: "#767676" }}
          >
            {site.name.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 900,
          }}
        >
          <div
            style={{ display: "flex", fontSize: 68, lineHeight: 1.1, color: "#000000" }}
          >
            A taxonomy of applied AI: tools, concepts, stacks, repos.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#555555" }}>
            {`${total} indexed entries across ${layers.length} layers of the context engineering stack.`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", width: "100%", height: 8 }}>
            {counts.map((c, i) => (
              <div
                key={i}
                style={{ flexGrow: c, background: ramp[i], height: "100%" }}
              />
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#767676" }}>
            {site.author.name}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
