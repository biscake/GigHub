import type { PageSelectorProp } from "../types/inputProps"

export const PageSelector = ({ currentPage, totalPages, handlePageChange }: PageSelectorProp) => {
  return (
    <div className="w-full flex justify-center items-center gap-2 py-4 border-t-2 border-[#ebe0d5]">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        Prev
      </button>
      <span className="px-3 py-1 border rounded text-sm">{currentPage}</span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        Next
      </button>
    </div>
  )
}