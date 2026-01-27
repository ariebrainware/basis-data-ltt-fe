export function validatePasswords(
  password: string,
  confirmPassword: string,
  validatePasswordStrengthFn: (s: string) => boolean
) {
  if (!validatePasswordStrengthFn(password)) {
    return {
      ok: false,
      message:
        'Kata sandi tidak memenuhi persyaratan keamanan. Pastikan semua kriteria terpenuhi.',
    }
  }

  if (password !== confirmPassword) {
    return { ok: false, message: 'Kata sandi tidak sesuai dengan konfirmasi' }
  }

  return { ok: true }
}

export function buildTherapistPayload(values: {
  fullName: string
  email: string
  password: string
  address: string
  dateOfBirth: string
  phone: string
  nik: string
  weight: string
  height: string
  role: string
}) {
  return {
    full_name: values.fullName,
    email: values.email,
    password: values.password,
    address: values.address,
    date_of_birth: values.dateOfBirth,
    phone_number: `62${values.phone}`,
    nik: values.nik,
    weight: parseInt(values.weight || '', 10) || undefined,
    height: parseInt(values.height || '', 10) || undefined,
    role: values.role,
  }
}

export function clearInputs(elements: {
  fullNameInput?: HTMLInputElement | null
  emailInput?: HTMLInputElement | null
  addressInput?: HTMLInputElement | null
  dateOfBirthInput?: HTMLInputElement | null
  phoneInput?: HTMLInputElement | null
}) {
  const list = [
    elements.fullNameInput,
    elements.emailInput,
    elements.addressInput,
    elements.dateOfBirthInput,
    elements.phoneInput,
  ]

  list.forEach((el) => {
    if (el) el.value = ''
  })
}

export function resetSetters(setters: {
  setNik?: (v: string) => void
  setWeight?: (v: string) => void
  setHeight?: (v: string) => void
  setPassword?: (v: string) => void
  setConfirmPassword?: (v: string) => void
  setRole?: (v: string) => void
}) {
  const fns = [
    setters.setNik,
    setters.setWeight,
    setters.setHeight,
    setters.setPassword,
    setters.setConfirmPassword,
    setters.setRole,
  ]

  fns.forEach((fn) => {
    if (fn) fn('')
  })
}

export function clearTherapistForm(
  elements: {
    fullNameInput?: HTMLInputElement | null
    emailInput?: HTMLInputElement | null
    addressInput?: HTMLInputElement | null
    dateOfBirthInput?: HTMLInputElement | null
    phoneInput?: HTMLInputElement | null
  },
  setters: {
    setNik?: (v: string) => void
    setWeight?: (v: string) => void
    setHeight?: (v: string) => void
    setPassword?: (v: string) => void
    setConfirmPassword?: (v: string) => void
    setRole?: (v: string) => void
  }
) {
  clearInputs(elements)
  resetSetters(setters)
}
