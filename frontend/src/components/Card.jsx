import PropTypes from 'prop-types'
import './Card.css'

function Card({ title, badge, badgeElement, toggleElement, children, className = '' }) {
    return (
        <div className={`card ${className}`}>
            <div className="card-header">
                <h2 className="card-title">{title}</h2>
                {toggleElement && toggleElement}
                {badge && <span className={`card-badge ${badge.variant}`}>{badge.text}</span>}
                {badgeElement && badgeElement}
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
    badgeElement: PropTypes.node,
    toggleElement: PropTypes.node,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
}

export default Card
