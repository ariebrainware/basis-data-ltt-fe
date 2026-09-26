import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Register from '../page'
import { apiFetch } from '@/app/_functions/apiFetch'
import Swal from 'sweetalert2'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

jest.mock('@/app/_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
}))

describe('Register Page (Form Registrasi Pasien)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ code: 200, message: 'Success' }),
    })
  })

  test('renders registration form with date of birth input', () => {
    render(<Register />)

    expect(screen.getByText('Form Registrasi Pasien')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nama Lengkap')).toBeInTheDocument()
    expect(screen.getByText('Tanggal Lahir')).toBeInTheDocument()
    expect(document.getElementById('date_of_birth')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Pekerjaan')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Alamat')).toBeInTheDocument()
  })

  test('shows validation error when full name is empty', async () => {
    render(<Register />)

    const checkbox = document.getElementById(
      'termConditionCheckbox'
    ) as HTMLInputElement
    fireEvent.click(checkbox)

    const registerBtn = document.getElementById('registerBtn')!
    fireEvent.click(registerBtn)

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Gagal',
        'Nama lengkap wajib diisi',
        'error'
      )
    })
  })

  test('shows validation error when gender is not selected', async () => {
    render(<Register />)

    fireEvent.change(screen.getByPlaceholderText('Nama Lengkap'), {
      target: { value: 'John Doe' },
    })

    const checkbox = document.getElementById(
      'termConditionCheckbox'
    ) as HTMLInputElement
    fireEvent.click(checkbox)

    const registerBtn = document.getElementById('registerBtn')!
    fireEvent.click(registerBtn)

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Gagal',
        'Jenis kelamin wajib dipilih',
        'error'
      )
    })
  })

  test('submits registration with date_of_birth in payload and resets fields on success', async () => {
    render(<Register />)

    fireEvent.change(screen.getByPlaceholderText('Nama Lengkap'), {
      target: { value: 'Jane Doe' },
    })

    const maleRadio = document.getElementById('gender_male')!
    fireEvent.click(maleRadio)

    const dobInput = document.getElementById(
      'date_of_birth'
    ) as HTMLInputElement
    fireEvent.change(dobInput, { target: { value: '1995-05-20' } })

    fireEvent.change(screen.getByPlaceholderText('Pekerjaan'), {
      target: { value: 'Designer' },
    })

    fireEvent.change(screen.getByPlaceholderText('Nomor Telepon'), {
      target: { value: '08123456789' },
    })

    const checkbox = document.getElementById(
      'termConditionCheckbox'
    ) as HTMLInputElement
    fireEvent.click(checkbox)

    const registerBtn = document.getElementById('registerBtn')!
    fireEvent.click(registerBtn)

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/patient',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"date_of_birth":"1995-05-20"'),
        })
      )
    })

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sukses',
          text: 'Registrasi berhasil.',
          icon: 'success',
        })
      )
    })
  })
})
