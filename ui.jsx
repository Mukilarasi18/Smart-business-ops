export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Badge = ({ value }) => <span className={'badge b-' + String(value).toLowerCase().replace(/\s+/g, '-')}>{value}</span>;

export const Empty = ({ text }) => <div className="empty">{text}</div>;

export const Alert = ({ text }) => (text ? <div className="alert">{text}</div> : null);

export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
