import '@testing-library/jest-dom';

// Mock para Material-UI DatePicker
jest.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, renderInput, ...props }) => {
    const TextField = require('@mui/material').TextField;
    return renderInput ? renderInput({
      label,
      ...props,
      inputProps: { 'aria-label': label }
    }) : <TextField label={label} {...props} />;
  },
  LocalizationProvider: ({ children }) => children,
  AdapterMoment: jest.fn()
}));

// Mock para React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

// Mock para console.error para reduzir ruído nos testes
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Configuração global para testes do frontend
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock para localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;