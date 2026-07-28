import { Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/EBGaramond";
import { loadFont as loadSans } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";
import { easeOut, ember, ink, lts } from "../lib/tokens";

/**
 * Pipeline probe, not a shipping asset.
 *
 * It exists to answer one question before any artifact work starts: does the
 * site's visual language survive being rendered as video? Three things get
 * tested — the real type stack (EB Garamond / Geist / Geist Mono), ember on
 * ink at video gamma, and --ease-out driving frame-based motion instead of CSS.
 *
 * Delete once that question is settled.
 */

const { fontFamily: displayFamily } = loadDisplay();
const { fontFamily: sansFamily } = loadSans();
const { fontFamily: monoFamily } = loadMono();

const DIGEST = "8f2ac41d0b7e9354";
const SCRAMBLE = "0123456789abcdef";

const ease = Easing.bezier(...easeOut);

/** Each character settles on its own frame, left to right. */
const CHAR_STAGGER = 3;
const SETTLE_START = 18;

export const PlateProbe = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const eyebrow = interpolate(frame, [4, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  const rule = interpolate(frame, [10, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  const claim = interpolate(frame, [durationInFrames - 52, durationInFrames - 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  const chars = DIGEST.split("").map((char, i) => {
    const settledAt = SETTLE_START + i * CHAR_STAGGER;
    if (frame >= settledAt) {
      return { char, settled: true };
    }
    // random() is Remotion's seeded RNG — the same frame always scrambles the
    // same way, so the render stays reproducible.
    const pick = Math.floor(random(`${i}-${frame}`) * SCRAMBLE.length);
    return { char: SCRAMBLE[pick], settled: false };
  });

  const inset = 56;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: ink[950],
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: inset * 2,
        position: "relative",
      }}
    >
      {/* Plate border. Square corners, 1px, exactly the interface treatment. */}
      <div
        style={{
          position: "absolute",
          inset,
          border: `1px solid ${ink[700]}`,
        }}
      />

      {/* Corner tick — the one place the accent appears at rest. */}
      <div
        style={{
          position: "absolute",
          top: inset,
          left: inset,
          width: 24,
          height: 1,
          backgroundColor: ember[500],
        }}
      />

      <div
        style={{
          fontFamily: sansFamily,
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: lts.wider,
          textTransform: "uppercase",
          color: ink[300],
          opacity: eyebrow,
        }}
      >
        Figure 01 — determinism
      </div>

      <div
        style={{
          marginTop: 20,
          marginBottom: 40,
          height: 1,
          backgroundColor: ember[500],
          transform: `scaleX(${rule})`,
          transformOrigin: "left center",
        }}
      />

      <div
        style={{
          display: "flex",
          fontFamily: monoFamily,
          fontSize: 84,
          letterSpacing: lts.tight,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {chars.map((c, i) => (
          <span
            key={i}
            style={{
              color: c.settled ? ink[50] : ink[500],
              // The settled character sits a hair higher than the churn, so the
              // row visibly locks left to right rather than just changing colour.
              transform: c.settled ? "none" : "translateY(2px)",
            }}
          >
            {c.char}
          </span>
        ))}
      </div>

      <div
        style={{
          marginTop: 32,
          fontFamily: displayFamily,
          fontSize: 44,
          letterSpacing: lts.tight,
          color: ink[50],
          opacity: claim,
        }}
      >
        Same bytes in, same bytes out.
      </div>
    </div>
  );
};
