/**
 * TnalakPattern — Authentic Filipino T'nalak weave SVG overlay.
 * Place as absolute-positioned child inside a relative card.
 * opacity prop controls visibility; default is very subtle (0.08).
 */
export default function TnalakPattern({ opacity = 0.08, color = "white" }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id="tnalak"
          x="0"
          y="0"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          {/* Diagonal weave — T'nalak inspired */}
          <rect x="0" y="0" width="2" height="2" fill={color} />
          <rect x="4" y="4" width="2" height="2" fill={color} />
          <rect x="8" y="8" width="2" height="2" fill={color} />
          <rect x="12" y="12" width="2" height="2" fill={color} />
          <rect x="0" y="8" width="2" height="2" fill={color} />
          <rect x="8" y="0" width="2" height="2" fill={color} />
          <rect x="4" y="12" width="2" height="2" fill={color} />
          <rect x="12" y="4" width="2" height="2" fill={color} />
          {/* Cross-weave threads */}
          <rect x="2" y="6" width="1" height="1" fill={color} />
          <rect x="6" y="2" width="1" height="1" fill={color} />
          <rect x="10" y="14" width="1" height="1" fill={color} />
          <rect x="14" y="10" width="1" height="1" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tnalak)" />
    </svg>
  );
}