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
    online: 3,
    max: 20,
    sample: [
      { name: 'Steve', id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      { name: 'Alex', id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
      { name: 'Notch', id: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
      { name: 'Honeydew', id: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
      { name: 'BlueXephos', id: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configResponse = await client.GET('/config')

        if (configResponse.error) {
          throw new Error('Failed to fetch configuration')
        }

        const useMockData = configResponse.data.use_mock_data

        if (useMockData) {
          setServerData(mockServerData)
        } else {
          const statusResponse = await client.GET('/status')

          if (statusResponse.error) {
            throw new Error('Failed to fetch server status')
          }

          setServerData(statusResponse.data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

