import './PlayerListCard.css'

function PlayerListCard({ players }) {
    const playerList = players?.sample || []
    const online = players?.online || 0
    const max = players?.max || 0

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Online Players</h2>
                <span className="player-count">{online}/{max}</span>
            </div>

            <div className="card-content">
                {playerList.length > 0 ? (
                    <div className="player-list">
                        {playerList.map((player) => (
                            <div key={player.id} className="player-item">
                                <div className="player-avatar">
                                    <img
                                        src={`https://crafthead.net/avatar/${player.id}/32`}
                                        alt={player.name}
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect fill="%238b5cf6" width="32" height="32"/%3E%3C/svg%3E'
                                        }}
                                    />
                                </div>
                                <div className="player-info">
                                    <span className="player-name">{player.name}</span>
                                    <span className="player-uuid">{player.id.substring(0, 8)}...</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-icon">👤</span>
                        <p>No players online</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PlayerListCard
