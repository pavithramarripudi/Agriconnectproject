import React from "react";

export function LanguageSelection({ language, setLanguage, onContinue, t }) {
  const languages = [
    { name: "English", native: "English" },
    { name: "Telugu", native: "తెలుగు" },
    { name: "Hindi", native: "हिंदी" },
  ];

  return (
    <div className="page">
      <div className="card shadow-lg">
        <div className="small-logo">🌿</div>

        <h1>{t.chooseLanguage}</h1>
        <p className="subtitle">మీ భాషను ఎంచుకోండి • अपनी भाषा चुनें</p>

        <div className="language-list">
          {languages.map((item) => (
            <button
              key={item.name}
              className={
                language === item.name
                  ? "language-btn selected"
                  : "language-btn"
              }
              onClick={() => setLanguage(item.name)}
            >
              <span className="language-icon">🌐</span>

              <div>
                <strong>{item.native}</strong>
              </div>

              <span className="check">
                {language === item.name ? "✓" : "›"}
              </span>
            </button>
          ))}
        </div>

        <button
          className="continue-btn primary-btn"
          disabled={!language}
          onClick={onContinue}
        >
          {language ? t.continue : "Continue →"}
        </button>
      </div>
    </div>
  );
}

export default LanguageSelection;
