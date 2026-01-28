'use client'
import styles from '../page.module.css'
import { useState, useRef, type ComponentProps, type RefObject } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '../_components/footer'
import { Checkbox, Radio } from '@material-tailwind/react'
import { apiFetch } from '../_functions/apiFetch'
import { DiseaseMultiSelect } from '../_components/selectDisease'
import { extractErrorMessage } from '../_functions/errorMessage'
import Swal from 'sweetalert2'

type GenderValue = 'male' | 'female' | ''

const INPUT_CLASS =
  'border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-lg border bg-transparent p-3 text-base shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white'

const TEXTAREA_CLASS =
  'border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer block w-full resize-none rounded-lg border bg-transparent p-3.5 text-base leading-none outline-none ring-4 ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white'

export default function Register() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<GenderValue>('')
  const [age, setAge] = useState<number | ''>('')
  const [job, setJob] = useState('')
  const [address, setAddress] = useState('')
  const [surgeryHistory, setSurgeryHistory] = useState('')
  const [healthHistory, setHealthHistory] = useState<string[]>([])
  const {
    phones: phoneNumbers,
    updatePhoneAt,
    addPhoneInput,
    removePhoneAt,
    maxInputs: maxPhoneInputs,
  } = usePhoneFields()
  const [showPatientCode, setShowPatientCode] = useState(false)
  const patientCodeRef = useRef<HTMLInputElement | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  async function sendRegisterRequest() {
    if (!fullName.trim()) {
      await Swal.fire('Gagal', 'Nama lengkap wajib diisi', 'error')
      return
    }
    if (!gender) {
      await Swal.fire('Gagal', 'Jenis kelamin wajib dipilih', 'error')
      return
    }
    const validPhones = phoneNumbers.filter((p) => p && p.trim())
    if (validPhones.length === 0) {
      await Swal.fire('Gagal', 'Minimal satu nomor telepon wajib diisi', 'error')
      return
    }
    if (!termsAccepted) {
      await Swal.fire(
        'Gagal',
        'Anda harus menyetujui syarat dan ketentuan',
        'error'
      )
      return
    }

    const payload = {
      full_name: fullName,
      gender,
      age: normalizeAge(age),
      job,
      address,
      health_history: healthHistory,
      surgery_history: surgeryHistory,
      phone_number: validPhones.join(', '),
      patient_code: patientCodeRef.current?.value || '',
    }

    try {
      const res = await apiFetch('/patient', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (res.ok) {
        await Swal.fire({
          title: 'Sukses',
          text: 'Registrasi berhasil. Silakan login dengan akun baru Anda.',
          icon: 'success',
          confirmButtonText: 'OK',
        })
        router.push('/login')
      }
      const msg = extractErrorMessage(responseData, 'Registrasi gagal')
      await Swal.fire('Gagal', msg, 'error')
      return { ok: false, data: responseData }
    } catch (err) {
      await Swal.fire('Gagal', 'Terjadi kesalahan jaringan', 'error')
      return { ok: false, error: err }
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold antialiased">
          Form Registrasi Pasien
        </h1>

        <LabeledField
          id="fullName"
          required
          placeholder="Nama Lengkap"
          value={fullName}
          onValueChange={setFullName}
        />

        <GenderSelector value={gender} onChange={setGender} />

        <LabeledField
          id="age"
          name="age"
          type="number"
          placeholder="Umur"
          value={age === '' ? '' : String(age)}
          onValueChange={(value) => {
            if (value === '') {
              setAge('');
              return;
            }

            if (/^\d+$/.test(value)) {
              setAge(Number(value));
            }
            // Ignore invalid numeric strings to avoid setting age to NaN
          }}
        />

        <LabeledField
          id="job"
          name="job"
          placeholder="Pekerjaan"
          value={job}
          onValueChange={setJob}
        />

        <LabeledField
          as="textarea"
          id="address"
          name="address"
          rows={8}
          placeholder="Alamat"
          value={address}
          onValueChange={setAddress}
        />

        <DiseaseMultiSelect
          id="healthHistorySelect"
          label="Riwayat Penyakit"
          value={healthHistory}
          onChange={setHealthHistory}
        />

        <LabeledField
          as="textarea"
          id="surgeryHistory"
          name="surgeryHistory"
          rows={8}
          placeholder="Riwayat Operasi / Penyakit Tambahan (Jika ada)"
          value={surgeryHistory}
          onValueChange={setSurgeryHistory}
        />

        <PhoneNumberList
          phones={phoneNumbers}
          onChange={updatePhoneAt}
          onAdd={addPhoneInput}
          onRemove={removePhoneAt}
          max={maxPhoneInputs}
        />

        <LegacyPatientCodeSection
          show={showPatientCode}
          toggle={() => setShowPatientCode((prev) => !prev)}
          inputRef={patientCodeRef}
        />

        <div className={styles.ctas}>
          <a
            className={
              termsAccepted ? styles.primary : 'bg-slate-200 cursor-not-allowed'
            }
            id="registerBtn"
            href="#"
            onClick={async (e) => {
              e.preventDefault()
              if (!termsAccepted) {
                return
              }
              await sendRegisterRequest()
            }}
          >
            DAFTAR
          </a>
        </div>

        <TermsAgreement
          checked={termsAccepted}
          onToggle={() => setTermsAccepted((prev) => !prev)}
        />
      </main>
      <Footer />
    </div>
  )
}

function normalizeAge(value: number | ''): number {
  return typeof value === 'number' ? value : 0
}

function usePhoneFields(maxInputs = 3) {
  const [phones, setPhones] = useState<string[]>([''])

  const sanitizePhone = (val: string) => val.replace(/[^\d+]/g, '')

  const updatePhoneAt = (index: number, value: string) => {
    setPhones((prev) => {
      const copy = [...prev]
      copy[index] = sanitizePhone(value)
      return copy
    })
  }

  const addPhoneInput = () => {
    setPhones((prev) => {
      if (prev.length >= maxInputs) return prev
      return [...prev, '']
    })
  }

  const removePhoneAt = (index: number) => {
    setPhones((prev) => {
      // Prevent removing the last remaining phone entry and ignore invalid indices
      if (prev.length <= 1) return prev
      if (index < 0 || index >= prev.length) return prev
      return prev.filter((_, i) => i !== index)
    })
  }

  return { phones, updatePhoneAt, addPhoneInput, removePhoneAt, maxInputs }
}

type BaseFieldProps = {
  onValueChange: (value: string) => void
  containerClassName?: string
  label?: string
}

type InputFieldProps = BaseFieldProps &
  Omit<ComponentProps<'input'>, 'onChange' | 'className'> & {
    as?: 'input'
  }

type TextareaFieldProps = BaseFieldProps &
  Omit<ComponentProps<'textarea'>, 'onChange' | 'className'> & {
    as: 'textarea'
  }

type LabeledFieldProps = InputFieldProps | TextareaFieldProps

function LabeledField({
  onValueChange,
  containerClassName,
  label,
  as = 'input',
  ...props
}: LabeledFieldProps) {
  const className = as === 'textarea' ? TEXTAREA_CLASS : INPUT_CLASS

  return (
    <div className={containerClassName ?? 'relative w-full'}>
      {label ? (
        <label
          htmlFor={props.id}
          className="text-slate-600 mb-1 block text-sm font-medium"
        >
          {label}
        </label>
      ) : null}
      {as === 'textarea' ? (
        <textarea
          {...(props as ComponentProps<'textarea'>)}
          className={className}
          onChange={(event) => onValueChange(event.target.value)}
        />
      ) : (
        <input
          {...(props as ComponentProps<'input'>)}
          className={className}
          onChange={(event) => onValueChange(event.target.value)}
        />
      )}
    </div>
  )
}

type GenderSelectorProps = {
  value: GenderValue
  onChange: (value: GenderValue) => void
}

function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <div
      className="flex items-center gap-4"
      role="radiogroup"
      aria-label="gender"
    >
      <GenderRadio
        id="gender_male"
        label="Pria"
        value="male"
        checked={value === 'male'}
        onSelect={() => onChange('male')}
      />
      <GenderRadio
        id="gender_female"
        label="Wanita"
        value="female"
        checked={value === 'female'}
        onSelect={() => onChange('female')}
      />
    </div>
  )
}

type GenderRadioProps = {
  id: string
  label: string
  checked: boolean
  onSelect: () => void
}

function GenderRadio({ id, label, checked, onSelect }: GenderRadioProps) {
  return (
    <label htmlFor={id} className="text-slate-600 flex items-center gap-2">
      <Radio
        id={id}
        name="gender"
        checked={checked}
        onChange={onSelect}
        crossOrigin={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      />
      <span className="font-sans text-base antialiased">{label}</span>
    </label>
  )
}

type PhoneNumberListProps = {
  phones: string[]
  onChange: (index: number, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  max: number
}

function PhoneNumberList({
  phones,
  onChange,
  onAdd,
  onRemove,
  max,
}: PhoneNumberListProps) {
  return (
    <div>
      <label className="text-slate-700 mb-2 block text-sm font-medium">
        Nomor Telepon
      </label>
      {phones.map((phone, idx) => (
        <div key={phone || `phone-${idx}`} className="mb-2 flex items-center gap-2">
          <input
            id={`phone-${idx}`}
            name={`phone-${idx}`}
            value={phone}
            onChange={(e) => onChange(idx, e.target.value)}
            type="text"
            placeholder={
              idx === 0 ? 'Nomor Telepon' : 'Nomor Telepon (Opsional)'
            }
            className={INPUT_CLASS}
          />
          {idx > 0 && (
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="rounded bg-red-500 px-3 py-2 text-white"
            >
              Hapus
            </button>
          )}
        </div>
      ))}
      {phones.length < max && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Tambah Nomor Telepon
        </button>
      )}
    </div>
  )
}

type LegacyPatientCodeSectionProps = {
  show: boolean
  toggle: () => void
  inputRef: RefObject<HTMLInputElement | null>
}

function LegacyPatientCodeSection({
  show,
  toggle,
  inputRef,
}: LegacyPatientCodeSectionProps) {
  return (
    <div>
      <Checkbox
        label="Data Pasien Lama (Opsional)"
        id="legacyPatientCodeCheckbox"
        checked={show}
        onChange={toggle}
        crossOrigin={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      />
      {show && (
        <div className="relative mt-2 w-full">
          <input
            type="text"
            id="patientCode"
            name="patientCode"
            placeholder="Kode Pasien"
            ref={inputRef}
            className={INPUT_CLASS}
          />
        </div>
      )}
    </div>
  )
}

type TermsAgreementProps = {
  checked: boolean
  onToggle: () => void
}

function TermsAgreement({ checked, onToggle }: TermsAgreementProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        className="relative flex cursor-pointer items-center"
        htmlFor="termConditionCheckbox"
      >
        <Checkbox
          id="termConditionCheckbox"
          checked={checked}
          onChange={onToggle}
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
          <svg
            fill="none"
            width="18px"
            height="18px"
            strokeWidth="2"
            color="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 13L9 17L19 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </label>
      <label
        className="text-slate-600 cursor-pointer antialiased"
        htmlFor="termConditionCheckbox"
      >
        Saya setuju dengan{' '}
        <a
          href="/termcondition"
          target="_blank"
          rel="noreferrer"
          className="text-slate-800 underline"
        >
          syarat dan ketentuan
        </a>
      </label>
    </div>
  )
}
