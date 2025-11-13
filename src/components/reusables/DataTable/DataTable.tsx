import React, { useState } from "react";
import "./DataTable.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmptyState from "../EmptyState/EmptyState";

interface DataTableProps {
  headers: string[];
  data: React.ReactNode[][];
  className?: string;
  itemsPerPage?: number;
  header?: React.ReactNode; // optional header (e.g., title or custom node)
}

const DataTable: React.FC<DataTableProps> = ({
  headers,
  data,
  className = "",
  itemsPerPage = 8,
  header,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Show newest first: reverse order without mutating props
  const orderedData = React.useMemo(() => [...data].reverse(), [data]);

  // Calculate pagination
  const totalPages = Math.ceil(orderedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = orderedData.slice(startIndex, endIndex);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for navigation
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Near start: show first 3 + ellipsis + last
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: show first + ellipsis + last 3
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle: show first + ellipsis + current-1, current, current+1 + ellipsis + last
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <div className={`data-table-card ${className}`}>
        {header && <div className="data-table-header">{header}</div>}
        {orderedData.length === 0 ? (
          <EmptyState
            title="No Data Available"
            message="There are no records to display at the moment."
            className="data-table-no-data"
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table" role="table">
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index} className="table-header-item">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, rowIndex) => {
                    const globalIndex = startIndex + rowIndex;
                    return (
                      <tr
                        key={`row-${globalIndex}`}
                        className={rowIndex % 2 === 1 ? "alt-row" : ""}
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`cell-${globalIndex}-${cellIndex}`}
                            className="table-data-item"
                            data-label={headers[cellIndex] || ""}
                            role="cell"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination Controls - Always outside table container */}
      {orderedData.length > 0 && totalPages > 1 && (
        <div className="data-table-pagination-outer">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, orderedData.length)}{" "}
            of {orderedData.length} entries
          </div>

          <div className="pagination-controls">
            {/* Previous Button */}
            <button
              className={`pagination-btn ${
                currentPage === 1 ? "disabled" : ""
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            <div className="pagination-pages">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  className={`pagination-page ${
                    page === currentPage ? "active" : ""
                  } ${page === "..." ? "ellipsis" : ""}`}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={page === "..."}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              className={`pagination-btn ${
                currentPage === totalPages ? "disabled" : ""
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;
