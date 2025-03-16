interface SubHeaderProps {
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleGroupingByDateFilter: (date: string) => Promise<void>
}
export default function SubHeader(handleSearchBox: SubHeaderProps) {
  const { handleInputKeyDown, handleGroupingByDateFilter } = handleSearchBox
  return (
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
      <div
        className="flex gap-2 data-[orientation=vertical]:flex-row data-[orientation=horizontal]:flex-col"
        data-orientation="horizontal"
      >
        <div
          role="tablist"
          className="bg-slate-100 dark:bg-slate-200 relative flex w-full shrink-0 rounded-md p-1 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col md:w-max"
          aria-orientation="horizontal"
          data-orientation="horizontal"
        >
          <button
            role="tab"
            className="text-slate-800 relative z-[2] inline-flex w-full select-none items-center justify-center px-3 py-1.5 text-center align-middle font-sans text-sm font-medium aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-white"
            data-active="true"
            aria-selected="true"
            onClick={() => handleGroupingByDateFilter('')}
          >
            Semua
          </button>
          <button
            role="tab"
            className="text-slate-800 relative z-[2] inline-flex w-full select-none items-center justify-center px-3 py-1.5 text-center align-middle font-sans text-sm font-medium aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-white"
            data-active="false"
            aria-selected="false"
            onClick={() => handleGroupingByDateFilter('last_3_months')}
          >
            3 bln
          </button>
          <button
            role="tab"
            className="text-slate-800 relative z-[2] inline-flex w-full select-none items-center justify-center px-3 py-1.5 text-center align-middle font-sans text-sm font-medium aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-white"
            data-active="false"
            aria-selected="false"
            onClick={() => handleGroupingByDateFilter('last_6_months')}
          >
            6 bln
          </button>
          <span
            style={{
              width: 0,
              height: 0,
              left: 0,
              top: 0,
              position: 'absolute',
              zIndex: 1,
            }}
            className="shadow-slate-800/10 rounded bg-white shadow-sm transition-all duration-300 ease-in"
          ></span>
        </div>
      </div>
      <div className="w-full md:w-72">
        <div className="relative w-full">
          <input
            data-icon-placement="start"
            placeholder="Cari berdasarkan Nama atau Kode Pasien"
            type="text"
            className="data-[error=true]:border-error data-[success=true]:border-success border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full select-none rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
            data-error="false"
            data-success="false"
            data-shape="default"
            onKeyDown={(e) => handleInputKeyDown(e)}
          />
          <span
            className="text-slate-600/70 peer-focus:text-slate-800 pointer-events-none absolute top-1/2 size-5 -translate-y-1/2 overflow-hidden transition-all duration-300 ease-in data-[placement=end]:right-2.5 data-[placement=start]:left-2.5 dark:peer-hover:text-white dark:peer-focus:text-white"
            data-error="false"
            data-success="false"
            data-placement="start"
          >
            <svg
              width="1.5em"
              height="1.5em"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="currentColor"
              className="size-5"
            >
              <path
                d="M17 17L21 21"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}
