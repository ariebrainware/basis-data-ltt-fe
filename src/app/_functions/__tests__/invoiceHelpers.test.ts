import {
  generateInvoiceNumber,
  formatInvoiceDate,
  buildInitialInvoiceData,
  calculateInvoiceTotals,
  DEFAULT_COMPANY_NAME,
  DEFAULT_COMPANY_PHONE,
  DEFAULT_COMPANY_EMAIL,
  DEFAULT_COMPANY_ADDRESS,
} from '../invoiceHelpers'

describe('invoiceHelpers', () => {
  describe('generateInvoiceNumber', () => {
    test('formats id with 5 padded digits', () => {
      expect(generateInvoiceNumber(1)).toBe('INV-00001')
      expect(generateInvoiceNumber(42)).toBe('INV-00042')
      expect(generateInvoiceNumber(12345)).toBe('INV-12345')
      expect(generateInvoiceNumber('99')).toBe('INV-00099')
    })

    test('handles fallback when id is falsy', () => {
      expect(generateInvoiceNumber(0)).toBe('INV-00001')
    })
  })

  describe('formatInvoiceDate', () => {
    test('returns date part from string', () => {
      expect(formatInvoiceDate('2026-05-20 14:30')).toBe('2026-05-20')
      expect(formatInvoiceDate('2026-01-15')).toBe('2026-01-15')
    })

    test('returns today formatted date when date string is empty', () => {
      const formatted = formatInvoiceDate('')
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('buildInitialInvoiceData', () => {
    test('constructs default invoice with single therapy item', () => {
      const transaction = {
        ID: 5,
        patient_name: 'Budi Santoso',
        amount: 250000,
        transaction_date: '2026-05-20 10:00',
        treatment_date: '2026-05-20',
        therapist_name: 'Dr. John',
      }

      const invoice = buildInitialInvoiceData({
        transaction,
        patientPhone: '08123456789',
      })

      expect(invoice.companyName).toBe(DEFAULT_COMPANY_NAME)
      expect(invoice.companyPhone).toBe(DEFAULT_COMPANY_PHONE)
      expect(invoice.companyEmail).toBe(DEFAULT_COMPANY_EMAIL)
      expect(invoice.companyAddress).toBe(DEFAULT_COMPANY_ADDRESS)
      expect(invoice.invoiceNumber).toBe('INV-00005')
      expect(invoice.orderDate).toBe('2026-05-20')
      expect(invoice.patientName).toBe('Budi Santoso')
      expect(invoice.patientPhone).toBe('08123456789')
      expect(invoice.items).toHaveLength(1)
      expect(invoice.items[0].description).toBe('Terapi (Dr. John)')
      expect(invoice.items[0].unitPrice).toBe(250000)
      expect(invoice.subtotal).toBe(250000)
      expect(invoice.discount).toBe(0)
      expect(invoice.total).toBe(250000)
      expect(invoice.bestRegards).toBe(DEFAULT_COMPANY_NAME)
    })

    test('constructs invoice with therapy item and additional transaction items', () => {
      const transaction = {
        ID: 10,
        patient_name: 'Siti',
        amount: 350000,
        treatment_date: '2026-06-10',
        therapist_name: 'Jane Doe',
        items: [{ item_id: 1, quantity: 2, price: 50000 }],
      }

      const allItems = [
        { ID: 1, name: 'Minyak Urut Herbal', price: 50000, quantity: 20 },
      ]

      const invoice = buildInitialInvoiceData({ transaction, allItems })

      expect(invoice.items).toHaveLength(2)
      // Therapy price = 350000 - (2 * 50000) = 250000
      expect(invoice.items[0].description).toBe('Terapi (Jane Doe)')
      expect(invoice.items[0].unitPrice).toBe(250000)
      expect(invoice.items[1].description).toBe('Minyak Urut Herbal')
      expect(invoice.items[1].quantity).toBe(2)
      expect(invoice.items[1].unitPrice).toBe(50000)
      expect(invoice.items[1].total).toBe(100000)
      expect(invoice.subtotal).toBe(350000)
      expect(invoice.total).toBe(350000)
    })
  })

  describe('calculateInvoiceTotals', () => {
    test('calculates subtotal and total with discount', () => {
      const items = [
        {
          id: '1',
          description: 'Item 1',
          quantity: 2,
          unitPrice: 50000,
          total: 100000,
        },
        {
          id: '2',
          description: 'Item 2',
          quantity: 1,
          unitPrice: 150000,
          total: 150000,
        },
      ]

      const result = calculateInvoiceTotals(items, 25000)
      expect(result.subtotal).toBe(250000)
      expect(result.total).toBe(225000)
    })

    test('prevents total from becoming negative if discount exceeds subtotal', () => {
      const items = [
        {
          id: '1',
          description: 'Item 1',
          quantity: 1,
          unitPrice: 50000,
          total: 50000,
        },
      ]

      const result = calculateInvoiceTotals(items, 100000)
      expect(result.subtotal).toBe(50000)
      expect(result.total).toBe(0)
    })
  })

  describe('printInvoiceDocument', () => {
    test('creates print iframe and calls contentWindow.print', () => {
      const mockPrint = jest.fn()
      const dummyInvoice = {
        companyName: DEFAULT_COMPANY_NAME,
        companyPhone: DEFAULT_COMPANY_PHONE,
        companyEmail: DEFAULT_COMPANY_EMAIL,
        companyAddress: DEFAULT_COMPANY_ADDRESS,
        invoiceNumber: 'INV-00001',
        orderDate: '2026-05-20',
        patientName: 'Test Patient',
        patientPhone: '08123',
        items: [
          {
            id: '1',
            description: 'Item A',
            quantity: 1,
            unitPrice: 10000,
            total: 10000,
          },
        ],
        subtotal: 10000,
        discount: 0,
        total: 10000,
        bestRegards: DEFAULT_COMPANY_NAME,
      }

      // Mock iframe creation in jsdom
      const originalCreateElement = document.createElement.bind(document)
      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const el = originalCreateElement(tagName)
          if (tagName.toLowerCase() === 'iframe') {
            Object.defineProperty(el, 'contentWindow', {
              value: {
                document: {
                  open: jest.fn(),
                  write: jest.fn(),
                  close: jest.fn(),
                },
                focus: jest.fn(),
                print: mockPrint,
              },
              writable: true,
            })
          }
          return el
        })

      jest.useFakeTimers()
      const { printInvoiceDocument: printFn } = require('../invoiceHelpers')
      printFn(dummyInvoice)

      jest.advanceTimersByTime(300)
      expect(mockPrint).toHaveBeenCalled()
      jest.useRealTimers()
      ;(document.createElement as jest.Mock).mockRestore?.()
    })
  })
})
