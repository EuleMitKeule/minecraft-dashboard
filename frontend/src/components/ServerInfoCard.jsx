import './ServerInfoCard.css'

function ServerInfoCard({ server }) {
    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Server Information</h2>
            </div>

            <div className="card-content">
                <div className="info-section">
                    <h3 className="section-title">Connection</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-label">Hostname</span>
                            <span className="info-value">{server.hostname}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Port</span>
                            <span className="info-value">{server.port}</span>
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h3 className="section-title">Plugins</h3>
                    <div className="plugin-grid">
                        {server.plugins.map((plugin, index) => (
                            <div key={index} className="plugin-tag">
                                <span className="plugin-icon">🔌</span>
                                {plugin}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="info-section">
                    <h3 className="section-title">Quick Connect</h3>
                    <div className="connect-box">
                        <code className="connect-code">
                            {server.hostname}:{server.port}
                        </code>
                        <button
                            className="copy-button"
                            onClick={() => {
                                navigator.clipboard.writeText(`${server.hostname}:${server.port}`)
                            }}
                            title="Copy to clipboard"
                        >
                            📋
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServerInfoCard
