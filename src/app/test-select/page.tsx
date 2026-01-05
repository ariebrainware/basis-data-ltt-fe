'use client'
import React from 'react'
import { Select, Option } from '@material-tailwind/react'

export default function TestSelectPage() {
  const [value, setValue] = React.useState<string | undefined>(undefined)
  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Material Select Test</h1>
      <div className="w-72">
        <Select
          label="Choose"
          value={value}
          onChange={(v) => {
            // eslint-disable-next-line no-console
            console.log('TestSelect.onChange', v)
            setValue(String(v))
          }}
        >
          <Option value="1">One</Option>
          <Option value="2">Two</Option>
          <Option value="3">Three</Option>
        </Select>
      </div>
      <p className="mt-4">Current value: {value}</p>
    </main>
  )
}
