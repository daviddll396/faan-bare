import React from "react";
import "./pagetitle.css";

import { ArrowLeft } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  icon?: string;
}

interface PageTitleProps {
  icon?: string;
  title: string;
  subtitle?: string;
  className?: string;
  breadcrumb?: BreadcrumbItem[];
  onBreadcrumbClick?: (idx: number) => void;
  onBackClick?: () => void;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  className = "",
  breadcrumb,
  onBreadcrumbClick,
  onBackClick,
}) => {
  // showBack when we're in a subpage (breadcrumb exists) or an explicit onBackClick is provided
  const showBack =
    Boolean(onBackClick) || (breadcrumb && breadcrumb.length > 0);

  const handleBack = () => {
    if (onBackClick) return onBackClick();

    // If breadcrumb click handler exists, navigate to the parent breadcrumb (one level up)
    if (onBreadcrumbClick && breadcrumb && breadcrumb.length > 0) {
      const parentIdx = breadcrumb.length > 1 ? breadcrumb.length - 2 : 0;
      try {
        return onBreadcrumbClick(parentIdx);
      } catch (err) {
        // ignore and fallthrough to history.back
      }
    }

    // fallback: navigate back in history
    if (typeof window !== "undefined") window.history.back();
  };

  // Determine title/subtitle using breadcrumb when available
  let renderTitle = title;
  let renderSubtitle = subtitle;
  if (breadcrumb && breadcrumb.length > 0) {
    renderTitle = breadcrumb[0].label || title;
    if (!subtitle && breadcrumb.length > 1) {
      renderSubtitle = breadcrumb[breadcrumb.length - 1].label;
    }
  }

  return (
    <div className={`page-title-main ${className}`}>
      <div>
        <h2 className="page-title">
          {" "}
          {showBack && (
            <button
              className="mobile-back-btn"
              onClick={handleBack}
              aria-label="Go back"
            >
              <ArrowLeft size={30} />
            </button>
          )}
          {renderTitle}
        </h2>
        {renderSubtitle && <p className="page-subtitle">{renderSubtitle}</p>}
      </div>
    </div>
  );
};

export default PageTitle;
