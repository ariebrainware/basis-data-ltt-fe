'use client'
import React from 'react'
import {
  Input,
  Menu,
  MenuHandler,
  Button,
  Typography,
} from '@material-tailwind/react'

export default function WeightHeightInput() {
  const [fromAmount, setFromAmount] = React.useState('')
  const [toAmount, setToAmount] = React.useState('')

  return (
    <div className="mx-auto mt-4 w-full max-w-xl">
      <div className="flex flex-col items-center justify-between">
        <div className="mt-4 w-full max-w-sm">
          <Typography
            variant="small"
            color="blue-gray"
            className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Berat Badan
          </Typography>
          <div className="relative flex w-full max-w-sm">
            <Input
              type="number"
              placeholder="65"
              className="appearance-none rounded-r-none !border-t-blue-gray-200 placeholder:text-blue-gray-300  placeholder:opacity-100 focus:!border-t-gray-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              labelProps={{
                className: 'before:content-none after:content-none',
              }}
              containerProps={{
                className: 'min-w-0',
              }}
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Menu placement="bottom-start">
              <MenuHandler>
                <Button
                  ripple={false}
                  variant="text"
                  color="blue-gray"
                  className="h-10 w-14 shrink-0 rounded-l-none border border-l-0 border-blue-gray-200 bg-transparent px-3"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                >
                  KG
                </Button>
              </MenuHandler>
            </Menu>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <Typography
            variant="small"
            color="blue-gray"
            className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Tinggi Badan
          </Typography>
          <div className="relative flex w-full">
            <Input
              type="number"
              placeholder="165"
              className="appearance-none rounded-r-none !border-t-blue-gray-200 placeholder:text-blue-gray-300  placeholder:opacity-100 focus:!border-t-gray-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              labelProps={{
                className: 'before:content-none after:content-none',
              }}
              containerProps={{
                className: 'min-w-0',
              }}
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Menu placement="bottom-start">
              <MenuHandler>
                <Button
                  ripple={false}
                  variant="text"
                  color="blue-gray"
                  className="h-10 w-14 shrink-0 rounded-l-none border border-l-0 border-blue-gray-200 bg-transparent px-3"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                >
                  CM
                </Button>
              </MenuHandler>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}
