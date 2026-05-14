import startScreenImage from '../../assets/start/onesake-start-screen.png';

type StartScreenProps = {
  onPlay: () => void;
  onOpenDeckbuilder?: () => void;
  onOpenTools?: () => void;
};

export function StartScreen({ onPlay, onOpenDeckbuilder, onOpenTools }: StartScreenProps) {
  return (
    <main className="start-screen" aria-label="OneSake start screen">
      <div className="start-screen-content">
        <img className="start-screen-logo" src={startScreenImage} alt="OneSake pirate game board" />
        <div className="start-screen__overlay">
          <button className="start-play-button" type="button" onClick={onPlay}>
            <span className="start-play-button__label">PLAY</span>
          </button>
          {(onOpenDeckbuilder || onOpenTools) && (
            <div className="start-secondary-actions" aria-label="Quick start actions">
              {onOpenDeckbuilder && (
                <button className="start-secondary-button" type="button" onClick={onOpenDeckbuilder}>
                  Deckbuilder
                </button>
              )}
              {onOpenTools && (
                <button className="start-secondary-button" type="button" onClick={onOpenTools}>
                  Tools
                </button>
              )}
            </div>
          )}
          <p className="start-screen__tagline">Build decks, test hands, and play matches.</p>
        </div>
      </div>
    </main>
  );
}
