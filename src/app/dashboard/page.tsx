'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import MegaMenuDefault from '../_components/megaMenu'
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline'
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  CardFooter,
  Input,
} from '@material-tailwind/react'
import { TreatmentType } from '../_types/treatment'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import Pagination from '../_components/pagination'

const TABLE_HEAD = [
  'Patient Name (P. Code)',
  'Date/Time',
  'Therapist (ID)',
  'Keluhan',
]

// const TREATMENT_DATA = [
//   {
//     patientName: 'Angga (A123)',
//     age: 30,
//     datetime: '2025-10-14 15:00',
//     therapist: 'Senior Afrizal',
//     issues: 'Vertigaul',
//   },
//   {
//     patientName: 'Gunawan (G123)',
//     age: 26,
//     datetime: '2025-10-14 16:00',
//     therapist: 'Master Nofianto',
//     issues: 'Keram betis',
//   },
//   {
//     patientName: 'Ratu (R123)',
//     age: 19,
//     datetime: '2025-10-14 17:00',
//     therapist: 'Senior Eric',
//     issues: 'Lower Back Pain',
//   },
//   {
//     patientName: 'Zandaya (Z123)',
//     age: 98,
//     datetime: '2025-10-14 18:00',
//     therapist: 'Master Robert',
//     issues: 'HNP L9-S1',
//   },
//   {
//     patientName: 'Peter (P123)',
//     age: 43,
//     datetime: '2025-10-14 19:00',
//     therapist: 'Master Eddy',
//     issues: 'Frozen Shoulder',
//   },
// ]

interface ListTreatmentResponse {
  data: {
    treatment: TreatmentType[]
  }
  total: number
}

function useFetchTreatment(
  currentPage: number,
  keyword: string
): ListTreatmentResponse {
  const [treatment, setTreatment] = useState<TreatmentType[]>([])
  const [total, setTotal] = useState(0)
  const host = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'

  useEffect(() => {
    ;(async () => {
      try {
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        const groupByDate = `${yyyy}-${mm}-${dd}`
        // const customDate = `2025-09-13`
        const res = await fetch(
          `${host}/patient/treatment?group_by_date=${groupByDate}`,
          {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
              'session-token': localStorage.getItem('session-token') ?? '',
            },
          }
        )
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        const treatmentArray: TreatmentType[] = Array.isArray(
          data.data.treatments
        )
          ? data.data.treatments
          : []
        setTreatment(treatmentArray)
        console.log(`data: `, data.data.treatments)
        console.log(`treatmentArray: `, treatmentArray)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess()
        }
        console.error('Error fetching treatment:', error)
      }
    })()
  }, [currentPage, host, keyword])

  return { data: { treatment: treatment }, total }
}
export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [treatment, setTreatment] = useState<TreatmentType[]>([])
  const [keyword] = useState('')
  const { data, total } = useFetchTreatment(currentPage, keyword)
  useEffect(() => {
    setTreatment(data.treatment)
  }, [data])
  return (
    <div>
      <MegaMenuDefault />

      <Card
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
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
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
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
                Jadwal Penanganan Hari Ini
              </Typography>
            </div>
            <div className="flex w-full shrink-0 gap-2 md:w-max">
              <div className="w-full md:w-72">
                <Input
                  label="Search"
                  icon={<MagnifyingGlassIcon className="size-5" />}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  crossOrigin={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                />
              </div>
              <Button
                className="flex items-center gap-3"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
                onClick={() =>
                  window.open('/patient/treatment/register', '_blank')
                }
              >
                <PlusCircleIcon strokeWidth={2} className="size-4" /> Tambah
                Penanganan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody
          className="overflow-scroll px-0"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                      placeholder={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      onResize={undefined}
                      onResizeCapture={undefined}
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {treatment.map(
                (
                  {
                    patient_name,
                    patient_code,

                    treatment_date,
                    therapist_name,
                    therapist_id,
                    issues,
                  },
                  index
                ) => {
                  const isLast = index === treatment.length - 1
                  const classes = isLast
                    ? 'p-4'
                    : 'p-4 border-b border-blue-gray-50'

                  return (
                    <tr key={patient_name}>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            onResize={undefined}
                            onResizeCapture={undefined}
                          >
                            {patient_name} ({patient_code})
                          </Typography>
                        </div>
                      </td>
                      {/* <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                          placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                          onResize={undefined}
                          onResizeCapture={undefined}
                        >
                          {age}
                        </Typography>
                      </td> */}
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                          placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                          onResize={undefined}
                          onResizeCapture={undefined}
                        >
                          {treatment_date}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                          placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                          onResize={undefined}
                          onResizeCapture={undefined}
                        >
                          {therapist_name} ({therapist_id})
                        </Typography>
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-70"
                              placeholder={undefined}
                              onPointerEnterCapture={undefined}
                              onPointerLeaveCapture={undefined}
                              onResize={undefined}
                              onResizeCapture={undefined}
                            >
                              {issues}
                            </Typography>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                }
              )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter
          className="flex items-center justify-between border-t border-blue-gray-50 p-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            total={total}
          />
        </CardFooter>
      </Card>
    </div>
  )
}
