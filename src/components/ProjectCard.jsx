import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '../data/constants';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const statusColor = PROJECT_STATUS_COLORS[project.status] || '#6B7280';

  return (
    <div
      className="project-card"
      onClick={() => navigate(`/baustellen/${project.id}`)}
      role="button"
      tabIndex={0}
    >
      <div className="project-card-header">
        <div>
          <div className="project-card-name">{project.name}</div>
          <div className="project-card-customer">{project.customer}</div>
        </div>
        <span
          className="status-badge"
          style={{ background: statusColor + '18', color: statusColor }}
        >
          {PROJECT_STATUS_LABELS[project.status] || project.status}
        </span>
      </div>
      <div className="project-card-footer">
        {project.address && (
          <span className="flex items-center gap-sm">
            <MapPin size={14} /> <span className="truncate" style={{ maxWidth: 180 }}>{project.address}</span>
          </span>
        )}
        {project.planned_date && (
          <span className="flex items-center gap-sm">
            <Calendar size={14} />
            {new Date(project.planned_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
