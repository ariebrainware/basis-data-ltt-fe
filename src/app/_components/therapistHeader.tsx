'use client'
import { UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import {
  Typography,
  Button,
  Tabs,
  TabsHeader,
  Tab,
  Input,
} from '@material-tailwind/react'
import React from 'react'

type TabItem = { label: string; value: string }

interface Props {
  tabs: TabItem[]
  onAddClick: () => void
  onLogoutClick: () => Promise<void>
  onSearchEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function TherapistHeader({
  tabs,
  onAddClick,
  onLogoutClick,
  onSearchEnter,
}: Props) {
  return (
    <>
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
            Daftar Terapis
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
            Lihat semua informasi mengenai terapis
          </Typography>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            className="flex items-center gap-3"
            size="sm"
            onClick={onAddClick}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <UserPlusIcon strokeWidth={2} className="size-4" /> Tambah Terapis
          </Button>
          <Button
            variant="outlined"
            size="sm"
            onClick={onLogoutClick}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Log Out
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <Tabs value="all" className="w-full md:w-max">
          <TabsHeader
            placeholder={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {tabs.map(({ label, value }) => (
              <Tab
                key={value}
                value={value}
                placeholder={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                &nbsp;&nbsp;{label}&nbsp;&nbsp;
              </Tab>
            ))}
          </TabsHeader>
        </Tabs>
        <div className="w-full md:w-72">
          <Input
            label="Cari Terapis"
            onKeyDown={onSearchEnter}
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
        </div>
      </div>
    </>
  )
}
