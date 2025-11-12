import { useState } from 'react'
import Card from './Card'
import InfoCard from './InfoCard'
import './ServerStatusCard.css'

function ServerStatusCard({ server, connectionAddress, mcsrvStatus, useExternalLatency }) {
    const [copyButtonText, setCopyButtonText] = useState('📋')

    const handleCopyAddress = async () => {
        if (!connectionAddress) return

        try {
            await navigator.clipboard.writeText(connectionAddress)
            setCopyButtonText('✓')
            setTimeout(() => setCopyButtonText('📋'), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    const statusBadge = {
        text: server.online ? '🟢 Online' : '🔴 Offline',
        variant: server.online ? 'online' : 'offline'
    }

    const latency = useExternalLatency ? server.latency : server.latency

    return (
        <Card title="Server Status" badge={statusBadge}>
            <div className="card-grid">
                <InfoCard
                    title="Quick Connect"
                    fullWidth={true}
                    action={
                        <button
                            className="quick-connect-copy-button"
                            onClick={handleCopyAddress}
                            title="Copy to clipboard"
                        >
                            {copyButtonText}
                        </button>
                    }
                >
                    {connectionAddress}
                </InfoCard>
                {mcsrvStatus?.ip && (
                    <InfoCard title="Public IP">
                        {mcsrvStatus.ip}
                    </InfoCard>
                )}
                <InfoCard title="Latency">
                    {latency !== null && latency !== undefined ? `${latency}ms` : 'N/A'}
                </InfoCard>
            </div>
            {
                server.players && (
                    <InfoCard title="Player Capacity">
                        <div className="player-bar">
                            <div className="player-bar-label">
                                <span>{server.players.online}/{server.players.max}</span>
                                <span>{Math.round((server.players.online / server.players.max) * 100)}%</span>
                            </div>
                            <div className="player-bar-track">
                                <div
                                    className="player-bar-fill"
                                    style={{ width: `${(server.players.online / server.players.max) * 100}%` }}
                                />
                            </div>
                        </div>
                    </InfoCard>
                )
            }
        </Card >
    )
}

export default ServerStatusCard
