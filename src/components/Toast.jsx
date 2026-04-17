import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

let toastTimeout = null;

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info;

  useEffect(() => {
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, 2500);
    return () => clearTimeout(toastTimeout);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className={`toast toast--${type}`}>
      <Icon size={18} />
      {message}
    </div>
  );
}
