
function Header({ headerTitle, serverData, useExternalData, setUseExternalData }) {
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="header-text">
                        <h1 className="title">
                            <span className="title-icon">⛏️</span>
                            {headerTitle}
                        </h1>
                        <p className="subtitle">
                            {serverData?.hostname}:{serverData?.port} • {serverData?.software || 'Unknown Version'}
                        </p>
                    </div>
                    <div className="header-toggle">
                        <span className="header-toggle-label">
                            {useExternalData ? 'External' : 'Internal'}
                        </span>
                        <label className="header-toggle-switch">
                            <input
                                type="checkbox"
                                checked={useExternalData}
                                onChange={() => setUseExternalData(!useExternalData)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
