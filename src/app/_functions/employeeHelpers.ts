export function resetEmployeeFormInputs(): void {
  const fields = [
    '#add_nik',
    '#add_full_name',
    '#add_religion',
    '#add_phone_number',
    '#add_email',
    '#add_joined_date',
    '#add_position',
    '#add_base_salary',
    '#add_lunch_money',
    '#add_address',
  ]
  fields.forEach((selector) => {
    const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      selector
    )
    if (el) el.value = ''
  })
}

export function readEmployeeFormValues(): {
  nik: string
  full_name: string
  religion: string
  phone_number: string
  email: string
  joined_date: string
  position: string
  base_salary: string
  lunch_money: string
  address: string
} {
  return {
    nik: document.querySelector<HTMLInputElement>('#add_nik')?.value || '',
    full_name:
      document.querySelector<HTMLInputElement>('#add_full_name')?.value || '',
    religion:
      document.querySelector<HTMLInputElement>('#add_religion')?.value || '',
    phone_number:
      document.querySelector<HTMLInputElement>('#add_phone_number')?.value ||
      '',
    email: document.querySelector<HTMLInputElement>('#add_email')?.value || '',
    joined_date:
      document.querySelector<HTMLInputElement>('#add_joined_date')?.value || '',
    position:
      document.querySelector<HTMLInputElement>('#add_position')?.value || '',
    base_salary:
      document.querySelector<HTMLInputElement>('#add_base_salary')?.value ||
      '0',
    lunch_money:
      document.querySelector<HTMLInputElement>('#add_lunch_money')?.value ||
      '0',
    address:
      document.querySelector<HTMLTextAreaElement>('#add_address')?.value || '',
  }
}

export interface EmployeePayload {
  nik: string
  full_name: string
  gender: string
  address: string
  religion: string
  phone_number: string
  email: string
  joined_date: string
  position: string
  base_salary: number
  lunch_money: number
}

export function validateEmployeeForm(
  values: ReturnType<typeof readEmployeeFormValues>,
  gender: string
): { ok: true; payload: EmployeePayload } | { ok: false; message: string } {
  if (!values.nik.trim()) {
    return { ok: false, message: 'NIK tidak boleh kosong.' }
  }
  if (!values.full_name.trim()) {
    return { ok: false, message: 'Nama lengkap tidak boleh kosong.' }
  }
  if (!gender || gender === '') {
    return { ok: false, message: 'Jenis kelamin harus dipilih.' }
  }
  if (!values.religion.trim()) {
    return { ok: false, message: 'Agama tidak boleh kosong.' }
  }
  if (!values.phone_number.trim()) {
    return { ok: false, message: 'Nomor telepon tidak boleh kosong.' }
  }
  if (!values.email.trim()) {
    return { ok: false, message: 'Email tidak boleh kosong.' }
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(values.email.trim())) {
    return { ok: false, message: 'Format email tidak valid.' }
  }

  if (!values.joined_date.trim()) {
    return { ok: false, message: 'Tanggal masuk tidak boleh kosong.' }
  }
  if (!values.position.trim()) {
    return { ok: false, message: 'Jabatan tidak boleh kosong.' }
  }
  if (!values.address.trim()) {
    return { ok: false, message: 'Alamat tidak boleh kosong.' }
  }

  const parsedSalary = Number(values.base_salary)
  const parsedLunchMoney = Number(values.lunch_money)

  if (!Number.isFinite(parsedSalary) || parsedSalary < 0) {
    return { ok: false, message: 'Gaji pokok harus berupa angka >= 0.' }
  }
  if (!Number.isFinite(parsedLunchMoney) || parsedLunchMoney < 0) {
    return { ok: false, message: 'Uang makan harus berupa angka >= 0.' }
  }

  // Format gender for backend: GORM model examples use 'Male' or 'Female'
  let formattedGender = 'Male'
  if (gender.toLowerCase().trim() === 'female') {
    formattedGender = 'Female'
  }

  return {
    ok: true,
    payload: {
      nik: values.nik.trim(),
      full_name: values.full_name.trim(),
      gender: formattedGender,
      address: values.address.trim(),
      religion: values.religion.trim(),
      phone_number: values.phone_number.trim(),
      email: values.email.trim(),
      joined_date: values.joined_date.trim(),
      position: values.position.trim(),
      base_salary: parsedSalary,
      lunch_money: parsedLunchMoney,
    },
  }
}
