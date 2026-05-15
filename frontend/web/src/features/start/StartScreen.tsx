import startScreenImage from '../../assets/start/onesake-startscreen.png';

type StartScreenProps = {
  onPlay: () => void;
  onLogin?: () => void;
};

export function StartScreen({ onPlay, onLogin }: StartScreenProps) {
  return (
    <main className="start-screen" aria-label="OneSake start screen">
      <div className="start-screen__frame">
        <img className="start-screen__art" src={startScreenImage} alt="OneSake Startscreen" />
        <button className="start-hotspot start-hotspot--play" type="button" aria-label="Play" onClick={onPlay} />
        {onLogin && (
          <button className="start-hotspot start-hotspot--login" type="button" aria-label="Login" onClick={onLogin} />
        )}
      </div>
    </main>
  );
}
