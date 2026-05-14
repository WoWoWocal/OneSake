import startScreenImage from '../../assets/start/onesake-start-screen.png';

type StartScreenProps = {
  onPlay: () => void;
};

export function StartScreen({ onPlay }: StartScreenProps) {
  return (
    <main className="start-screen" aria-label="OneSake start screen">
      <div className="start-screen__art-wrap">
        <img className="start-screen__art" src={startScreenImage} alt="OneSake pirate game board" />
      </div>
      <button className="start-play-button" type="button" onClick={onPlay}>
        <span className="start-play-button__label">PLAY</span>
      </button>
    </main>
  );
}
