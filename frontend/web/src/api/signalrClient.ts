import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import {
  ChatMessageDto,
  ChoiceSubmissionDto,
  ChoicePromptDto,
  GameStateDto,
  LogEventDto,
} from '../types/realtime';

type StateSnapshotHandler = (snapshot: GameStateDto) => void;
type ChoicePromptHandler = (prompt: ChoicePromptDto) => void;
type ChatMessageHandler = (message: ChatMessageDto) => void;
type LogEventHandler = (event: LogEventDto) => void;

export class SignalRClient {
  private readonly hubUrl: string;
  private connection: HubConnection | null = null;

  private stateSnapshotHandler: StateSnapshotHandler | null = null;
  private choicePromptHandler: ChoicePromptHandler | null = null;
  private chatMessageHandler: ChatMessageHandler | null = null;
  private logEventHandler: LogEventHandler | null = null;

  constructor(hubUrl: string) {
    this.hubUrl = hubUrl;
  }

  async connect(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(this.hubUrl)
        .withAutomaticReconnect()
        .build();

      this.connection.on('StateSnapshot', (snapshot: GameStateDto) => {
        this.stateSnapshotHandler?.(snapshot);
      });

      this.connection.on('ChoicePrompt', (prompt: ChoicePromptDto) => {
        this.choicePromptHandler?.(prompt);
      });

      this.connection.on('ChatMessage', (message: ChatMessageDto) => {
        this.chatMessageHandler?.(message);
      });

      this.connection.on('LogEvent', (event: LogEventDto) => {
        this.logEventHandler?.(event);
      });
    }

    if (this.connection.state === HubConnectionState.Disconnected) {
      await this.connection.start();
    }
  }

  async joinRoom(roomCode: string, displayName: string): Promise<void> {
    await this.connect();
    await this.connection!.invoke('JoinRoom', roomCode, displayName);
  }

  async startMatch(roomCode: string): Promise<void> {
    await this.connect();
    await this.connection!.invoke('StartMatch', roomCode);
  }

  async submitChoice(roomCode: string, submission: ChoiceSubmissionDto): Promise<void> {
    await this.connect();
    await this.connection!.invoke('SubmitChoice', roomCode, submission);
  }

  async sendChat(roomCode: string, text: string): Promise<void> {
    await this.connect();
    await this.connection!.invoke('SendChat', roomCode, text);
  }

  onStateSnapshot(handler: StateSnapshotHandler): void {
    this.stateSnapshotHandler = handler;
  }

  onChoicePrompt(handler: ChoicePromptHandler): void {
    this.choicePromptHandler = handler;
  }

  onChatMessage(handler: ChatMessageHandler): void {
    this.chatMessageHandler = handler;
  }

  onLogEvent(handler: LogEventHandler): void {
    this.logEventHandler = handler;
  }
}
