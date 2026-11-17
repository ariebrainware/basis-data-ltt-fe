export type ParsedCommission =
  | { type: 'percentage'; rate: number; displayLabel: string }
  | { type: 'fixed'; amountPerVisit: number; displayLabel: string }
  | { type: 'none'; displayLabel: string }

export interface TherapistCommissionInfo {
  id: number
  name: string
  commission?: string
}

export interface TherapistSummary {
  therapistId: number
  therapistName: string
  visitCount: number
  paidVisitCount: number
  totalIncome: number
  paidIncome: number
  commissionRaw: string
  commissionLabel: string
  commissionType: 'percentage' | 'fixed' | 'none'
  estimatedIncome: number
  estimatedPaidIncome: number
}

export interface PeriodSummaryData {
  totalGross: number
  totalNet: number
  totalEstimatedCommission: number
  totalEstimatedPaidCommission: number
  transactionCount: number
  therapists: TherapistSummary[]
  loading: boolean
  error: string | null
  isEstimateFromTreatmentsOnly?: boolean
}

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val)
}

/**
 * Parse a therapist commission string into a structured calculation rule.
 * Supports percentage values (e.g. "50%", "12.5%", "12,5%") and fixed per-visit
 * IDR amounts (e.g. "50000", "50.000", "Rp 50.000").
 */
export function parseCommission(
  commission?: string | number | null
): ParsedCommission {
  if (commission === null || commission === undefined) {
    return { type: 'none', displayLabel: 'Belum diatur' }
  }

  const raw = String(commission).trim()
  if (!raw) {
    return { type: 'none', displayLabel: 'Belum diatur' }
  }

  if (raw.includes('%')) {
    const numericPart = raw
      .replace(/%/g, '')
      .replace(/\s+/g, '')
      .replace(',', '.')
    const pct = Number.parseFloat(numericPart)
    if (Number.isFinite(pct) && pct > 0) {
      return {
        type: 'percentage',
        rate: pct / 100,
        displayLabel: `${pct}%`,
      }
    }
    return { type: 'none', displayLabel: 'Belum diatur' }
  }

  let cleaned = raw.replace(/rp|idr/gi, '').trim()

  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, '')
  } else {
    cleaned = cleaned.replace(',', '.').replace(/[^\d.-]/g, '')
  }

  const amount = Number.parseFloat(cleaned)
  if (Number.isFinite(amount) && amount > 0) {
    return {
      type: 'fixed',
      amountPerVisit: amount,
      displayLabel: `${formatCurrency(amount)}/kunjungan`,
    }
  }

  return { type: 'none', displayLabel: 'Belum diatur' }
}

/**
 * Calculate estimated therapist income from gross/paid transaction totals and visit counts.
 */
export function calculateEstimatedIncome(params: {
  commission?: string | number | null
  totalIncome: number
  paidIncome: number
  visitCount: number
  paidVisitCount?: number
}): {
  estimatedIncome: number
  estimatedPaidIncome: number
  parsedCommission: ParsedCommission
} {
  const parsedCommission = parseCommission(params.commission)

  if (parsedCommission.type === 'percentage') {
    return {
      estimatedIncome: Math.round(params.totalIncome * parsedCommission.rate),
      estimatedPaidIncome: Math.round(
        params.paidIncome * parsedCommission.rate
      ),
      parsedCommission,
    }
  }

  if (parsedCommission.type === 'fixed') {
    const paidVisits = params.paidVisitCount ?? params.visitCount
    return {
      estimatedIncome: Math.round(
        params.visitCount * parsedCommission.amountPerVisit
      ),
      estimatedPaidIncome: Math.round(
        paidVisits * parsedCommission.amountPerVisit
      ),
      parsedCommission,
    }
  }

  return {
    estimatedIncome: 0,
    estimatedPaidIncome: 0,
    parsedCommission,
  }
}

export function findTherapistCommission(
  therapistId: number,
  therapistName: string,
  therapists: TherapistCommissionInfo[]
): string | undefined {
  if (therapistId > 0) {
    const byId = therapists.find((t) => t.id === therapistId)
    if (byId && byId.commission !== undefined) {
      return byId.commission
    }
  }

  const normalizedName = therapistName.trim().toLowerCase()
  if (normalizedName && normalizedName !== 'unknown') {
    const byName = therapists.find(
      (t) => t.name.trim().toLowerCase() === normalizedName
    )
    if (byName && byName.commission !== undefined) {
      return byName.commission
    }
  }

  return undefined
}

export function processTransactions(
  rawTransactions: any[],
  therapistInfos: TherapistCommissionInfo[] = []
): Omit<PeriodSummaryData, 'loading' | 'error'> {
  let totalGross = 0
  let totalNet = 0
  const therapistMap: Record<
    number,
    {
      therapistName: string
      visitCount: number
      paidVisitCount: number
      totalIncome: number
      paidIncome: number
    }
  > = {}
  let nextTempTherapistId = -1
  const tempTherapistIds: Record<string, number> = {}

  rawTransactions.forEach((tx) => {
    const amount = Number(tx.amount || 0)
    totalGross += amount
    const isPaid = tx.payment_status === 'paid'
    const isPartial = tx.payment_status === 'partial'
    if (isPaid || isPartial) totalNet += amount

    let therapistId = Number(tx.therapist_id || 0)
    const therapistName = String(
      tx.therapist_name ||
        (tx.therapist_id ? `Terapis ID: ${tx.therapist_id}` : 'Unknown')
    )
    if (!therapistId && therapistName && therapistName !== 'Unknown') {
      therapistId =
        tempTherapistIds[therapistName] ??
        (tempTherapistIds[therapistName] = nextTempTherapistId--)
    }
    if (!therapistMap[therapistId]) {
      therapistMap[therapistId] = {
        therapistName,
        visitCount: 0,
        paidVisitCount: 0,
        totalIncome: 0,
        paidIncome: 0,
      }
    }

    therapistMap[therapistId].visitCount += 1
    therapistMap[therapistId].totalIncome += amount
    if (isPaid || isPartial) {
      therapistMap[therapistId].paidVisitCount += 1
      therapistMap[therapistId].paidIncome += amount
    }
  })

  let totalEstimatedCommission = 0
  let totalEstimatedPaidCommission = 0

  const therapists: TherapistSummary[] = Object.entries(therapistMap)
    .map(([id, val]) => {
      const numericId = Number(id)
      const commissionRaw =
        findTherapistCommission(numericId, val.therapistName, therapistInfos) ??
        ''
      const { estimatedIncome, estimatedPaidIncome, parsedCommission } =
        calculateEstimatedIncome({
          commission: commissionRaw,
          totalIncome: val.totalIncome,
          paidIncome: val.paidIncome,
          visitCount: val.visitCount,
          paidVisitCount: val.paidVisitCount,
        })

      totalEstimatedCommission += estimatedIncome
      totalEstimatedPaidCommission += estimatedPaidIncome

      return {
        therapistId: numericId,
        therapistName: val.therapistName,
        visitCount: val.visitCount,
        paidVisitCount: val.paidVisitCount,
        totalIncome: val.totalIncome,
        paidIncome: val.paidIncome,
        commissionRaw,
        commissionLabel: parsedCommission.displayLabel,
        commissionType: parsedCommission.type,
        estimatedIncome,
        estimatedPaidIncome,
      }
    })
    .sort((a, b) => b.totalIncome - a.totalIncome)

  return {
    totalGross,
    totalNet,
    totalEstimatedCommission,
    totalEstimatedPaidCommission,
    transactionCount: rawTransactions.length,
    therapists,
  }
}

/**
 * Filter transactions to only those belonging to a specific therapist user.
 * Matches by therapist_id first, with a case-insensitive therapist_name fallback.
 */
export function filterTransactionsForTherapist(
  rawTransactions: any[],
  therapistId?: string | number | null,
  therapistName?: string | null
): any[] {
  const numericTargetId = Number(therapistId || 0)
  const normalizedTargetName = (therapistName || '').trim().toLowerCase()

  if (!numericTargetId && !normalizedTargetName) {
    return []
  }

  return rawTransactions.filter((tx) => {
    const txTherapistId = Number(tx?.therapist_id || 0)
    if (numericTargetId > 0 && txTherapistId > 0) {
      return txTherapistId === numericTargetId
    }

    const txTherapistName = String(tx?.therapist_name || '')
      .trim()
      .toLowerCase()
    if (normalizedTargetName && txTherapistName) {
      return txTherapistName === normalizedTargetName
    }

    return false
  })
}

/**
 * Fallback summary builder from treatment records when /transaction is unavailable
 * for therapist users. Calculates estimated income for fixed-commission therapists.
 */
export function processTreatmentsFallback(params: {
  rawTreatments: any[]
  startDate: string
  endDate: string
  therapistId?: string | number | null
  therapistName?: string | null
  commission?: string
}): Omit<PeriodSummaryData, 'loading' | 'error'> {
  const {
    rawTreatments,
    startDate,
    endDate,
    therapistId,
    therapistName,
    commission,
  } = params

  const therapistFiltered = filterTransactionsForTherapist(
    rawTreatments,
    therapistId,
    therapistName
  )

  const dateFiltered = therapistFiltered.filter((item) => {
    const rawDate = String(item?.treatment_date || '')
      .trim()
      .slice(0, 10)
    if (!rawDate) return false
    return rawDate >= startDate && rawDate <= endDate
  })

  const visitCount = dateFiltered.length
  const { estimatedIncome, parsedCommission } = calculateEstimatedIncome({
    commission,
    totalIncome: 0,
    paidIncome: 0,
    visitCount,
    paidVisitCount: visitCount,
  })

  const numericId = Number(therapistId || 0)
  const resolvedName = therapistName || 'Saya'

  const therapists: TherapistSummary[] =
    visitCount > 0
      ? [
          {
            therapistId: numericId,
            therapistName: resolvedName,
            visitCount,
            paidVisitCount: visitCount,
            totalIncome: 0,
            paidIncome: 0,
            commissionRaw: commission || '',
            commissionLabel: parsedCommission.displayLabel,
            commissionType: parsedCommission.type,
            estimatedIncome,
            estimatedPaidIncome: estimatedIncome,
          },
        ]
      : []

  return {
    totalGross: 0,
    totalNet: 0,
    totalEstimatedCommission: estimatedIncome,
    totalEstimatedPaidCommission: estimatedIncome,
    transactionCount: visitCount,
    therapists,
    isEstimateFromTreatmentsOnly: true,
  }
}
