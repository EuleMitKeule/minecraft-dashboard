import PropTypes from 'prop-types'
import './Card.css'

function Card({ title, badge, children, className = '' }) {
    return (
        <div className={`card ${className}`}>
            <div className="card-header">
                <h2 className="card-title">{title}</h2>
                {badge && <span className={`card-badge ${badge.variant}`}>{badge.text}</span>}
            </div>

            <div className="card-content">
                {children}
            </div>
        </div>
    )
}

Card.propTypes = {
    title: PropTypes.string.isRequired,
    badge: PropTypes.shape({
        text: PropTypes.string.isRequired,
        variant: PropTypes.oneOf(['online', 'offline']).isRequired,
    }),
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
}

export default Card
