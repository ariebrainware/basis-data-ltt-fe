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

export default function PhoneInput() {
  const [country, setCountry] = React.useState(0)

  return (
    <div className="w-full max-w-96">
      <Typography
        variant="small"
        color="blue-gray"
        className="font-sans text-sm font-semibold text-slate-800 antialiased dark:text-white"
        placeholder="sss"
        onPointerEnterCapture={() => {}}
        onPointerLeaveCapture={() => {}}
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
              className="border-blue-gray-200 h-10 w-14 shrink-0 rounded-r-none border border-r-0 bg-transparent px-3"
              placeholder=""
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              {CODES[country]}
            </Button>
          </MenuHandler>
          <MenuList
            className="max-h-80 max-w-72"
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            {COUNTRIES.map((country, index) => {
              return (
                <MenuItem
                  key={country}
                  value={country}
                  onClick={() => setCountry(index)}
                  placeholder=""
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  {country}
                </MenuItem>
              )
            })}
          </MenuList>
        </Menu>
        <Input
          type="tel"
          pattern="[0-9]*"
          inputMode="numeric"
          maxLength={12}
          placeholder="324-456-2323"
          className="!border-t-blue-gray-200 placeholder:text-blue-gray-300 appearance-none rounded-l-none placeholder:opacity-100 focus:!border-t-gray-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          labelProps={{
            className: 'before:content-none after:content-none',
          }}
          containerProps={{
            className: 'min-w-0',
          }}
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          crossOrigin=""
        />
      </div>
    </div>
  )
}
