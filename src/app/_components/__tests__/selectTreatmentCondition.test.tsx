import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TreatmentConditionMultiSelect } from '../selectTreatmentCondition'

describe('TreatmentConditionMultiSelect', () => {
  describe('Browser mode (native select multiple)', () => {
    test('renders native select element in browser mode', () => {
      const mockOnChange = jest.fn()
      render(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          value={[]}
          onChange={mockOnChange}
        />
      )

      const selectElement = screen.getByTestId('test-select')
      expect(selectElement).toBeInTheDocument()
      expect(selectElement.tagName).toBe('SELECT')
      expect(selectElement).toHaveAttribute('multiple')
    })

    test('renders all treatment condition options', () => {
      const mockOnChange = jest.fn()
      render(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          value={[]}
          onChange={mockOnChange}
        />
      )

      // Check for a few key options
      expect(screen.getByText('Tit Tar (TT)')).toBeInTheDocument()
      expect(screen.getByText('Massage Gun (MG)')).toBeInTheDocument()
      expect(screen.getByText('Chiro Gun (CG)')).toBeInTheDocument()
      expect(screen.getByText('Dry Needling (DN)')).toBeInTheDocument()
    })

    test('displays selected values correctly', () => {
      const mockOnChange = jest.fn()
      render(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          value={['TT', 'MG']}
          onChange={mockOnChange}
        />
      )

      const selectElement = screen.getByTestId(
        'test-select'
      ) as HTMLSelectElement
      const selectedOptions = Array.from(selectElement.selectedOptions).map(
        (opt) => opt.value
      )

      expect(selectedOptions).toEqual(['TT', 'MG'])
    })

    test('calls onChange when selection changes', () => {
      const mockOnChange = jest.fn()
      render(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          value={[]}
          onChange={mockOnChange}
        />
      )

      const selectElement = screen.getByTestId(
        'test-select'
      ) as HTMLSelectElement

      // Get the actual options from the select element
      const options = selectElement.options

      // Select the first two options (TT and MG)
      options[0].selected = true
      options[1].selected = true

      // Trigger the change event
      fireEvent.change(selectElement)

      expect(mockOnChange).toHaveBeenCalledWith(['TT', 'MG'])
    })

    test('respects disabled prop', () => {
      const mockOnChange = jest.fn()
      render(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          value={[]}
          onChange={mockOnChange}
          disabled={true}
        />
      )

      const selectElement = screen.getByTestId('test-select')
      expect(selectElement).toBeDisabled()
    })

    test('updates when value prop changes', () => {
      const mockOnChange = jest.fn()
      const { rerender } = render(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          value={['TT']}
          onChange={mockOnChange}
        />
      )

      let selectElement = screen.getByTestId('test-select') as HTMLSelectElement
      let selectedOptions = Array.from(selectElement.selectedOptions).map(
        (opt) => opt.value
      )
      expect(selectedOptions).toEqual(['TT'])

      // Update value prop
      rerender(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          value={['MG', 'CG']}
          onChange={mockOnChange}
        />
      )

      selectElement = screen.getByTestId('test-select') as HTMLSelectElement
      selectedOptions = Array.from(selectElement.selectedOptions).map(
        (opt) => opt.value
      )
      expect(selectedOptions).toEqual(['MG', 'CG'])
    })

    test('handles empty value prop', () => {
      const mockOnChange = jest.fn()
      render(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          value={[]}
          onChange={mockOnChange}
        />
      )

      const selectElement = screen.getByTestId(
        'test-select'
      ) as HTMLSelectElement
      expect(selectElement.selectedOptions.length).toBe(0)
    })

    test('handles undefined value prop', () => {
      const mockOnChange = jest.fn()
      render(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          onChange={mockOnChange}
        />
      )

      const selectElement = screen.getByTestId(
        'test-select'
      ) as HTMLSelectElement
      expect(selectElement.selectedOptions.length).toBe(0)
    })

    test('renders all 14 treatment condition options', () => {
      const mockOnChange = jest.fn()
      render(
        <TreatmentConditionMultiSelect
          id="test-select"
          label="Test Label"
          value={[]}
          onChange={mockOnChange}
        />
      )

      const selectElement = screen.getByTestId(
        'test-select'
      ) as HTMLSelectElement
      // Should have 14 options based on TreatmentConditionOptions
      expect(selectElement.options.length).toBe(14)
    })
  })
})
