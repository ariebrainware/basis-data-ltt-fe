import { Card, Input, Textarea } from '@material-tailwind/react'
import { DiseaseType } from '../_types/disease'

interface DiseaseFormProps extends DiseaseType {
  // No additional props needed for disease form
}

export function DiseaseForm({ ID, name, description }: DiseaseFormProps) {
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
        <div className="mb-1 flex w-full flex-col gap-4">
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
            id="name"
            type="text"
            label="Nama Penyakit"
            defaultValue={name}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <Textarea
            id="description"
            label="Deskripsi"
            defaultValue={description}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
        </div>
      </form>
    </Card>
  )
}
