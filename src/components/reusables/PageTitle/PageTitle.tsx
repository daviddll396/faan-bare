import React from "react";
import "./pagetitle.css";
import ChevronRight from "/icons/chevron-right.svg";
import { ChevronLeft } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  icon?: string;
}

interface PageTitleProps {
  icon: string;
  title: string;
  className?: string;
  breadcrumb?: BreadcrumbItem[];
  onBreadcrumbClick?: (idx: number) => void;
  onBackClick?: () => void;
}

const PageTitle: React.FC<PageTitleProps> = ({
  icon,
  title,
  className = "",
  breadcrumb,
  onBreadcrumbClick,
  onBackClick,
}) => {
  return (
    <div className={`page-title-section ${className}`}>
      {/* Mobile Back Button */}
      {onBackClick && (
        <button
          className="mobile-back-btn"
          onClick={onBackClick}
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {breadcrumb && breadcrumb.length > 0 ? (
        <div className="breadcrumb-trail">
          {breadcrumb.map((item, idx) => (
            <span className="breadcrumb-item" key={idx}>
              {idx < breadcrumb.length - 1 ? (
                <button
                  className="breadcrumb-link"
                  type="button"
                  onClick={() => onBreadcrumbClick && onBreadcrumbClick(idx)}
                >
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="breadcrumb-icon breadcrumb-icon-previous"
                    />
                  )}
                  <span className="breadcrumb-label breadcrumb-label-previous">
                    {item.label}
                  </span>
                </button>
              ) : (
                <>
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="breadcrumb-icon"
                    />
                  )}
                  <span className="breadcrumb-label">{item.label}</span>
                </>
              )}
              {idx < breadcrumb.length - 1 && (
                <img
                  src={ChevronRight}
                  alt="chevron"
                  className="breadcrumb-chevron-icon"
                />
              )}
            </span>
          ))}
        </div>
      ) : (
        <>
          <img src={icon} alt={title} className="desktop-only" />
          <h2>{title}</h2>
        </>
      )}
    </div>
  );
};

export default PageTitle;
