import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import SnowFall from './components/SnowFall'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff' // #743a8d
    },
    secondary: {
      main: '#9619FA'
    }
  }
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <SnowFall />
    <App />
  </ThemeProvider>
)
