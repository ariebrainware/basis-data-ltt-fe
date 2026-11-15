import { useState } from 'react'
import { Card, Input } from '@material-tailwind/react'
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
  commission = '',
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
      <form className="mb-2 mt-4 w-full px-2 md:mt-8 md:px-0">
        <div className="mb-1 flex w-full flex-col gap-4 md:flex-row md:gap-6">
          {/* Left Column */}
          <div className="flex w-full flex-col gap-4 md:w-1/2">
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
          </div>

          {/* Right Column */}
          <div className="flex w-full flex-col gap-4 md:w-1/2">
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
            <Input
              id="commission"
              type="text"
              label="Komisi"
              defaultValue={commission}
              maxLength={200}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="nik"
              type="text"
              label="NIK"
              defaultValue={nik}
              maxLength={16}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="weight"
              type="number"
              label="Weight"
              defaultValue={weight}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="height"
              type="number"
              label="Height"
              defaultValue={height}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
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
