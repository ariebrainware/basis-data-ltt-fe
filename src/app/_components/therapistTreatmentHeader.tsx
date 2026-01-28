import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { CardHeader, Input, Typography, Button } from '@material-tailwind/react'
import React from 'react'

interface Props {
  onLogout: () => void | Promise<void>
  onSearchEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function TherapistTreatmentHeader({
  onLogout,
  onSearchEnter,
}: Props) {
  return (
    <CardHeader
      floated={false}
      shadow={false}
      className="rounded-none"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <div className="mb-8 flex items-center justify-between gap-8">
        <div>
          <Typography
            variant="h5"
            color="blue-gray"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Daftar Penanganan
          </Typography>
          <Typography
            color="gray"
            className="mt-1 font-normal"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Lihat dan lengkapi informasi penanganan pasien
          </Typography>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            variant="outlined"
            size="sm"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onClick={async () => {
              await onLogout()
            }}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Log Out
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="w-full md:w-72">
          <Input
            label="Cari Penanganan"
            icon={<MagnifyingGlassIcon className="size-5" />}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onKeyDown={onSearchEnter}
            onResize={undefined}
            onResizeCapture={undefined}
          />
        </div>
      </div>
    </CardHeader>
  )
}
