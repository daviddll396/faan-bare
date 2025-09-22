import React from "react";
import ServiceCard from "../ServiceCard/ServiceCard";
import "./servicesgrid.css";

interface ServiceItem {
  id: string | number;
  image?: string;
  name: string;
  price?: string | number;
  description?: string;
}

type Props = {
  items: ServiceItem[];
  onAction?: (id: string | number) => void;
  actionText?: string;
  className?: string;
};

const ServicesGrid: React.FC<Props> = ({
  items,
  onAction,
  actionText = "Select",
  className = "",
}) => {
  return (
    <div className={`services-grid-root ${className}`}>
      {items.map((it) => (
        <ServiceCard
          key={it.id}
          id={it.id}
          image={it.image}
          name={it.name}
          price={it.price}
          description={it.description}
          actionText={actionText}
          onAction={() => onAction && onAction(it.id)}
        />
      ))}
    </div>
  );
};

export default ServicesGrid;
