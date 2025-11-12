import Card from './Card'
import InfoCard from './InfoCard'
import './ServerInfoCard.css'

function ServerInfoCard({ server }) {
    const forgeModsCount = server.forge_data?.mods?.length || 0

    return (
        <Card title="Server Information">
            <div className="card-grid">
                <InfoCard title="Version">{server.version?.name || 'Unknown'}</InfoCard>
                <InfoCard title="Protocol">{server.version?.protocol || 'Unknown'}</InfoCard>
                {server.enforces_secure_chat !== null && (
                    <InfoCard title="Secure Chat">
                        {server.enforces_secure_chat ? 'Enabled' : 'Disabled'}
                    </InfoCard>
                )}
            </div>

            {/* <InfoCard title={`Forge Mods (${forgeModsCount})`}>
                <div className="plugin-grid">
                    {server.forge_data?.mods?.slice(0, 8).map((mod, index) => (
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
            </InfoCard> */}

            {server.motd_html && (
                <InfoCard title="Motd">
                    <div
                        className="motd-content"
                        dangerouslySetInnerHTML={{ __html: server.motd_html }}
                    />
                </InfoCard>
            )}
        </Card>
    )
}

export default ServerInfoCard
