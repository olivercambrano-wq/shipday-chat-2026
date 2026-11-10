import React from "react";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  fill?: boolean;
  weight?: number;
  style?: React.CSSProperties;
}

export default function Icon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  fill = false,
  weight = 300,
  style,
}: IconProps) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{
        fontSize: size,
        color,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
