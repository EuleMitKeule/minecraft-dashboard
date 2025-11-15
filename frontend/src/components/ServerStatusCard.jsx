import { useState } from 'react'
import Card from './Card'
import InfoCard from './InfoCard'
import './ServerStatusCard.css'

function ServerStatusCard({ serverData }) {
    const [copyButtonText, setCopyButtonText] = useState('📋')
    const connectionAddress = `${serverData?.hostname}:${serverData?.port}`

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

    const isOnline = !!serverData
    const statusBadge = {
        text: isOnline ? '🟢 Online' : '🔴 Offline',
        variant: isOnline ? 'online' : 'offline'
    }

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
                {serverData?.ip && (
                    <InfoCard title="IP Address">
                        {serverData?.ip}
                    </InfoCard>
                )}
                <InfoCard title="Latency">
                    {serverData?.latency !== null && serverData?.latency !== undefined ? `${serverData.latency}ms` : 'N/A'}
                </InfoCard>
            </div>
            {
                serverData?.players && (
                    <InfoCard title="Player Capacity">
                        <div className="player-bar">
                            <div className="player-bar-label">
                                <span>{serverData?.players?.online}/{serverData?.players?.max}</span>
                                <span>{Math.round((serverData?.players?.online / serverData?.players?.max) * 100)}%</span>
                            </div>
                            <div className="player-bar-track">
                                <div
                                    className="player-bar-fill"
                                    style={{ width: `${(serverData?.players?.online / serverData?.players?.max) * 100}%` }}
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
