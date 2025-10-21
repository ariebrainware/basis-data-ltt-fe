'use client'
import * as React from 'react'
import {
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
  Typography,
} from '@material-tailwind/react'

const COUNTRIES = ['Indonesia (+62)', 'Malaysia (+60)', 'Singapore (+65)']
const CODES = ['+62', '+60', '+65']

interface PhoneInputProps {
  id?: string
}

export default function PhoneInput({ id }: PhoneInputProps) {
  const [country, setCountry] = React.useState(0)

  return (
    <div className="w-full max-w-96">
      <Typography
        variant="small"
        color="blue-gray"
        className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
        placeholder="s"
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        Nomor Telepon
      </Typography>
      <div className="relative flex w-full">
        <Menu placement="bottom-start">
          <MenuHandler>
            <Button
              ripple={false}
              variant="text"
              color="blue-gray"
              className="h-10 w-14 shrink-0 rounded-r-none border border-r-0 border-blue-gray-200 bg-transparent px-3"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              {CODES[country]}
            </Button>
          </MenuHandler>
          <MenuList
            className="max-h-80 max-w-72"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            {COUNTRIES.map((country, index) => (
              <MenuItem
                key={country}
                onClick={() => setCountry(index)}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                {country}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Input
          id={id}
          type="tel"
          pattern="[0-9]*"
          inputMode="numeric"
          maxLength={12}
          placeholder="324-456-2323"
          className="appearance-none rounded-l-none !border-t-blue-gray-200 placeholder:text-blue-gray-300 placeholder:opacity-100 focus:!border-t-gray-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          labelProps={{ className: 'before:content-none after:content-none' }}
          containerProps={{ className: 'min-w-0' }}
          onKeyDown={(e) => {
            if (
              !/[0-9]/.test(e.key) &&
              !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)
            ) {
              e.preventDefault()
            }
          }}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          crossOrigin={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        />
      </div>
    </div>
  )
}
