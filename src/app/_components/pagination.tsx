import { Button } from '@material-tailwind/react'
interface PaginationProps {
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  total: number
  disabled?: boolean
}
export default function Pagination({
  currentPage,
  setCurrentPage,
  total,
  disabled = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / 10))

  return (
    <div className="border-slate-200 flex items-center justify-between border-t py-4">
      <small className="font-sans text-sm text-current antialiased">
        Halaman {currentPage} dari {totalPages}
      </small>
      <div className="flex gap-2">
        <Button
          variant="outlined"
          size="sm"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={disabled || currentPage === 1}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outlined"
          size="sm"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={disabled || currentPage === totalPages}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  )
}
