import type { PageSelectorProp } from "../types/inputProps"

export const PageSelector = ({ currentPage, totalPages, handlePageChange }: PageSelectorProp) => {
  return (
    <div className="w-full flex justify-center items-center gap-2 py-6 border-t border-white/50">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
      >
        Prev
      </button>
      <span className="px-3 py-1 border rounded text-sm">{currentPage}</span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}