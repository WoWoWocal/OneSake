import type { LogEventDto } from '../../types/realtime';
import { formatPhase, formatUnixMs } from './matchFormatters';

interface LogPanelProps {
  logEvents: LogEventDto[];
}

export function LogPanel({ logEvents }: LogPanelProps) {
  return (
    <section className="panel logs-panel">
      <h2>Log Events</h2>
      <div className="scroll-list">
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
