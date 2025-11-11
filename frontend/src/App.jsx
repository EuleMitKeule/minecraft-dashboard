import { useEffect, useState } from 'react'
import './App.css'
import PlayerListCard from './components/PlayerListCard'
import ServerInfoCard from './components/ServerInfoCard'
import ServerStatusCard from './components/ServerStatusCard'

const mockServerData = {
  online: true,
  hostname: 'nes-attack.eulenet.io',
  port: 42069,
  version: '1.21.1',
  protocol: 767,
  players: {
    online: 3,
    max: 20,
    list: [
      { name: 'Steve', uuid: '00000000-0000-0000-0000-000000000001' },
      { name: 'Alex', uuid: '00000000-0000-0000-0000-000000000002' },
      { name: 'Notch', uuid: '00000000-0000-0000-0000-000000000003' }
    ]
  },
  motd: {
    raw: '§6Welcome to the Server!\n§7Have fun playing!',
    clean: 'Welcome to the Server!\nHave fun playing!',
    html: '<span style="color: gold;">Welcome to the Server!</span><br><span style="color: gray;">Have fun playing!</span>'
  },
  software: 'Paper',
  plugins: ['EssentialsX', 'WorldEdit', 'LuckPerms', 'Vault']
}

function App() {
  const [serverData, setServerData] = useState(mockServerData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 500)
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

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="title">
            <span className="title-icon">⛏️</span>
            Minecraft Server Dashboard
          </h1>
          <p className="subtitle">{serverData.hostname}:{serverData.port}</p>
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

