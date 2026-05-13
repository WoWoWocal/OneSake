import type { ConnectionStatus } from '../../api/signalrClient';

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
}

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting',
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  error: 'Error',
};

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  return (
    <span
      aria-live="polite"
      className={`connection-status connection-status--${status}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
