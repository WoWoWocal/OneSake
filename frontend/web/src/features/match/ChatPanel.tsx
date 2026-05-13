import type { FormEvent } from 'react';

import type { ChatMessageDto } from '../../types/realtime';
import { Button } from '../../components/ui/Button';
import { formatUnixMs } from './matchFormatters';

interface ChatPanelProps {
  chatMessages: ChatMessageDto[];
  chatInput: string;
  joinedRoomCode: string;
  pending: boolean;
  canSendChat: boolean;
  onChatInputChange: (value: string) => void;
  onSendChat: (event: FormEvent) => void;
}

export function ChatPanel({
  canSendChat,
  chatInput,
  chatMessages,
  joinedRoomCode,
  onChatInputChange,
  onSendChat,
  pending,
}: ChatPanelProps) {
  return (
    <section className="panel chat-panel">
      <div className="panel-title-row">
        <h2>Chat</h2>
        <span>{chatMessages.length}</span>
      </div>
      <div className="scroll-list">
        {chatMessages.length === 0 && <div className="list-entry is-empty">No messages yet.</div>}
        {chatMessages.map((message) => (
          <div key={`${message.senderId}-${message.tsUnixMs}`} className="list-entry">
            <div>
              <strong>{message.senderId}</strong>
            </div>
            <div>{message.text}</div>
            <small>{formatUnixMs(message.tsUnixMs)}</small>
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={onSendChat}>
        <input
          onChange={(event) => onChatInputChange(event.target.value)}
          placeholder="Write chat message"
          value={chatInput}
        />
        <Button disabled={!joinedRoomCode || pending || !canSendChat} type="submit">
          Send
        </Button>
      </form>
    </section>
  );
}
