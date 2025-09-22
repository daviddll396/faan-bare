import React from "react";
import "./card.css";

interface CardProps {
  title?: React.ReactNode;
  helper?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  helper,
  className = "",
  children,
}) => {
  return (
    <div className={`card ${className}`}>
      {title && <h2 className="card-title">{title}</h2>}
      {helper && <p className="card-helper">{helper}</p>}
      {children}
    </div>
  );
};

export default Card;
