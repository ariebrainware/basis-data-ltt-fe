import {
  calculateEstimatedIncome,
  filterTransactionsForTherapist,
  parseCommission,
  processTransactions,
  processTreatmentsFallback,
  TherapistCommissionInfo,
} from '../commissionHelpers'

describe('commissionHelpers', () => {
  describe('parseCommission', () => {
    test('parses percentage strings with dot or comma decimals', () => {
      expect(parseCommission('50%')).toEqual({
        type: 'percentage',
        rate: 0.5,
        displayLabel: '50%',
      })
      expect(parseCommission(' 12,5 % ')).toEqual({
        type: 'percentage',
        rate: 0.125,
        displayLabel: '12.5%',
      })
    })

    test('parses fixed IDR amounts in plain and formatted strings', () => {
      const plain = parseCommission('50000')
      expect(plain.type).toBe('fixed')
      if (plain.type === 'fixed') {
        expect(plain.amountPerVisit).toBe(50000)
        expect(plain.displayLabel).toContain('/kunjungan')
      }

      const idrFormatted = parseCommission('Rp 75.000')
      expect(idrFormatted.type).toBe('fixed')
      if (idrFormatted.type === 'fixed') {
        expect(idrFormatted.amountPerVisit).toBe(75000)
      }

      const commaThousands = parseCommission('100,000')
      expect(commaThousands.type).toBe('fixed')
      if (commaThousands.type === 'fixed') {
        expect(commaThousands.amountPerVisit).toBe(100000)
      }
    })

    test('returns none for empty, zero, or invalid values', () => {
      expect(parseCommission(undefined)).toEqual({
        type: 'none',
        displayLabel: 'Belum diatur',
      })
      expect(parseCommission('')).toEqual({
        type: 'none',
        displayLabel: 'Belum diatur',
      })
      expect(parseCommission('0')).toEqual({
        type: 'none',
        displayLabel: 'Belum diatur',
      })
      expect(parseCommission('invalid')).toEqual({
        type: 'none',
        displayLabel: 'Belum diatur',
      })
    })
  })

  describe('calculateEstimatedIncome', () => {
    test('calculates percentage commission on total and paid income', () => {
      const result = calculateEstimatedIncome({
        commission: '40%',
        totalIncome: 500000,
        paidIncome: 300000,
        visitCount: 5,
        paidVisitCount: 3,
      })

      expect(result.estimatedIncome).toBe(200000)
      expect(result.estimatedPaidIncome).toBe(120000)
      expect(result.parsedCommission.type).toBe('percentage')
    })

    test('calculates fixed commission per visit', () => {
      const result = calculateEstimatedIncome({
        commission: '50000',
        totalIncome: 500000,
        paidIncome: 300000,
        visitCount: 4,
        paidVisitCount: 2,
      })

      expect(result.estimatedIncome).toBe(200000)
      expect(result.estimatedPaidIncome).toBe(100000)
      expect(result.parsedCommission.type).toBe('fixed')
    })

    test('returns 0 when commission is not set', () => {
      const result = calculateEstimatedIncome({
        commission: '',
        totalIncome: 500000,
        paidIncome: 300000,
        visitCount: 4,
      })

      expect(result.estimatedIncome).toBe(0)
      expect(result.estimatedPaidIncome).toBe(0)
    })
  })

  describe('processTransactions', () => {
    const therapists: TherapistCommissionInfo[] = [
      { id: 1, name: 'Dr. Budi', commission: '50%' },
      { id: 2, name: 'Dr. Siti', commission: '50000' },
    ]

    test('computes per-therapist and total estimated commissions', () => {
      const txs = [
        {
          therapist_id: 1,
          therapist_name: 'Dr. Budi',
          amount: 200000,
          payment_status: 'paid',
        },
        {
          therapist_id: 1,
          therapist_name: 'Dr. Budi',
          amount: 100000,
          payment_status: 'unpaid',
        },
        {
          therapist_id: 2,
          therapist_name: 'Dr. Siti',
          amount: 150000,
          payment_status: 'paid',
        },
      ]

      const summary = processTransactions(txs, therapists)
      expect(summary.totalGross).toBe(450000)
      expect(summary.totalNet).toBe(350000)
      expect(summary.totalEstimatedCommission).toBe(200000) // 50% of 300k (150k) + 1 * 50k
      expect(summary.totalEstimatedPaidCommission).toBe(150000) // 50% of 200k (100k) + 1 * 50k

      const budi = summary.therapists.find((t) => t.therapistId === 1)
      expect(budi?.estimatedIncome).toBe(150000)
      expect(budi?.commissionLabel).toBe('50%')

      const siti = summary.therapists.find((t) => t.therapistId === 2)
      expect(siti?.estimatedIncome).toBe(50000)
      expect(siti?.commissionType).toBe('fixed')
    })

    test('matches therapist commission by name when therapist_id is absent', () => {
      const txs = [
        {
          therapist_name: 'dr. budi',
          amount: 400000,
          payment_status: 'paid',
        },
      ]

      const summary = processTransactions(txs, therapists)
      expect(summary.totalEstimatedCommission).toBe(200000)
    })
  })

  describe('filterTransactionsForTherapist', () => {
    const txs = [
      { ID: 1, therapist_id: 10, therapist_name: 'Ani', amount: 100000 },
      { ID: 2, therapist_id: 20, therapist_name: 'Budi', amount: 200000 },
      { ID: 3, therapist_name: 'Ani', amount: 150000 },
    ]

    test('filters transactions strictly to the matching therapist user', () => {
      const filtered = filterTransactionsForTherapist(txs, 10, 'Ani')
      expect(filtered).toHaveLength(2)
      expect(filtered.map((t) => t.ID)).toEqual([1, 3])
    })

    test('returns empty array when neither therapistId nor therapistName is provided', () => {
      expect(filterTransactionsForTherapist(txs, null, '')).toEqual([])
    })
  })

  describe('processTreatmentsFallback', () => {
    test('counts only matching therapist treatments within date range and estimates fixed commission', () => {
      const treatments = [
        {
          ID: '1',
          therapist_id: '10',
          therapist_name: 'Ani',
          treatment_date: '2026-11-17',
        },
        {
          ID: '2',
          therapist_id: '10',
          therapist_name: 'Ani',
          treatment_date: '2026-11-16',
        },
        {
          ID: '3',
          therapist_id: '20',
          therapist_name: 'Budi',
          treatment_date: '2026-11-17',
        },
      ]

      const summary = processTreatmentsFallback({
        rawTreatments: treatments,
        startDate: '2026-11-17',
        endDate: '2026-11-17',
        therapistId: 10,
        therapistName: 'Ani',
        commission: '50000',
      })

      expect(summary.transactionCount).toBe(1)
      expect(summary.totalEstimatedCommission).toBe(50000)
      expect(summary.isEstimateFromTreatmentsOnly).toBe(true)
    })
  })
})
