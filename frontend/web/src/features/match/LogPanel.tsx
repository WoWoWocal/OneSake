import type { LogEventDto } from '../../types/realtime';
import { formatPhase, formatUnixMs } from './matchFormatters';

interface LogPanelProps {
  logEvents: LogEventDto[];
}

export function LogPanel({ logEvents }: LogPanelProps) {
  return (
    <section className="panel logs-panel">
      <div className="panel-title-row">
        <h2>Match Log</h2>
        <span>{logEvents.length}</span>
      </div>
      <div className="scroll-list">
        {logEvents.length === 0 && <div className="list-entry is-empty">No events yet.</div>}
        {logEvents.map((event) => (
          <div key={`${event.seq}-${event.tsUnixMs}`} className="list-entry">
            <div>
              #{event.seq} [{event.type}] T{event.turnNumber} {formatPhase(event.phase)}
            </div>
            <div>{event.text}</div>
            <small>{formatUnixMs(event.tsUnixMs)}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
