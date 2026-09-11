import {
  validateExpenseForm,
  formatRupiah,
  getCategoryBadgeClass,
  resetExpenseFormInputs,
  readExpenseFormValues,
} from '../expenseHelpers'

describe('expenseHelpers', () => {
  describe('formatRupiah', () => {
    test('formats numbers to Indonesian Rupiah representation', () => {
      expect(formatRupiah(150000)).toBe('Rp 150.000')
      expect(formatRupiah(0)).toBe('Rp 0')
      expect(formatRupiah(2500000)).toBe('Rp 2.500.000')
    })

    test('formats numeric strings safely', () => {
      expect(formatRupiah('50000')).toBe('Rp 50.000')
      expect(formatRupiah('')).toBe('Rp 0')
    })
  })

  describe('getCategoryBadgeClass', () => {
    test('returns appropriate CSS color classes per category', () => {
      expect(getCategoryBadgeClass('Operational')).toContain('bg-blue-100')
      expect(getCategoryBadgeClass('Medical Supplies')).toContain(
        'bg-emerald-100'
      )
      expect(getCategoryBadgeClass('Equipment')).toContain('bg-purple-100')
      expect(getCategoryBadgeClass('Salary')).toContain('bg-amber-100')
      expect(getCategoryBadgeClass('Utilities')).toContain('bg-orange-100')
      expect(getCategoryBadgeClass('Marketing')).toContain('bg-pink-100')
      expect(getCategoryBadgeClass('Unknown')).toContain('bg-slate-100')
    })
  })

  describe('validateExpenseForm', () => {
    const validValues = {
      expense_date: '2025-01-15',
      amount: '150000',
      description: 'Tagihan listrik',
      receipt_url: 'https://example.com/receipt.jpg',
      notes: 'Lunas',
    }

    test('validates successfully with complete valid input', () => {
      const res = validateExpenseForm(
        validValues,
        'Operational',
        'bank_transfer'
      )
      expect(res.ok).toBe(true)
      if (res.ok) {
        expect(res.payload.expense_date).toBe('2025-01-15')
        expect(res.payload.category).toBe('Operational')
        expect(res.payload.amount).toBe(150000)
        expect(res.payload.description).toBe('Tagihan listrik')
        expect(res.payload.payment_method).toBe('bank_transfer')
        expect(res.payload.receipt_url).toBe('https://example.com/receipt.jpg')
        expect(res.payload.notes).toBe('Lunas')
      }
    })

    test('fails if expense_date is missing', () => {
      const res = validateExpenseForm(
        { ...validValues, expense_date: '' },
        'Operational',
        'bank_transfer'
      )
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.message).toContain('Tanggal')
      }
    })

    test('fails if category is missing', () => {
      const res = validateExpenseForm(validValues, '', 'bank_transfer')
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.message).toContain('Kategori')
      }
    })

    test('fails if amount is invalid or zero/negative', () => {
      const res1 = validateExpenseForm(
        { ...validValues, amount: '0' },
        'Operational',
        'bank_transfer'
      )
      expect(res1.ok).toBe(false)

      const res2 = validateExpenseForm(
        { ...validValues, amount: '-500' },
        'Operational',
        'bank_transfer'
      )
      expect(res2.ok).toBe(false)

      const res3 = validateExpenseForm(
        { ...validValues, amount: 'abc' },
        'Operational',
        'bank_transfer'
      )
      expect(res3.ok).toBe(false)
    })

    test('fails if description is missing', () => {
      const res = validateExpenseForm(
        { ...validValues, description: '   ' },
        'Operational',
        'bank_transfer'
      )
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.message).toContain('Deskripsi')
      }
    })

    test('fails if payment_method is missing', () => {
      const res = validateExpenseForm(validValues, 'Operational', '')
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.message).toContain('Metode')
      }
    })
  })

  describe('DOM form helpers', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input id="add_expense_date" value="2025-01-15" />
        <input id="add_amount" value="250000" />
        <textarea id="add_description">Pembelian obat</textarea>
        <input id="add_receipt_url" value="https://example.com" />
        <textarea id="add_notes">Catatan</textarea>
      `
    })

    test('reads values from form inputs correctly', () => {
      const values = readExpenseFormValues('add')
      expect(values.expense_date).toBe('2025-01-15')
      expect(values.amount).toBe('250000')
      expect(values.description).toBe('Pembelian obat')
      expect(values.receipt_url).toBe('https://example.com')
      expect(values.notes).toBe('Catatan')
    })

    test('resets form inputs correctly', () => {
      resetExpenseFormInputs('add')
      const values = readExpenseFormValues('add')
      expect(values.expense_date).toBe('')
      expect(values.amount).toBe('0')
      expect(values.description).toBe('')
      expect(values.receipt_url).toBe('')
      expect(values.notes).toBe('')
    })
  })
})
