import { forwardRef, useMemo } from "react";

// Admiralty Colors
const COLORS = {
  LAND: "#f2e8be",
  SHALLOW: "#b2d3f0", // < 5m
  DEEP: "#ffffff",
  DRYING: "#1d9c60",
  MAGENTA: "#d04297", // Visual aids
  BLACK: "#000000",
};

interface ChartSurfaceProps {
  width: number;
  height: number;
  scale: number; // Pixels per NM
  children?: React.ReactNode;
  viewBox?: string;
  className?: string;
  labelScale?: number; // Scaling factor for text labels (for Zoom)
}

const ChartSurface = forwardRef<SVGSVGElement, ChartSurfaceProps>(
  ({ width, height, scale, viewBox, children, className, labelScale = 1 }, ref) => {
    const resolvedViewBox = viewBox || `0 0 ${width} ${height}`;

    const [vx, vy, vw, vh] = useMemo(
      () => resolvedViewBox.split(" ").map(Number),
      [resolvedViewBox]
    );

    const cols = useMemo(() => Math.floor(width / scale), [width, scale]);
    const rows = useMemo(() => Math.floor(height / scale), [height, scale]);

    const verticalGuides = useMemo(
      () =>
        Array.from({ length: cols + 1 }).map((_, i) => {
          const x = i * scale;
          const isMajor = i % 5 === 0;
          const minute = 35 - i;
          return (
            <g key={`v-${i}`}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={height}
                stroke={isMajor ? "#94a3b8" : "transparent"}
                strokeWidth={isMajor ? 2 * labelScale : 0}
              />
              {x >= vx - 50 && x <= vx + vw + 50 && (
                <text
                  x={x + 2 * labelScale}
                  y={vy + 12 * labelScale}
                  fontSize={10 * labelScale}
                  fill="#64748b"
                  fontWeight={isMajor ? "bold" : "normal"}
                >
                  001°{minute.toString().padStart(2, "0")}'W
                </text>
              )}
            </g>
          );
        }),
      [cols, height, scale, labelScale, vx, vy, vw]
    );

    const horizontalGuides = useMemo(
      () =>
        Array.from({ length: rows + 1 }).map((_, j) => {
          const y = j * scale;
          const isMajor = j % 5 === 0;
          const minute = 15 - j;
          return (
            <g key={`h-${j}`}>
              <line
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke={isMajor ? "#94a3b8" : "transparent"}
                strokeWidth={isMajor ? 2 * labelScale : 0}
              />
              {y >= vy - 50 && y <= vy + vh + 50 && (
                <text
                  x={vx + 2 * labelScale}
                  y={y - 2 * labelScale}
                  fontSize={10 * labelScale}
                  fill="#64748b"
                  fontWeight={isMajor ? "bold" : "normal"}
                >
                  50°{minute.toString().padStart(2, "0")}'N
                </text>
              )}
            </g>
          );
        }),
      [rows, scale, width, labelScale, vx, vy, vh]
    );

    return (
      <svg
        ref={ref}
        width="100%"
        height="100%"
        viewBox={resolvedViewBox}
        className={`w-full h-full bg-white select-none pointer-events-none ${className}`}
        style={{ backgroundColor: COLORS.DEEP }}
        preserveAspectRatio="xMinYMin slice"
      >
        <defs>
          <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
            <path
              d={`M ${scale} 0 L 0 0 0 ${scale}`}
              fill="none"
              stroke="gray"
              strokeWidth={0.5 * labelScale}
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>

        {/* 1. Deep Water Background */}
        <rect x={0} y={0} width={width} height={height} fill={COLORS.DEEP} />

        {/* 2. Shallow Water Contours (<5m) */}
        <path
          d={`M 0 0 L 0 ${height} L ${width * 0.2} ${height} Q ${width * 0.4} ${height * 0.5} ${width * 0.1} 0 Z`}
          fill={COLORS.SHALLOW}
        />
        <path
          d={`M ${width} ${height} L ${width * 0.7} ${height} Q ${width * 0.6} ${height * 0.8} ${width} ${
            height * 0.6
          } Z`}
          fill={COLORS.SHALLOW}
        />

        {/* 3. Land Masses */}
        <path
          d={`M 0 0 L 0 ${height * 0.8} Q ${width * 0.15} ${height * 0.6} ${width * 0.05} 0 Z`}
          fill={COLORS.LAND}
          stroke={COLORS.BLACK}
          strokeWidth={1 * labelScale}
        />
        <path
          d={`M ${width * 0.8} ${height * 0.8} Q ${width * 0.9} ${height * 0.7} ${width * 0.95} ${height * 0.85} Q ${
            width * 0.9
          } ${height * 0.95} ${width * 0.8} ${height * 0.8} Z`}
          fill={COLORS.LAND}
          stroke={COLORS.BLACK}
          strokeWidth={1 * labelScale}
        />
        <path
          d={`M ${width * 0.25} ${height * 0.6} L ${width * 0.27} ${height * 0.58} L ${width * 0.29} ${
            height * 0.6
          } L ${width * 0.27} ${height * 0.62} Z`}
          fill={COLORS.DRYING}
          stroke={COLORS.BLACK}
        />

        {/* 4. Grid Overlay */}
        <rect width={width} height={height} fill="url(#grid)" pointerEvents="none" />

        {/* 5. Sticky Axes & Major Grid Lines */}
        {verticalGuides}
        {horizontalGuides}

        {/* 6. Children */}
        {children}
      </svg>
    );
  }
);

export default ChartSurface;
