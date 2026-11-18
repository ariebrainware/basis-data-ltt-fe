import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '../page'
import { apiFetch } from '../../_functions/apiFetch'
import { useUserRole } from '../../_functions/userRole'
import { getTherapistId, getUserId } from '../../_functions/userId'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

jest.mock('../../_components/megaMenu', () => ({
  __esModule: true,
  default: () => <div data-testid="mega-menu" />,
}))

jest.mock('../../_components/greetingBanner', () => ({
  __esModule: true,
  default: () => <div data-testid="greeting-banner" />,
}))

jest.mock('../../_components/calendarTreatment', () => ({
  __esModule: true,
  default: ({ userRole }: { userRole: string | null }) => (
    <div data-testid="calendar-treatment" data-role={userRole ?? ''} />
  ),
}))

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('../../_functions/userRole', () => ({
  useUserRole: jest.fn(),
}))

jest.mock('../../_functions/userId', () => ({
  getTherapistId: jest.fn(),
  getUserId: jest.fn(),
}))

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>
const mockUseUserRole = useUserRole as jest.MockedFunction<typeof useUserRole>
const mockGetTherapistId = getTherapistId as jest.MockedFunction<
  typeof getTherapistId
>
const mockGetUserId = getUserId as jest.MockedFunction<typeof getUserId>

describe('Dashboard Page - Therapist Income Estimation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('renders per-therapist commission income estimation on super_admin dashboard', async () => {
    mockUseUserRole.mockReturnValue('super_admin')
    mockGetTherapistId.mockReturnValue(null)
    mockGetUserId.mockReturnValue('1')

    mockApiFetch.mockImplementation(async (url: string) => {
      if (url.startsWith('/therapist')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              therapists: [
                { ID: 1, full_name: 'Terapis Ani', commission: '50%' },
                { ID: 2, full_name: 'Terapis Budi', commission: '50000' },
              ],
            },
          }),
        } as Response
      }

      if (url.startsWith('/transaction')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              transactions: [
                {
                  ID: 101,
                  therapist_id: 1,
                  therapist_name: 'Terapis Ani',
                  amount: 200000,
                  payment_status: 'paid',
                },
                {
                  ID: 102,
                  therapist_id: 2,
                  therapist_name: 'Terapis Budi',
                  amount: 150000,
                  payment_status: 'paid',
                },
              ],
            },
          }),
        } as Response
      }

      return { ok: true, status: 200, json: async () => ({}) } as Response
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getAllByText('Terapis Ani').length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText('Terapis Budi').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Est\. Komisi \(50%\)/).length).toBeGreaterThan(
      0
    )
    expect(screen.getAllByText(/100\.000/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/50\.000/).length).toBeGreaterThan(0)
    expect(
      screen.getAllByText(/Total Est\. Komisi Terapis:/).length
    ).toBeGreaterThan(0)
  })

  test('renders separated personal income estimation for logged-in therapist user without calling /therapist', async () => {
    mockUseUserRole.mockReturnValue('therapist')
    mockGetTherapistId.mockReturnValue('2')
    mockGetUserId.mockReturnValue('22')
    localStorage.setItem('user-name', 'Terapis Budi')

    mockApiFetch.mockImplementation(async (url: string) => {
      if (url === '/user/22') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              therapist_id: 2,
              full_name: 'Terapis Budi',
              commission: '40%',
            },
          }),
        } as Response
      }

      if (url.startsWith('/transaction')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              transactions: [
                {
                  ID: 201,
                  therapist_id: 1,
                  therapist_name: 'Terapis Ani',
                  amount: 500000,
                  payment_status: 'paid',
                },
                {
                  ID: 202,
                  therapist_id: 2,
                  therapist_name: 'Terapis Budi',
                  amount: 250000,
                  payment_status: 'paid',
                },
              ],
            },
          }),
        } as Response
      }

      return { ok: true, status: 200, json: async () => ({}) } as Response
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(
        screen.getByText(/Estimasi Pendapatan Saya — Terapis Budi/)
      ).toBeInTheDocument()
    })

    expect(screen.getByText('Komisi: 40%')).toBeInTheDocument()
    // 40% of 250.000 = 100.000 (Ani's 500.000 transaction must be excluded)
    await waitFor(() => {
      expect(screen.getAllByText(/100\.000/).length).toBeGreaterThan(0)
    })
    expect(screen.queryByText('Terapis Ani')).not.toBeInTheDocument()
    expect(
      mockApiFetch.mock.calls.some(([calledUrl]) =>
        String(calledUrl).startsWith('/therapist')
      )
    ).toBe(false)
  })

  test('falls back to treatment count for fixed-commission therapist when /transaction returns 401', async () => {
    mockUseUserRole.mockReturnValue('therapist')
    mockGetTherapistId.mockReturnValue('3')
    mockGetUserId.mockReturnValue('33')
    localStorage.setItem('user-name', 'Terapis Citra')
    localStorage.setItem('therapist-commission', '50000')

    const todayStr = new Date().toISOString().slice(0, 10)

    mockApiFetch.mockImplementation(async (url: string) => {
      if (url.startsWith('/transaction')) {
        return {
          ok: false,
          status: 401,
          json: async () => ({ error: 'Unauthorized' }),
        } as Response
      }

      if (url.startsWith('/treatment')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              total: 2,
              treatments: [
                {
                  ID: '1',
                  therapist_id: '3',
                  therapist_name: 'Terapis Citra',
                  treatment_date: todayStr,
                },
                {
                  ID: '2',
                  therapist_id: '99',
                  therapist_name: 'Terapis Lain',
                  treatment_date: todayStr,
                },
              ],
            },
          }),
        } as Response
      }

      return { ok: true, status: 200, json: async () => ({}) } as Response
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(
        screen.getAllByText(/Dihitung dari jadwal penanganan Anda\./).length
      ).toBeGreaterThan(0)
    })

    // 1 matching treatment * 50.000 = 50.000
    expect(screen.getAllByText(/50\.000/).length).toBeGreaterThan(0)
  })

  test('falls back to /pricing when /user and /therapist/:id do not provide commission for therapist', async () => {
    mockUseUserRole.mockReturnValue('therapist')
    mockGetTherapistId.mockReturnValue('4')
    mockGetUserId.mockReturnValue('44')
    localStorage.setItem('user-name', 'Terapis Dewi')

    mockApiFetch.mockImplementation(async (url: string) => {
      if (url === '/user/44') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              therapist_id: 4,
              full_name: 'Terapis Dewi',
            },
          }),
        } as Response
      }

      if (url === '/therapist/4') {
        return {
          ok: false,
          status: 401,
          json: async () => ({ error: 'Unauthorized' }),
        } as Response
      }

      if (url.startsWith('/pricing')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              pricings: [
                {
                  ID: 1,
                  therapist_id: 4,
                  name: 'Terapis Dewi',
                  commission: '35%',
                },
              ],
            },
          }),
        } as Response
      }

      if (url.startsWith('/transaction')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              transactions: [
                {
                  ID: 301,
                  therapist_id: 4,
                  therapist_name: 'Terapis Dewi',
                  amount: 200000,
                  payment_status: 'paid',
                },
              ],
            },
          }),
        } as Response
      }

      return { ok: true, status: 200, json: async () => ({}) } as Response
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Komisi: 35%')).toBeInTheDocument()
    })
    // 35% of 200.000 = 70.000
    await waitFor(() => {
      expect(screen.getAllByText(/70\.000/).length).toBeGreaterThan(0)
    })
  })
})
