import React from "react";
import "./grid.css";

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

const Grid: React.FC<GridProps> = ({ children, className = "" }) => {
  return <div className={`grid ${className}`}>{children}</div>;
};

export default Grid;
