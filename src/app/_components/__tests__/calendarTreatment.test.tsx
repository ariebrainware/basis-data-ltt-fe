import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CalendarTreatment, {
  formatIndonesianDate,
  INDONESIAN_MONTHS,
  INDONESIAN_DAYS_SHORT,
} from '../calendarTreatment'
import { format, addMonths, subMonths } from 'date-fns'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock Material Tailwind
jest.mock('@material-tailwind/react', () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardBody: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  Typography: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  Button: ({
    children,
    onClick,
    className,
    disabled,
    'aria-label': ariaLabel,
  }: any) => (
    <button
      onClick={onClick}
      className={className}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
  Input: ({ label, value, onChange, onKeyDown }: any) => (
    <input
      placeholder={label}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      data-testid="search-input"
    />
  ),
}))

// Mock useFetchTreatment hook
const mockRefetch = jest.fn()
let mockHookReturn = {
  data: { treatment: [] },
  total: 0,
  loading: false,
  error: null,
  refetch: mockRefetch,
}

jest.mock('../../_hooks/useFetchTreatment', () => ({
  useFetchTreatment: jest.fn(() => mockHookReturn),
}))

// Mock apiFetch
jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            treatments: [
              {
                ID: '101',
                treatment_date: '2026-11-05 10:00',
                patient_name: 'Budi Santoso',
              },
            ],
          },
        }),
    })
  ),
}))

// Mock TableTreatment and Pagination
jest.mock('../tableTreatment', () => {
  return function MockTableTreatment(props: any) {
    return (
      <div data-testid="table-treatment">
        {props.loading && <div>Loading treatments...</div>}
        {props.error && <div>{props.error}</div>}
        {props.emptyMessage && <div>{props.emptyMessage}</div>}
        <div data-testid="treatment-count">
          {props.Data?.treatment?.length || 0} items
        </div>
      </div>
    )
  }
})

jest.mock('../pagination', () => {
  return function MockPagination(props: any) {
    return <div data-testid="pagination">Page: {props.currentPage}</div>
  }
})

describe('CalendarTreatment Component', () => {
  const originalOpen = window.open

  beforeEach(() => {
    jest.clearAllMocks()
    window.open = jest.fn()
  })

  afterAll(() => {
    window.open = originalOpen
  })

  test('formatIndonesianDate correctly formats dates', () => {
    expect(formatIndonesianDate('2026-11-03')).toBe('Selasa, 3 November 2026')
    expect(formatIndonesianDate('2026-01-01')).toBe('Kamis, 1 Januari 2026')
    expect(formatIndonesianDate('')).toBe('')
  })

  test('renders "Jadwal Penanganan" title and description', () => {
    render(<CalendarTreatment userRole="super_admin" />)

    expect(screen.getByText('Jadwal Penanganan')).toBeInTheDocument()
    expect(
      screen.getByText(/Pantau riwayat penanganan, kelola jadwal hari ini/i)
    ).toBeInTheDocument()
  })

  test('renders calendar weekday headers', () => {
    render(<CalendarTreatment />)

    INDONESIAN_DAYS_SHORT.forEach((dayName) => {
      expect(screen.getByText(dayName)).toBeInTheDocument()
    })
  })

  test('renders current month and year in title', () => {
    const now = new Date()
    const expectedMonthTitle = `${INDONESIAN_MONTHS[now.getMonth()]} ${now.getFullYear()}`

    render(<CalendarTreatment />)
    expect(screen.getByText(expectedMonthTitle)).toBeInTheDocument()
  })

  test('navigates to next and previous month', () => {
    const now = new Date()
    render(<CalendarTreatment />)

    const nextBtn = screen.getByLabelText('Bulan Berikutnya')
    fireEvent.click(nextBtn)

    const nextMonth = addMonths(now, 1)
    const expectedNextTitle = `${INDONESIAN_MONTHS[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`
    expect(screen.getByText(expectedNextTitle)).toBeInTheDocument()

    const prevBtn = screen.getByLabelText('Bulan Sebelumnya')
    fireEvent.click(prevBtn) // Back to current
    fireEvent.click(prevBtn) // Go to previous month

    const prevMonth = subMonths(now, 1)
    const expectedPrevTitle = `${INDONESIAN_MONTHS[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`
    expect(screen.getByText(expectedPrevTitle)).toBeInTheDocument()
  })

  test('clicking a date updates the selected date and displays relative status badge', async () => {
    render(<CalendarTreatment userRole="super_admin" />)

    // Today is selected by default
    expect(screen.getAllByText(/Hari Ini/i).length).toBeGreaterThan(0)

    // Quick jump to Besok (Tomorrow, future date)
    const besokBtn = screen.getByRole('button', { name: 'Besok' })
    fireEvent.click(besokBtn)

    await waitFor(() => {
      expect(screen.getByText(/Jadwal Mendatang/i)).toBeInTheDocument()
    })

    // Quick jump to Kemarin (Yesterday, past date)
    const kemarinBtn = screen.getByRole('button', { name: 'Kemarin' })
    fireEvent.click(kemarinBtn)

    await waitFor(() => {
      expect(screen.getByText(/Riwayat Lampau/i)).toBeInTheDocument()
    })
  })

  test('allows switching between Kalender and Tabel view modes', () => {
    render(<CalendarTreatment />)

    const tableModeBtn = screen.getByRole('button', { name: /Tabel/i })
    fireEvent.click(tableModeBtn)

    expect(
      screen.getByText(/Tampilkan Semua Tanggal \(Riwayat & Mendatang\)/i)
    ).toBeInTheDocument()

    const calendarModeBtn = screen.getByRole('button', { name: /Kalender/i })
    fireEvent.click(calendarModeBtn)

    // Weekday headers should be visible again
    expect(screen.getByText('Sen')).toBeInTheDocument()
  })

  test('shows "+ Tambah Penanganan" button for super_admin and opens registration with date', () => {
    render(<CalendarTreatment userRole="super_admin" />)

    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const addButtons = screen.getAllByRole('button', {
      name: /Tambah Penanganan/i,
    })
    expect(addButtons.length).toBeGreaterThan(0)

    fireEvent.click(addButtons[0])
    expect(window.open).toHaveBeenCalledWith(
      `/treatment/register?date=${todayStr}`,
      '_blank'
    )
  })

  test('handles search input on Enter key', () => {
    render(<CalendarTreatment />)

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'Sakit Kepala' } })
    fireEvent.keyDown(searchInput, { key: 'Enter' })

    // searchInput state is set and trigger refetch
    expect(searchInput).toHaveValue('Sakit Kepala')
  })
})
