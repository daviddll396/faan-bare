import React, { useState } from "react";
import { Database } from "lucide-react";
import "./DataTable.css";

interface DataTableProps {
  headers: string[];
  data: React.ReactNode[][];
  className?: string;
  itemsPerPage?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  headers,
  data,
  className = "",
  itemsPerPage = 8,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

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
        {data.length === 0 ? (
          <div className="data-table-no-data">
            <div className="no-data-icon">
              <Database size={48} className="desktop-icon" />
              <Database size={36} className="mobile-icon" />
            </div>
            <div className="no-data-title">No Data Available</div>
            <div className="no-data-message">
              There are no records to display at the moment.
            </div>
          </div>
        ) : (
          <>
            <table className="data-table">
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
                {currentData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 1 ? "alt-row" : ""}
                  >
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="table-data-item">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Desktop Pagination - Inside table container */}
            {totalPages > 1 && (
              <div className="data-table-pagination">
                <div className="pagination-info">
                  Showing {startIndex + 1} to {Math.min(endIndex, data.length)}{" "}
                  of {data.length} entries
                </div>

                <div className="pagination-controls">
                  {/* Previous Button */}
                  <button
                    className={`pagination-btn ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
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
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Pagination Controls - Outside table container for better mobile experience */}
      {data.length > 0 && totalPages > 1 && (
        <div className="data-table-pagination-outer">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{" "}
            {data.length} entries
          </div>

          <div className="pagination-controls">
            {/* Previous Button */}
            <button
              className={`pagination-btn ${
                currentPage === 1 ? "disabled" : ""
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
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
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;
