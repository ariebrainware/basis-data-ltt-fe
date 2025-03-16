interface PaginationProps {
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  total: number
}
export default function Pagination({
  currentPage,
  setCurrentPage,
  total,
}: PaginationProps) {
  return (
    <div className="border-slate-200 flex items-center justify-between border-t py-4">
      <small className="font-sans text-sm text-current antialiased">
        Halaman {currentPage} dari {Math.ceil(total / 10)}
      </small>
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="border-slate-200 text-slate-800 hover:bg-slate-200 inline-flex select-none items-center justify-center rounded-md border bg-transparent px-3 py-1.5 text-center align-middle font-sans text-sm font-medium shadow-sm transition-all duration-300 ease-in hover:shadow focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[width=full]:w-full data-[shape=pill]:rounded-full"
          data-shape="default"
          data-width="default"
        >
          Sebelumnya
        </button>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === Math.ceil(total / 10)}
          className="border-slate-200 text-slate-800 hover:bg-slate-200 inline-flex select-none items-center justify-center rounded-md border bg-transparent px-3 py-1.5 text-center align-middle font-sans text-sm font-medium shadow-sm transition-all duration-300 ease-in hover:shadow focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[width=full]:w-full data-[shape=pill]:rounded-full"
          data-shape="default"
          data-width="default"
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}
