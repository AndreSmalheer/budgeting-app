import "./starter-inhoud.css";

function StarterInhoud() {
  function Ouder() {}

  function Kinderen() {}

  return (
    <>
      <div className="Starter-inhoud">
        <div className="img-container">
          <img src="/spaarvarken.png" alt="Spaarvarken" />
        </div>
        <div className="btn-group">
          <button className="btn" onClick={Ouder}>
            Voor ouders
          </button>
          <button className="btn" onClick={Kinderen}>
            Voor kinderen
          </button>
        </div>
        <div className="container">
          <h1>Bewust sparen</h1>
          <p>Hier beheer je budgetten en houd je je uitgaven eenvoudig bij.</p>
        </div>
      </div>
    </>
  );
}

export default StarterInhoud;
