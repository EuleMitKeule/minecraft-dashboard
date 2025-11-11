import './ServerStatusCard.css'

function ServerStatusCard({ server }) {
    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Server Status</h2>
                <span className={`status-badge ${server.online ? 'online' : 'offline'}`}>
                    {server.online ? '🟢 Online' : '🔴 Offline'}
                </span>
            </div>

            <div className="card-content">
                <div className="status-grid">
                    <div className="status-item">
                        <span className="status-label">Players</span>
                        <span className="status-value">
                            {server.players?.online || 0} / {server.players?.max || 0}
                        </span>
                    </div>

                    <div className="status-item">
                        <span className="status-label">Version</span>
                        <span className="status-value">{server.version?.name || 'Unknown'}</span>
                    </div>

                    <div className="status-item">
                        <span className="status-label">Protocol</span>
                        <span className="status-value">{server.version?.protocol || 'Unknown'}</span>
                    </div>

                    {server.latency && (
                        <div className="status-item">
                            <span className="status-label">Latency</span>
                            <span className="status-value">{server.latency}ms</span>
                        </div>
                    )}
                </div>

                {server.motd_html && (
                    <div className="motd-section">
                        <h3 className="section-title">Message of the Day</h3>
                        <div
                            className="motd-content"
                            dangerouslySetInnerHTML={{ __html: server.motd_html }}
                        />
                    </div>
                )}

                {server.players && (
                    <div className="player-bar">
                        <div className="player-bar-label">
                            <span>Player Capacity</span>
                            <span>{Math.round((server.players.online / server.players.max) * 100)}%</span>
                        </div>
                        <div className="player-bar-track">
                            <div
                                className="player-bar-fill"
                                style={{ width: `${(server.players.online / server.players.max) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ServerStatusCard
