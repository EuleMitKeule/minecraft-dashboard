import { useEffect, useState } from 'react'
import { client } from './api/client'
import './App.css'
import PlayerListCard from './components/PlayerListCard'
import ServerInfoCard from './components/ServerInfoCard'
import ServerStatusCard from './components/ServerStatusCard'

const mockServerData = {
  online: true,
  latency: 45,
  players: {
    online: 5,
    max: 20,
    sample: [
      { name: 'Steve', id: '8667ba71-b85a-4004-af54-457a9734eed7' },
      { name: 'Alex', id: 'ec561538-f3fd-461d-aff5-086b22154bce' },
      { name: 'Notch', id: '069a79f4-44e9-4726-a5be-fca90e38aaf5' },
      { name: 'Honeydew', id: '8f9bc2ed-1bb5-41ed-91be-02625c76bd7f' },
      { name: 'BlueXephos', id: '2c6d7b3d-7674-4b18-8d86-bb6a707ea8e4' },
    ]
  },
  version: {
    name: '1.21.1',
    protocol: 767
  },
  description: 'A friendly Minecraft server',
  motd_plain: 'Welcome to the Server!\nHave fun playing!',
  motd_html: '<span style="color: gold;">Welcome to the Server!</span><br><span style="color: gray;">Have fun playing!</span>',
  enforces_secure_chat: true,
  has_icon: false,
  icon_base64: null,
  forge_data: null
}

function App() {
  const [serverData, setServerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pollingInterval, setPollingInterval] = useState(5000)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configResponse = await client.GET('/config')

        if (configResponse.error) {
          throw new Error('Failed to fetch configuration')
        }

        setUseMockData(configResponse.data.use_mock_data)
        setPollingInterval(configResponse.data.polling_interval)
      } catch (err) {
        console.error('Failed to fetch config:', err)
      }
    }

    fetchConfig()

    const configIntervalId = setInterval(fetchConfig, 5000)

    return () => clearInterval(configIntervalId)
  }, [])

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (useMockData) {
          setServerData({
            ...mockServerData,
            latency: Math.floor(Math.random() * (500 - 5 + 1)) + 5
          })
        } else {
          const statusResponse = await client.GET('/status')

          if (statusResponse.error) {
            throw new Error('Failed to fetch server status')
          }

          setServerData(statusResponse.data)
        }
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    const statusIntervalId = setInterval(fetchStatus, pollingInterval)

    return () => clearInterval(statusIntervalId)
  }, [useMockData, pollingInterval])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading server data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="title">
            <span className="title-icon">⛏️</span>
            Minecraft Server Dashboard
          </h1>
          <p className="subtitle">
            {serverData.version?.name || 'Unknown Version'}
          </p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="grid">
            <ServerStatusCard server={serverData} />
            <ServerInfoCard server={serverData} />
            <PlayerListCard players={serverData.players} />
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </footer>
    </div>
  )
}

export default App

