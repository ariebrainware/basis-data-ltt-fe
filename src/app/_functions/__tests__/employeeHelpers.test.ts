import {
  EMPLOYEE_BIRTH_DATE_MAX_LENGTH,
  readEmployeeFormValues,
  resetEmployeeFormInputs,
  validateBirthDate,
  validateEmployeeForm,
} from '../employeeHelpers'

const baseValues = {
  nik: '3201000000000001',
  full_name: 'Fara Nadya',
  religion: 'Islam',
  phone_number: '083180662979',
  email: 'fara@example.com',
  joined_date: '2026-02-13',
  position: 'Staff',
  base_salary: '3000000',
  lunch_money: '0',
  address: 'Kampung Aceh 174',
  birth_date: '',
}

describe('validateBirthDate', () => {
  it('accepts empty and normal values', () => {
    expect(validateBirthDate('')).toBeNull()
    expect(validateBirthDate('Medan, 20 Juli 2007')).toBeNull()
    expect(
      validateBirthDate('a'.repeat(EMPLOYEE_BIRTH_DATE_MAX_LENGTH))
    ).toBeNull()
  })

  it('rejects values over the limit', () => {
    expect(
      validateBirthDate('a'.repeat(EMPLOYEE_BIRTH_DATE_MAX_LENGTH + 1))
    ).toMatch(/maksimal 200 karakter/)
  })
})

describe('validateEmployeeForm birth_date', () => {
  it('leaves birth_date out of the payload when empty', () => {
    const result = validateEmployeeForm(baseValues, 'female')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.payload).not.toHaveProperty('birth_date')
  })

  it('sends a trimmed birth_date when filled in', () => {
    const result = validateEmployeeForm(
      { ...baseValues, birth_date: '  Medan, 20 Juli 2007 ' },
      'female'
    )
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.payload.birth_date).toBe('Medan, 20 Juli 2007')
  })

  it('rejects a birth_date that is too long', () => {
    const result = validateEmployeeForm(
      { ...baseValues, birth_date: 'a'.repeat(201) },
      'female'
    )
    expect(result).toEqual({
      ok: false,
      message: 'Tempat, tanggal lahir maksimal 200 karakter.',
    })
  })
})

describe('add form inputs', () => {
  it('reads and resets the birth date input', () => {
    document.body.innerHTML =
      '<input id="add_birth_date" value="Batam, 1 Januari 2000" />'
    expect(readEmployeeFormValues().birth_date).toBe('Batam, 1 Januari 2000')
    resetEmployeeFormInputs()
    expect(readEmployeeFormValues().birth_date).toBe('')
  })
})
