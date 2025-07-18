import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import EventManager from './components/EventManager'
import * as Sentry from "@sentry/electron/renderer";

Sentry.init({
  dsn: "https://7d1f0b4e98dec1bf3ed35c23971e7b74@sentry.ipmake.dev/3",
});

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
    <EventManager />
    <App />
  </ThemeProvider>
)
