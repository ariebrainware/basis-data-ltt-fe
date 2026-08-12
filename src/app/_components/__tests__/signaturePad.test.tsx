import '@testing-library/jest-dom'
import React, { createRef } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SignaturePad, SignaturePadRef } from '../signaturePad'

// Polyfill PointerEvent for JSDOM which lacks native support
class MockPointerEvent extends MouseEvent {
  pointerId: number
  pointerType: string
  isPrimary: boolean

  constructor(type: string, params: any = {}) {
    super(type, params)
    this.pointerId = params.pointerId || 0
    this.pointerType = params.pointerType || ''
    this.isPrimary = params.isPrimary || false
  }
}

describe('SignaturePad Component', () => {
  const mockContext = {
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    setTransform: jest.fn(),
    clearRect: jest.fn(),
    scale: jest.fn(),
    lineWidth: 3,
    lineCap: 'round',
    lineJoin: 'round',
    strokeStyle: '#0f172a',
  }

  const mockGetContext = jest.fn().mockReturnValue(mockContext)
  const mockToDataURL = jest
    .fn()
    .mockReturnValue('data:image/png;base64,mockImage')
  const mockSetPointerCapture = jest.fn()
  const mockReleasePointerCapture = jest.fn()
  const mockGetBoundingClientRect = jest.fn().mockReturnValue({
    left: 10,
    top: 20,
    width: 400,
    height: 220,
  })

  beforeAll(() => {
    global.PointerEvent = MockPointerEvent as any

    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      configurable: true,
    })

    HTMLCanvasElement.prototype.getContext = mockGetContext as any
    HTMLCanvasElement.prototype.toDataURL = mockToDataURL
    HTMLCanvasElement.prototype.setPointerCapture = mockSetPointerCapture
    HTMLCanvasElement.prototype.releasePointerCapture =
      mockReleasePointerCapture
    HTMLCanvasElement.prototype.getBoundingClientRect =
      mockGetBoundingClientRect
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders with custom label and placeholder text', () => {
    const mockOnChange = jest.fn()
    render(<SignaturePad onChange={mockOnChange} />)

    expect(screen.getByText('Tanda Tangan Pasien')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Gunakan mouse, sentuhan, atau Apple Pencil untuk tanda tangan di sini'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /hapus tanda tangan/i })
    ).toBeInTheDocument()
  })

  test('simulates drawing flow and triggers onChange', () => {
    const mockOnChange = jest.fn()
    const { container } = render(<SignaturePad onChange={mockOnChange} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    if (!canvas) throw new Error('Canvas not found')

    // Start drawing
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 50, clientY: 50 })
    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.moveTo).toHaveBeenCalledWith(40, 30) // clientX (50) - rect.left (10), clientY (50) - rect.top (20)

    // Moving
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 60, clientY: 70 })
    expect(mockContext.lineTo).toHaveBeenCalledWith(50, 50) // 60-10, 70-20
    expect(mockContext.stroke).toHaveBeenCalled()

    // Stop drawing
    fireEvent.pointerUp(canvas, { pointerId: 1 })
    expect(mockOnChange).toHaveBeenCalledWith('data:image/png;base64,mockImage')

    // Placeholder should be hidden
    expect(
      screen.queryByText(
        'Gunakan mouse, sentuhan, atau Apple Pencil untuk tanda tangan di sini'
      )
    ).not.toBeInTheDocument()
  })

  test('clears the signature and triggers callbacks', () => {
    const mockOnChange = jest.fn()
    const mockOnClear = jest.fn()
    const { container } = render(
      <SignaturePad onChange={mockOnChange} onClear={mockOnClear} />
    )
    const canvas = container.querySelector('canvas')
    if (!canvas) throw new Error('Canvas not found')

    // Draw first to make it non-empty
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 50, clientY: 50 })
    fireEvent.pointerUp(canvas, { pointerId: 1 })
    expect(
      screen.queryByText(
        'Gunakan mouse, sentuhan, atau Apple Pencil untuk tanda tangan di sini'
      )
    ).not.toBeInTheDocument()

    // Click clear button
    const clearButton = screen.getByRole('button', { name: /hapus/i })
    fireEvent.click(clearButton)

    expect(mockContext.clearRect).toHaveBeenCalled()
    expect(mockOnChange).toHaveBeenLastCalledWith('')
    expect(mockOnClear).toHaveBeenCalled()

    // Placeholder should be visible again
    expect(
      screen.getByText(
        'Gunakan mouse, sentuhan, atau Apple Pencil untuk tanda tangan di sini'
      )
    ).toBeInTheDocument()
  })

  test('supports imperative clear ref method', () => {
    const mockOnChange = jest.fn()
    const ref = createRef<SignaturePadRef>()
    const { container } = render(
      <SignaturePad ref={ref} onChange={mockOnChange} />
    )
    const canvas = container.querySelector('canvas')
    if (!canvas) throw new Error('Canvas not found')

    // Draw first to make it non-empty
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 50, clientY: 50 })
    fireEvent.pointerUp(canvas, { pointerId: 1 })
    expect(
      screen.queryByText(
        'Gunakan mouse, sentuhan, atau Apple Pencil untuk tanda tangan di sini'
      )
    ).not.toBeInTheDocument()

    // Call clear imperatively
    act(() => {
      ref.current?.clear()
    })

    expect(mockContext.clearRect).toHaveBeenCalled()
    expect(mockOnChange).toHaveBeenLastCalledWith('')
    expect(
      screen.getByText(
        'Gunakan mouse, sentuhan, atau Apple Pencil untuk tanda tangan di sini'
      )
    ).toBeInTheDocument()
  })

  test('handles pointerleave and pointercancel to stop drawing', () => {
    const mockOnChange = jest.fn()
    const { container } = render(<SignaturePad onChange={mockOnChange} />)
    const canvas = container.querySelector('canvas')
    if (!canvas) throw new Error('Canvas not found')

    // Down
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 50, clientY: 50 })
    // Leave
    fireEvent.pointerLeave(canvas, { pointerId: 1 })
    expect(mockOnChange).toHaveBeenCalledWith('data:image/png;base64,mockImage')
    mockOnChange.mockClear()

    // Down again
    fireEvent.pointerDown(canvas, { pointerId: 2, clientX: 50, clientY: 50 })
    // Cancel
    fireEvent.pointerCancel(canvas, { pointerId: 2 })
    expect(mockOnChange).toHaveBeenCalledWith('data:image/png;base64,mockImage')
  })
})
