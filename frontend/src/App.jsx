import { useEffect, useState } from 'react'
import { client } from './api/client'
import './App.css'
import Header from './components/Header'
import LinksBar from './components/LinksBar'
import PlayerListCard from './components/PlayerListCard'
import ServerInfoCard from './components/ServerInfoCard'
import ServerStatusCard from './components/ServerStatusCard'

const mockServerData = {
  latency: 45,
  ip: '127.0.0.1',
  port: 25565,
  hostname: 'mock-server.example',
  version: '1.21.10',
  protocol: {
    version: 767,
    name: '1.21.10'
  },
  icon: null,
  map: 'world',
  motd: {
    plain: 'Welcome to the Server!\nHave fun playing!',
    html: '<span style="color: gold;">Welcome to the Server!</span><br><span style="color: gray;">Have fun playing!</span>'
  },
  software: 'Spigot on 1.21.10',
  players: {
    online: 5,
    max: 20,
    player_list: [
      { name: 'Steve', uuid: '8667ba71-b85a-4004-af54-457a9734eed7' },
      { name: 'Alex', uuid: 'ec561538-f3fd-461d-aff5-086b22154bce' },
      { name: 'Notch', uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5' },
      { name: 'Honeydew', uuid: '8f9bc2ed-1bb5-41ed-91be-02625c76bd7f' },
      { name: 'BlueXephos', uuid: '2c6d7b3d-7674-4b18-8d86-bb6a707ea8e4' },
    ]
  },
  plugins: [
    { name: 'Essentials', version: '2.20.1' },
    { name: 'WorldEdit', version: '7.2.18' }
  ],
  mods: [],
  info: {}
}

const mockServerOfflineData = {
  latency: null,
  ip: null,
  port: null,
  hostname: null,
  version: null,
  protocol: null,
  motd: null,
  has_icon: false,
  icon_base64: null,
  forge_data: null,
  players: null
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

const mockExternalData = {
  latency: 60,
  ip: '203.0.113.1',
  port: 25565,
  hostname: 'external-mock-server.example',
  version: '1.21.10',
  protocol: {
    version: 767,
    name: '1.21.10'
  },
  icon: null,
  map: 'world',
  motd: {
    plain: 'Welcome to the Server!\nHave fun playing!',
    html: '<span style="color: gold;">Welcome to the Server!</span><br><span style="color: gray;">Have fun playing!</span>'
  },
  software: 'Spigot on 1.21.10',
  players: {
    online: 5,
    max: 20,
    player_list: [
      { name: 'Steve', uuid: '8667ba71-b85a-4004-af54-457a9734eed7' },
      { name: 'Alex', uuid: 'ec561538-f3fd-461d-aff5-086b22154bce' },
      { name: 'Notch', uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5' },
      { name: 'Honeydew', uuid: '8f9bc2ed-1bb5-41ed-91be-02625c76bd7f' },
      { name: 'BlueXephos', uuid: '2c6d7b3d-7674-4b18-8d86-bb6a707ea8e4' },
    ]
  },
  plugins: [
    { name: 'Essentials', version: '2.20.1' },
    { name: 'WorldEdit', version: '7.2.18' }
  ],
  mods: [],
  info: {}
}

function App() {
  const [serverData, setServerData] = useState(null)
  const [serverDataExternal, setServerExternalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pollingInterval, setPollingInterval] = useState(5000)
  const [useMockData, setUseMockData] = useState(null)
  const [simulateOffline, setSimulateOffline] = useState(false)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [pageTitle, setPageTitle] = useState('Minecraft Server Dashboard')
  const [headerTitle, setHeaderTitle] = useState('Minecraft Server Dashboard')
  const [frontendLinks, setFrontendLinks] = useState([])
  const [useExternalData, setUseExternalData] = useState(true)

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
          setServerExternalData(mockServerOfflineData)
        } else if (useMockData) {
          const newServerData = {
            ...mockServerData,
            latency: Math.round(Math.random() * (500 - 5 + 1)) + 5
          }
          setServerData(newServerData)
          setServerExternalData(useExternalData ? mockExternalData : newServerData)
        } else {
          const statusResponse = await client.GET('/status')

          if (statusResponse.error) {
            throw new Error('Failed to fetch server status')
          }

          const internalData = statusResponse.data.data
          const externalData = (useExternalData && statusResponse.data.data_external) ? statusResponse.data.data_external : internalData

          setServerData(internalData)
          setServerExternalData(externalData)
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
  }, [useMockData, simulateOffline, pollingInterval, configLoaded, useExternalData])


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
      <Header
        headerTitle={headerTitle}
        serverData={useExternalData ? serverDataExternal : serverData}
        useExternalData={useExternalData}
        setUseExternalData={setUseExternalData}
      />

      <main className="main">
        <div className="container">
          <div className="grid">
            <LinksBar links={frontendLinks} />
            <ServerStatusCard serverData={useExternalData ? serverDataExternal : serverData} />
            <ServerInfoCard serverData={useExternalData ? serverDataExternal : serverData} />
            <PlayerListCard players={useExternalData ? serverDataExternal?.players : serverData?.players} />
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

