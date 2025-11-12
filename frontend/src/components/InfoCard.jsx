import PropTypes from "prop-types";
import "./InfoCard.css";

function InfoCard({ title, children, className = "", fullWidth = false, action = null }) {
    return (
        <div className={`info-card ${fullWidth ? 'info-card-full-width' : ''} ${className}`}>
            <div className="info-card-content">
                {title && (
                    <div className="info-card-header">
                        <span>{title}</span>
                    </div>
                )}

                <div className="info-card-body">
                    {children}
                </div>
            </div>

            {action && (
                <div className="info-card-action">
                    {action}
                </div>
            )}
        </div>
    );
}

InfoCard.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    fullWidth: PropTypes.bool,
    action: PropTypes.node,
};

export default InfoCard;
