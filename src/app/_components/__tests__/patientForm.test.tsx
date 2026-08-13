import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PatientForm } from '../patientForm'
import { PatientType } from '@/app/_types/patient'
import { DiseaseType } from '@/app/_types/disease'

// Mock Material Tailwind components
jest.mock('@material-tailwind/react', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Input: (props: React.ComponentProps<'input'> & { label?: string }) => (
    <input
      {...props}
      id={props.id}
      data-testid={String(props.id)}
      aria-label={props.label}
    />
  ),
  Textarea: (props: React.ComponentProps<'textarea'> & { label?: string }) => (
    <textarea
      {...props}
      id={props.id}
      data-testid={String(props.id)}
      aria-label={props.label}
    />
  ),
}))

// Mock SignaturePad component
jest.mock('../signaturePad', () => ({
  SignaturePad: ({ onChange }: { onChange: (dataUrl: string) => void }) => (
    <div data-testid="signature-pad">
      <button
        type="button"
        data-testid="mock-sign-btn"
        onClick={() => onChange('data:image/png;base64,newMockSignature')}
      >
        Sign
      </button>
    </div>
  ),
}))

// Mock GenderSelect component
jest.mock('../selectGender', () => ({
  GenderSelect: ({
    id,
    label,
    value,
    onChange,
  }: {
    id?: string
    label: string
    value?: string
    onChange?: (value: string) => void
  }) => (
    <select
      id={id}
      data-testid={id}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label={label}
    >
      <option value="">Pilih Jenis Kelamin</option>
      <option value="male">Laki-laki</option>
      <option value="female">Perempuan</option>
      <option value="other">Lainnya</option>
    </select>
  ),
}))

// Mock DiseaseMultiSelect component
jest.mock('../selectDisease', () => ({
  DiseaseMultiSelect: ({
    id,
    label,
    value,
    onChange,
    options,
  }: {
    id?: string
    label?: string
    value?: string[]
    onChange: (values: string[]) => void
    options?: DiseaseType[]
  }) => (
    <select
      id={id}
      data-testid={id}
      multiple
      value={value}
      onChange={(e) => {
        const values = Array.from(e.target.selectedOptions).map((o) => o.value)
        onChange(values)
      }}
      aria-label={label}
    >
      {options && options.length > 0 ? (
        options.map((opt) => (
          <option key={opt.ID} value={String(opt.ID)}>
            {opt.name}
          </option>
        ))
      ) : (
        <>
          <option value="1">Diabetes</option>
          <option value="2">Hypertension</option>
          <option value="3">Asthma</option>
        </>
      )}
    </select>
  ),
}))

describe('PatientForm Component', () => {
  const mockPatient: PatientType = {
    ID: 1,
    full_name: 'John Doe',
    phone_number: ['+628123456789'],
    job: 'Software Engineer',
    age: 30,
    email: 'john@example.com',
    gender: 'male',
    address: 'Jl. Test No. 123',
    health_history: '1,2',
    surgery_history: 'None',
    patient_code: 'PAT001',
    last_visit: '',
    signature: 'data:image/png;base64,oldMockSignature',
  }

  test('renders patient form with all fields', () => {
    render(<PatientForm {...mockPatient} />)

    // Check if form is rendered
    expect(screen.getByTestId('card')).toBeInTheDocument()

    // Check if all input fields are present
    expect(screen.getByTestId('ID')).toBeInTheDocument()
    expect(screen.getByTestId('patient_code')).toBeInTheDocument()
    expect(screen.getByTestId('full_name')).toBeInTheDocument()
    expect(screen.getByTestId('phone_number')).toBeInTheDocument()
    expect(screen.getByTestId('job')).toBeInTheDocument()
    expect(screen.getByTestId('age')).toBeInTheDocument()
    expect(screen.getByTestId('email')).toBeInTheDocument()
    expect(screen.getByTestId('gender')).toBeInTheDocument()
    expect(screen.getByTestId('address')).toBeInTheDocument()
    expect(screen.getByTestId('health_history')).toBeInTheDocument()
    expect(screen.getByTestId('surgery_history')).toBeInTheDocument()
  })

  test('displays correct patient data', () => {
    render(<PatientForm {...mockPatient} />)

    // Check if data is displayed correctly
    expect(screen.getByTestId('ID')).toHaveValue('1')
    expect(screen.getByTestId('full_name')).toHaveValue('John Doe')
    expect(screen.getByTestId('phone_number')).toHaveValue('+628123456789')
    expect(screen.getByTestId('job')).toHaveValue('Software Engineer')
    expect(screen.getByTestId('age')).toHaveValue(30)
    expect(screen.getByTestId('email')).toHaveValue('john@example.com')
    expect(screen.getByTestId('gender')).toHaveValue('male')
    expect(screen.getByTestId('address')).toHaveValue('Jl. Test No. 123')
    expect(screen.getByTestId('health_history')).toHaveValue('1,2')
    expect(screen.getByTestId('surgery_history')).toHaveValue('None')
    expect(screen.getByTestId('patient_code')).toHaveValue('PAT001')
  })

  test('ID and patient_code fields are disabled', () => {
    render(<PatientForm {...mockPatient} />)

    expect(screen.getByTestId('ID')).toBeDisabled()
    expect(screen.getByTestId('patient_code')).toBeDisabled()
  })

  test('renders with empty data', () => {
    const emptyPatient: PatientType = {
      ID: 0,
      full_name: '',
      phone_number: [],
      job: '',
      age: 0,
      email: '',
      gender: '',
      address: '',
      health_history: '',
      surgery_history: '',
      patient_code: '',
      last_visit: '',
    }

    render(<PatientForm {...emptyPatient} />)

    expect(screen.getByTestId('full_name')).toHaveValue('')
    expect(screen.getByTestId('email')).toHaveValue('')
  })

  test('displays registered signature preview when signature is present', () => {
    render(
      <PatientForm
        {...mockPatient}
        signature="data:image/png;base64,oldMockSignature"
      />
    )

    // Check if the registered signature text is present
    expect(screen.getByText('Tanda Tangan Terdaftar')).toBeInTheDocument()

    // Check if the image displays the signature
    const img = screen.getByRole('img', { name: 'Tanda Tangan Pasien' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'data:image/png;base64,oldMockSignature')

    // Check that the hidden input has the value
    const hiddenInput = screen.getByTestId('signature')
    expect(hiddenInput).toHaveValue('data:image/png;base64,oldMockSignature')
  })

  test('displays signature pad when signature is not present or when user clicks edit', () => {
    const { rerender } = render(
      <PatientForm {...mockPatient} signature="" />
    )

    // Check if the empty signature message/status is present
    expect(screen.getByText('Belum Ada Tanda Tangan')).toBeInTheDocument()

    // Signature pad should be rendered
    expect(screen.getByTestId('signature-pad')).toBeInTheDocument()

    // Rerender with signature to test transition
    rerender(
      <PatientForm
        {...mockPatient}
        signature="data:image/png;base64,oldMockSignature"
      />
    )
    expect(screen.queryByTestId('signature-pad')).not.toBeInTheDocument()

    // Click "Ubah Tanda Tangan"
    const editBtn = screen.getByRole('button', { name: 'Ubah Tanda Tangan' })
    fireEvent.click(editBtn)

    // Signature pad should now show up
    expect(screen.getByTestId('signature-pad')).toBeInTheDocument()

    // Clicking mock sign button should update value
    const signBtn = screen.getByTestId('mock-sign-btn')
    fireEvent.click(signBtn)

    // Hidden input should be updated
    const hiddenInput = screen.getByTestId('signature')
    expect(hiddenInput).toHaveValue('data:image/png;base64,newMockSignature')
  })
})
