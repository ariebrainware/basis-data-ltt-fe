'use client'
import styles from '../page.module.css'
import { useState, useRef, type ComponentProps, type RefObject } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '../_components/footer'
import { Checkbox, Radio } from '@material-tailwind/react'
import { apiFetch } from '../_functions/apiFetch'
import { getAttachmentUrl } from '../_functions/apiHost'
import { DiseaseMultiSelect } from '../_components/selectDisease'
import { extractErrorMessage } from '../_functions/errorMessage'
import Swal from 'sweetalert2'
import { SignaturePad, type SignaturePadRef } from '../_components/signaturePad'

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
  const [signature, setSignature] = useState('')
  const signaturePadRef = useRef<SignaturePadRef | null>(null)
  const [attachmentPaths, setAttachmentPaths] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      await Swal.fire('Gagal', 'Ukuran file maksimal adalah 10MB', 'error')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    const sanitizedName = file.name.replace(/,/g, '_')
    formData.append('file', file, sanitizedName)

    try {
      const res = await apiFetch('/patient/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        throw new Error('Upload failed')
      }
      const data = await res.json()
      setAttachmentPaths((prev) => [...prev, data.data.file_path])
    } catch (err) {
      console.error(err)
      await Swal.fire('Gagal', 'Gagal mengunggah file', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  async function sendRegisterRequest() {
    const validationError = validateRegistration(
      fullName,
      gender,
      phoneNumbers,
      termsAccepted
    )
    if (validationError) {
      await Swal.fire('Gagal', validationError, 'error')
      return
    }

    const payload = buildRegistrationPayload(
      fullName,
      gender,
      age,
      job,
      address,
      healthHistory,
      surgeryHistory,
      phoneNumbers,
      patientCodeRef.current?.value || '',
      signature,
      attachmentPaths
    )

    const result = await submitRegistration(payload)
    if (result.ok) {
      await Swal.fire({
        title: 'Sukses',
        text: 'Registrasi berhasil.',
        icon: 'success',
        confirmButtonText: 'OK',
      })

      // Clear form fields instead of redirecting
      setFullName('')
      setGender('')
      setAge('')
      setJob('')
      setAddress('')
      setSurgeryHistory('')
      setHealthHistory([])
      setShowPatientCode(false)
      setTermsAccepted(false)
      setSignature('')
      setAttachmentPaths([])
      signaturePadRef.current?.clear()

      // Clear phone inputs: remove extras and leave a single empty input
      try {
        for (let i = phoneNumbers.length - 1; i >= 1; i--) {
          removePhoneAt(i)
        }
        updatePhoneAt(0, '')
      } catch (e) {
        // Log defensively in case hook internals change, without breaking UX
        console.error(
          'Error while clearing phone numbers after successful registration:',
          e
        )
      }

      if (patientCodeRef.current) patientCodeRef.current.value = ''

      return { ok: true }
    }

    const msg = extractErrorMessage(
      result.data ?? result.error,
      'Registrasi gagal'
    )
    await Swal.fire('Gagal', msg, 'error')
    return result
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
              setAge('')
              return
            }

            if (/^\d+$/.test(value)) {
              setAge(Number(value))
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

        <SignaturePad ref={signaturePadRef} onChange={setSignature} />

        <input
          id="attachment_path"
          name="attachment_path"
          type="hidden"
          value={attachmentPaths.join(',')}
        />
        <div className="mt-4 w-full">
          <label className="text-slate-650 dark:text-slate-400 mb-1.5 block text-sm font-medium">
            Lampiran
          </label>
          <div className="space-y-2">
            {attachmentPaths.map((path, index) => (
              <div
                key={index}
                className="border-slate-200 dark:bg-slate-900/50 flex items-center justify-between gap-4 rounded-md border bg-white/50 p-2 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="dark:bg-blue-950/40 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:text-blue-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </span>
                  <div className="flex flex-col overflow-hidden text-xs">
                    <span className="text-slate-800 dark:text-slate-200 truncate font-semibold">
                      {path.split('/').pop()}
                    </span>
                    <a
                      href={getAttachmentUrl(path)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Lihat Lampiran
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAttachmentPaths((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1 hover:text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            <div>
              <label className="border-slate-350 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-3 transition-all">
                {isUploading ? (
                  <svg
                    className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-500"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
                <span className="text-slate-600 dark:text-slate-400 font-sans text-xs font-medium">
                  {isUploading
                    ? 'Mengunggah...'
                    : 'Pilih File (PDF, DOC, Gambar, dsb.)'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

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

function validateRegistration(
  fullName: string,
  gender: GenderValue,
  phoneNumbers: string[],
  termsAccepted: boolean
): string | null {
  if (!fullName.trim()) return 'Nama lengkap wajib diisi'
  if (!gender) return 'Jenis kelamin wajib dipilih'
  const validPhones = phoneNumbers.filter((p) => p && p.trim())
  if (validPhones.length === 0) return 'Minimal satu nomor telepon wajib diisi'
  if (!termsAccepted) return 'Anda harus menyetujui syarat dan ketentuan'
  return null
}

function buildRegistrationPayload(
  fullName: string,
  gender: GenderValue,
  age: number | '',
  job: string,
  address: string,
  healthHistory: string[],
  surgeryHistory: string,
  phoneNumbers: string[],
  patientCode: string,
  signature: string,
  attachmentPaths: string[]
) {
  const validPhones = phoneNumbers.filter((p) => p && p.trim())
  return {
    full_name: fullName,
    gender,
    age: normalizeAge(age),
    job,
    address,
    health_history: healthHistory,
    surgery_history: surgeryHistory,
    phone_number: validPhones,
    patient_code: patientCode,
    signature: signature,
    attachment_path: attachmentPaths,
  }
}

async function submitRegistration(payload: any) {
  try {
    const res = await apiFetch('/patient', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const responseData = await res.json().catch(() => null)
    if (res.ok) return { ok: true, data: responseData }
    return { ok: false, data: responseData }
  } catch (err) {
    return { ok: false, error: err }
  }
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

  // Exclude ref from spread to avoid cross-version React Ref type incompatibility
  const { ref: _ref, ...elementProps } = props as any

  return (
    <div className={containerClassName ?? 'relative w-full'}>
      {label ? (
        <label
          htmlFor={(props as any).id}
          className="text-slate-600 mb-1 block text-sm font-medium"
        >
          {label}
        </label>
      ) : null}
      {as === 'textarea' ? (
        <textarea
          {...(elementProps as any)}
          className={className}
          onChange={(event) => onValueChange(event.target.value)}
        />
      ) : (
        <input
          {...(elementProps as any)}
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
        checked={value === 'male'}
        onSelect={() => onChange('male')}
      />
      <GenderRadio
        id="gender_female"
        label="Wanita"
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
      <label>Nomor Telepon</label>
      {phones.map((phone, idx) => (
        <div className="mb-2 flex items-center gap-2" key={`phone-${idx}`}>
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
