import { useEffect, useState } from 'react'
import { client } from './api/client'
import './App.css'
import LinksBar from './components/LinksBar'
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
    name: 'Paper 1.21.1',
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

const mockServerOfflineData = {
  online: false,
  latency: null,
  players: null,
  version: null,
  description: null,
  motd_plain: null,
  motd_html: null,
  enforces_secure_chat: null,
  has_icon: false,
  icon_base64: null,
  forge_data: null
}

const mockConfigData = {
  page_title: 'Mock Minecraft Server',
  header_title: 'Mock Server Dashboard',
  server_address: 'some.mock.server.example:25565',
  frontend_links: [
    { title: 'Mock Map', url: 'https://map.example.com', icon: '🗺️' },
    { title: 'Mock Wiki', url: 'https://wiki.example.com', icon: '📖' },
    { title: 'Mock Discord', url: 'https://discord.gg/mock', icon: '💬' }
  ]
}

const mockMcsrvStatusData = {
  online: true,
  ip: '127.0.0.1',
  port: 25565,
  hostname: 'mock-server.example',
  debug: {
    ping: true,
    query: true,
    bedrock: false,
    srv: true,
    querymismatch: false,
    ipinsrv: false,
    cnameinsrv: false,
    animatedmotd: false,
    cachehit: false,
    cachetime: 1234567890,
    cacheexpire: 1234567990,
    apiversion: 2
  },
  version: 'Paper 1.21.1',
  protocol: {
    version: 767,
    name: '1.21.1'
  },
  icon: null,
  software: 'Paper',
  map: {
    raw: 'world',
    clean: 'world',
    html: '<span>world</span>'
  },
  gamemode: 'Survival',
  serverid: 'mock-server-id',
  eula_blocked: false,
  motd: {
    raw: ['Welcome to Mock Server!', 'Have fun playing!'],
    clean: ['Welcome to Mock Server!', 'Have fun playing!'],
    html: ['<span>Welcome to Mock Server!</span>', '<span>Have fun playing!</span>']
  },
  players: {
    online: 5,
    max: 20,
    list: [
      { name: 'MockPlayer1', uuid: '12345678-1234-1234-1234-123456789abc' },
      { name: 'MockPlayer2', uuid: '87654321-4321-4321-4321-cba987654321' }
    ]
  },
  plugins: [
    { name: 'Essentials', version: '2.20.1' },
    { name: 'WorldEdit', version: '7.2.18' }
  ],
  mods: [],
  info: {
    raw: ['Mock server info'],
    clean: ['Mock server info'],
    html: ['<span>Mock server info</span>']
  }
}

function App() {
  const [serverData, setServerData] = useState(null)
  const [mcsrvStatusData, setMcsrvStatusData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pollingInterval, setPollingInterval] = useState(5000)
  const [useMockData, setUseMockData] = useState(null)
  const [simulateOffline, setSimulateOffline] = useState(false)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [pageTitle, setPageTitle] = useState('Minecraft Server Dashboard')
  const [headerTitle, setHeaderTitle] = useState('Minecraft Server Dashboard')
  const [serverAddress, setServerAddress] = useState('')
  const [frontendLinks, setFrontendLinks] = useState([])
  const [useExternalLatency, setUseExternalLatency] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configResponse = await client.GET('/config')

        if (configResponse.error) {
          throw new Error('Failed to fetch configuration')
        }

        setUseMockData(configResponse.data.use_mock_data)
        setPollingInterval(configResponse.data.polling_interval)
        setSimulateOffline(configResponse.data.simulate_offline)

        if (configResponse.data.use_mock_data) {
          setPageTitle(mockConfigData.page_title)
          setHeaderTitle(mockConfigData.header_title)
          setServerAddress(mockConfigData.server_address)
          setFrontendLinks(mockConfigData.frontend_links)
        } else {
          setPageTitle(configResponse.data.page_title)
          setHeaderTitle(configResponse.data.header_title)
          setServerAddress(configResponse.data.server_address || '')
          setFrontendLinks(configResponse.data.frontend_links || [])
        }

        setConfigLoaded(true)
      } catch (err) {
        console.error('Failed to fetch config:', err)
        setConfigLoaded(true)
      }
    }

    fetchConfig()

    const configIntervalId = setInterval(fetchConfig, 5000)

    return () => clearInterval(configIntervalId)
  }, [])

  useEffect(() => {
    if (!configLoaded) return

    const fetchStatus = async () => {
      try {
        if (simulateOffline) {
          setServerData(mockServerOfflineData)
        } else if (useMockData) {
          setServerData({
            ...mockServerData,
            latency: Math.round(Math.random() * (500 - 5 + 1)) + 5
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
  }, [useMockData, simulateOffline, pollingInterval, configLoaded])

  useEffect(() => {
    if (!configLoaded) return

    const fetchMcsrvStatus = async () => {
      try {
        if (simulateOffline) {
          setMcsrvStatusData(null)
        } else if (useMockData) {
          setMcsrvStatusData(mockMcsrvStatusData)
        } else {
          const mcsrvStatusResponse = await client.GET('/status-mcsrvstatus')

          if (mcsrvStatusResponse.error) {
            console.error('Failed to fetch mcsrvstat data:', mcsrvStatusResponse.error)
            return
          }

          setMcsrvStatusData(mcsrvStatusResponse.data)
        }
      } catch (err) {
        console.error('Error fetching mcsrvstat data:', err)
      }
    }

    fetchMcsrvStatus()

    const mcsrvStatusIntervalId = setInterval(fetchMcsrvStatus, pollingInterval)

    return () => clearInterval(mcsrvStatusIntervalId)
  }, [useMockData, simulateOffline, pollingInterval, configLoaded])

  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

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
          <div className="header-content">
            <div className="header-text">
              <h1 className="title">
                <span className="title-icon">⛏️</span>
                {headerTitle}
              </h1>
              <p className="subtitle">
                {serverAddress} • {serverData.version?.name || 'Unknown Version'}
              </p>
            </div>
            <div className="header-toggle">
              <span className="header-toggle-label">
                {useExternalLatency ? 'External' : 'Internal'}
              </span>
              <label className="header-toggle-switch">
                <input
                  type="checkbox"
                  checked={useExternalLatency}
                  onChange={() => setUseExternalLatency(!useExternalLatency)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="grid">
            <LinksBar links={frontendLinks} />
            <ServerStatusCard
              server={serverData}
              connectionAddress={serverAddress}
              mcsrvStatus={mcsrvStatusData}
              useExternalLatency={useExternalLatency}
            />
            <ServerInfoCard server={serverData} mcsrvStatus={mcsrvStatusData} />
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

