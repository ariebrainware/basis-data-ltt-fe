import { useState } from 'react'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { TherapistType } from '../_types/therapist'
import { ControlledSelect } from './selectTherapistRole'

interface TherapistForm extends TherapistType {
  onRoleChange: (newRole: string) => void
}
export const TherapistForm: React.FC<TherapistForm> = ({
  ID,
  is_approved: isApproved,
  full_name: fullName,
  email,
  phone_number: phoneNumber,
  address,
  date_of_birth: dateOfBirth,
  nik,
  weight,
  height,
  onRoleChange,
  role: initialRole = '',
}: TherapistForm) => {
  const [role, setRole] = useState<string>(initialRole)

  return (
    <Card
      color="transparent"
      shadow={false}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <form className="mb-2 mt-8 w-80 max-w-screen-lg sm:w-96">
        <div className="mb-1 flex w-72 gap-6">
          <div className="flex flex-col items-center gap-4">
            <Input
              id="ID"
              type="text"
              label="ID"
              disabled
              defaultValue={ID}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="is_approved"
              type="text"
              label="Status"
              disabled
              defaultValue={isApproved ? 'Approved' : 'Not Approved'}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="full_name"
              type="text"
              label="Full Name"
              defaultValue={fullName}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="email"
              type="text"
              label="Email"
              defaultValue={email}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="phone_number"
              type="text"
              label="Phone Number"
              defaultValue={phoneNumber}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="address"
              type="text"
              label="Address"
              defaultValue={address}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="date_of_birth"
              type="text"
              label="Date of Birth"
              defaultValue={dateOfBirth}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <Textarea
              id="nik"
              label="NIK"
              defaultValue={nik}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="weight"
              label="Weight"
              defaultValue={weight}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="height"
              label="Height"
              defaultValue={height}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <ControlledSelect
              id="role"
              label="Role"
              value={role}
              onChange={(value) => {
                setRole(value)
                onRoleChange(value)
                console.log('Selected role:', value)
              }}
            />
          </div>
        </div>
      </form>
    </Card>
  )
}
