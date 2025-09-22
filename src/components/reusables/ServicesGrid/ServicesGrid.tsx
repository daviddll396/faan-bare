import React from "react";
import ServiceCard from "../ServiceCard/ServiceCard";
import "./servicesgrid.css";
import AirplaneIcon from "/icons/airplane-icon.svg";

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
  if (!items || items.length === 0) {
    return (
      <div className={`services-grid-root ${className}`}>
        <div className="data-table-no-data">
          <div className="no-data-icon">
            <img
              src={AirplaneIcon}
              alt="No services"
              width={48}
              height={48}
              className="desktop-icon"
            />
            <img
              src={AirplaneIcon}
              alt="No services"
              width={36}
              height={36}
              className="mobile-icon"
            />
          </div>
          <div className="no-data-title">No Services Found</div>
          <div className="no-data-message">
            There are no services to display at the moment.
          </div>
        </div>
      </div>
    );
  }

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
