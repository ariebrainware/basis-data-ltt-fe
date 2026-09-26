import { getUserName, setUserName } from '../userName'

describe('userName helper functions', () => {
  beforeEach(() => {
    window.localStorage.clear()
    jest.clearAllMocks()
  })

  test('getUserName returns null when localStorage is empty', () => {
    expect(getUserName()).toBeNull()
  })

  test('getUserName returns trimmed user name from localStorage', () => {
    window.localStorage.setItem('user-name', '  Dr. Budi Santoso  ')
    expect(getUserName()).toBe('Dr. Budi Santoso')
  })

  test('setUserName sets item and dispatches user-name-change event', () => {
    const listener = jest.fn()
    window.addEventListener('user-name-change', listener)

    setUserName('Super Admin User')

    expect(window.localStorage.getItem('user-name')).toBe('Super Admin User')
    expect(listener).toHaveBeenCalledTimes(1)

    window.removeEventListener('user-name-change', listener)
  })

  test('setUserName with null removes item from localStorage', () => {
    window.localStorage.setItem('user-name', 'Existing Name')

    setUserName(null)

    expect(window.localStorage.getItem('user-name')).toBeNull()
  })
})
