// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom')

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

global.localStorage = localStorageMock

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockImplementation((key) => {
    return localStorageMock[key] || null
  })
  
  localStorageMock.setItem.mockImplementation((key, value) => {
    localStorageMock[key] = value
  })
  
  localStorageMock.removeItem.mockImplementation((key) => {
    delete localStorageMock[key]
  })
  
  localStorageMock.clear.mockImplementation(() => {
    Object.keys(localStorageMock).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key]
      }
    })
  })
})
