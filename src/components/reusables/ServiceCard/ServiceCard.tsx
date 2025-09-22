import React from "react";
import "./servicecard.css";
import SolidButton from "../SolidButton";

interface ServiceCardProps {
  id?: string | number;
  image?: string;
  name: string;
  price?: string | number;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  image,
  name,
  price,
  description,
  actionText = "",
  onAction,
  className = "",
}) => {
  return (
    <div className={`service-card ${className}`} data-id={id}>
      {image && (
        <div className="service-card-img-wrap">
          <img src={image} alt={name} className="service-card-img" />
        </div>
      )}

      <div className="service-card-body">
        <div className="service-card-top">
          <div className="service-card-name">{name}</div>
        </div>

        {description && <div className="service-card-desc">{description}</div>}

        {actionText && (
          <div className="service-card-bottom">
            {price !== undefined && (
              <div className="service-card-price-left">
                {typeof price === "number"
                  ? `₦${price.toLocaleString()}`
                  : price}
              </div>
            )}
            <div className="service-card-action-wrap">
              <SolidButton
                text={actionText}
                size="medium"
                variant="primary"
                onClick={onAction}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
