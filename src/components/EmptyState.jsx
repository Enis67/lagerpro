export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={28} />
        </div>
      )}
      <div className="empty-state-title">{title}</div>
      {text && <div className="empty-state-text">{text}</div>}
      {action}
    </div>
  );
}
