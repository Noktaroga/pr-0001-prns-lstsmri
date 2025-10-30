import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const getPaginationRange = (totalPages: number, currentPage: number): (number | string)[] => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage < 5) {
        return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage > totalPages - 4) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = getPaginationRange(totalPages, currentPage);

    const buttonClasses = "rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed";
    const activeButtonClasses = "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900";

    return (
        <nav className="flex items-center justify-center gap-2 flex-wrap" aria-label="Pagination">
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className={buttonClasses}
            >
                Begin
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={buttonClasses}
            >
                &laquo; Prev
            </button>
            
            {pageNumbers.map((page, index) =>
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`${buttonClasses} ${currentPage === page ? activeButtonClasses : ''}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className="px-3 py-1.5 text-sm text-neutral-500">
                        ...
                    </span>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={buttonClasses}
            >
                Next &raquo;
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={buttonClasses}
            >
                End
            </button>
        </nav>
    );
};