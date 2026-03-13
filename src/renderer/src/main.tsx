import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import EventManager from './components/EventManager'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFF000' 
    },
    secondary: {
      main: '#9619FA'
    }
  },
  typography: {
    fontFamily: 'Azbuka, sans-serif',
    button: {
      fontFamily: 'Brda, sans-serif',
      fontStyle: 'italic',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }
  },
  components: {
    MuiTab: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        root: {
          fontFamily: 'Brda, sans-serif',
          fontStyle: 'italic',
          fontSize: '20px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          color: '#ffffff',
          textTransform: 'uppercase',
          opacity: 0.5,
          minHeight: '48px',
          padding: '8px 16px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            opacity: 0.9,
            color: '#FFF000',
            backgroundColor: 'rgba(255, 255, 255, 0.03)'
          },
          '&.Mui-selected': {
            color: '#FFF000',
            opacity: 1,
            textShadow: '0 0 15px rgba(255, 240, 0, 0.5)'
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '48px',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        },
        indicator: {
          backgroundColor: '#FFF000',
          height: '2px',
          boxShadow: '0 -2px 10px rgba(255, 240, 0, 0.8)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            transform: 'skewX(-5deg)',
            fontFamily: 'Azbuka, sans-serif'
          },
          '& .MuiInputBase-input': {
            transform: 'skewX(5deg)'
          }
        }
      }
    }
  }
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <EventManager />
    <App />
  </ThemeProvider>
)
