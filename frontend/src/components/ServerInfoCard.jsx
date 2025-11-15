import Card from './Card'
import InfoCard from './InfoCard'
import './ServerInfoCard.css'

function ServerInfoCard({ serverData }) {
    const forgeModsCount = serverData?.forge_data?.mods?.length || 0

    return (
        <Card title="Server Information">
            <div className="card-grid">
                <InfoCard title="Version">{serverData?.version || 'Unknown'}</InfoCard>
                <InfoCard title="Protocol">{serverData?.protocol?.version ?? serverData?.protocol?.version ?? 'Unknown'}</InfoCard>
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

            {serverData?.motd?.html && (
                <InfoCard
                    title="Motd"
                    className={`motd-card ${serverData.motd.html.includes('<br>') || serverData.motd.html.includes('\n') ? 'motd-multiline' : 'motd-singleline'}`}
                >
                    <div
                        className="motd-content"
                        dangerouslySetInnerHTML={{ __html: serverData.motd.html }}
                    />
                </InfoCard>
            )}
        </Card>
    )
}

export default ServerInfoCard
