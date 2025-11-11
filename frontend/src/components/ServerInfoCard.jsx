import './ServerInfoCard.css'

function ServerInfoCard({ server }) {
    const forgeModsCount = server.forge_data?.mods?.length || 0

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Server Information</h2>
            </div>

            <div className="card-content">
                <div className="info-section">
                    <h3 className="section-title">General</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-label">Version</span>
                            <span className="info-value">{server.version?.name || 'Unknown'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Protocol</span>
                            <span className="info-value">{server.version?.protocol || 'Unknown'}</span>
                        </div>
                        {server.enforces_secure_chat !== null && (
                            <div className="info-item">
                                <span className="info-label">Secure Chat</span>
                                <span className="info-value">
                                    {server.enforces_secure_chat ? '✓ Enabled' : '✗ Disabled'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {forgeModsCount > 0 && (
                    <div className="info-section">
                        <h3 className="section-title">Forge Mods ({forgeModsCount})</h3>
                        <div className="plugin-grid">
                            {server.forge_data.mods.slice(0, 8).map((mod, index) => (
                                <div key={index} className="plugin-tag">
                                    <span className="plugin-icon">🔌</span>
                                    {mod.name}
                                </div>
                            ))}
                            {forgeModsCount > 8 && (
                                <div className="plugin-tag">
                                    <span className="plugin-icon">➕</span>
                                    {forgeModsCount - 8} more
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {server.description && (
                    <div className="info-section">
                        <h3 className="section-title">Description</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <span className="info-value">{server.description}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ServerInfoCard
