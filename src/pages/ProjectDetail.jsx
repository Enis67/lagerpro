import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, MapPin, Calendar, Zap } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '../data/constants';
import MovementRow from '../components/MovementRow';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, movements, removeProject } = useStore();
  const [showDelete, setShowDelete] = useState(false);

  const project = projects.find(p => p.id === id);
  if (!project) {
    return (
      <>
        <header className="page-header">
          <button className="page-header-back" onClick={() => navigate(-1)}><ChevronLeft size={22} /></button>
          <h1>Nicht gefunden</h1>
          <div style={{ width: 44 }} />
        </header>
      </>
    );
  }

  const projectMovements = movements.filter(m => m.project_id === project.id);
  const statusColor = PROJECT_STATUS_COLORS[project.status] || '#6B7280';

  // Material-Zusammenfassung aus Bewegungen
  const materialSummary = {};
  projectMovements.forEach(m => {
    if (!materialSummary[m.material_id]) {
      materialSummary[m.material_id] = { entnahme: 0, reservierung: 0 };
    }
    if (m.type === 'entnahme') materialSummary[m.material_id].entnahme += m.quantity;
    if (m.type === 'reservierung') materialSummary[m.material_id].reservierung += m.quantity;
  });

  async function handleDelete() {
    await removeProject(project.id);
    navigate('/baustellen');
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontSize: 'var(--font-size-lg)' }} className="truncate">{project.name}</h1>
        <button className="page-header-action" onClick={() => navigate(`/baustellen/${id}/edit`)}>
          <Edit size={18} />
        </button>
      </header>

      <div className="page-content">
        {/* Status & Info */}
        <div className="card mb-lg">
          <div className="flex justify-between items-center mb-md">
            <span className="status-badge" style={{ background: statusColor + '18', color: statusColor }}>
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
            {project.planned_date && (
              <span className="flex items-center gap-sm text-sm text-secondary">
                <Calendar size={14} />
                {new Date(project.planned_date).toLocaleDateString('de-DE')}
              </span>
            )}
          </div>
          <div className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>{project.customer}</div>
          {project.address && (
            <div className="flex items-center gap-sm text-sm text-secondary mt-sm">
              <MapPin size={14} /> {project.address}
            </div>
          )}
          {project.notes && (
            <div className="text-sm mt-md" style={{ background: 'var(--color-bg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
              {project.notes}
            </div>
          )}
        </div>

        {/* Schnell buchen für diese Baustelle */}
        <button
          className="btn btn-accent btn-full btn-lg mb-lg"
          onClick={() => navigate('/buchen')}
        >
          <Zap size={20} /> Material buchen
        </button>

        {/* Bewegungen dieser Baustelle */}
        <div className="detail-section">
          <h3 className="detail-section-title">Materialbuchungen ({projectMovements.length})</h3>
          <div className="card">
            {projectMovements.length > 0 ? (
              projectMovements.map(m => <MovementRow key={m.id} movement={m} />)
            ) : (
              <div className="text-center text-secondary" style={{ padding: 'var(--space-xl)' }}>
                Noch kein Material gebucht
              </div>
            )}
          </div>
        </div>

        {/* Löschen */}
        <button
          className="btn btn-ghost btn-full"
          style={{ color: 'var(--color-danger)', marginTop: 'var(--space-xl)' }}
          onClick={() => setShowDelete(true)}
        >
          <Trash2 size={16} /> Baustelle löschen
        </button>

        {showDelete && (
          <ConfirmDialog
            title="Baustelle löschen?"
            message={`„${project.name}" wird gelöscht. Buchungen bleiben erhalten.`}
            confirmText="Löschen"
            danger
            onCancel={() => setShowDelete(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </>
  );
}
