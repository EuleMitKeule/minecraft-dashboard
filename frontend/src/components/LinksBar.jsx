import './LinksBar.css'

function LinksBar({ links }) {
    if (!links || links.length === 0) {
        return null
    }

    return (
        <div className="links-bar-container">
            <div className="links-bar">
                {links.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-badge"
                        title={link.title}
                    >
                        {link.icon && <span className="link-icon">{link.icon}</span>}
                        <span className="link-title">{link.title}</span>
                    </a>
                ))}
            </div>
        </div>
    )
}

export default LinksBar
