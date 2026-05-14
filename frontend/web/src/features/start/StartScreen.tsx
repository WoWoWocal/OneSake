import startScreenImage from '../../assets/start/onesake-start-screen.png';

type StartScreenProps = {
  onPlay: () => void;
};

export function StartScreen({ onPlay }: StartScreenProps) {
  return (
    <main className="start-screen" aria-label="OneSake start screen">
      <div className="start-screen-content">
        <img className="start-screen-logo" src={startScreenImage} alt="OneSake pirate game board" />
        <button className="start-play-button" type="button" onClick={onPlay}>
          <span className="start-play-button__label">PLAY</span>
        </button>
      </div>
    </main>
  );
}
