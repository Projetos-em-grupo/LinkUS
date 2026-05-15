import Header from "./Header.jsx";
import "../css/LandingPage.css";

export const LandingPage = () => {
  // LISTA DE FEATURES
  const features = [
    { text: "Troque mensagens ilimitadas" },
    { text: "Compartilhe citações na redes" },
    { text: "Grupos e comunidades" },
    { text: "Descubra pessoas por interesses" },
  ];

  return (
    <div className="landing-page">
      <div className="container">

        {/* BANNER PRINCIPAL */}
        <section className="hero-section">
          <img
            className="hero-image"
            alt="Person reading a book"
            src="../../public/ilustrations/ilustracao5.png"
          />
          <div className="hero-content">
            <h1 className="hero-title">Conecte-se através dos livros</h1>
            <p className="hero-subtitle">converse, compartilhe e descubra novas histórias</p>
            <button className="start-button">Começar</button>
          </div>
        </section>

        {/* SEÇÃO DE FEATURES */}
        <section className="features-section">
          <div className="features-background">
            {/* ELEMENTPS DECORATIVOS */}
            <img
              className="decorative-rectangle"
              alt="Rectangle"
              src="../../public/icons/retangulo.svg"
            />
            <img
              className="decorative-frame"
              alt="Frame"
              src="../../public/icons/frame.svg"
            />

            {/* LISTA DE FEATURES */}
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <img
                    className="feature-icon"
                    alt="Feature icon"
                    src="../../public/icons/checkmark.svg"
                  />
                  <div className="feature-text">{feature.text}</div>
                </div>
              ))}
            </div>

            {/* IMAGEM DO LADO DIREITO */}
            <img
              className="features-image"
              alt="People reading"
              src="../../public/img/imagem.svg"
            />
          </div>
        </section>

        {/* BANNER FINAL (SESSÃO CTA) */}
        <section className="cta-section">
          <img
            className="cta-image"
            alt="People sharing books"
            src="../../public/ilustrations/ilustracao6.png"
          />
          <div className="cta-content">
            <h2 className="cta-title">Sua próxima história começa aqui!</h2>
            <p className="cta-subtitle">
              Junte-se a milhares de leitores e <br />
              descubra livros que vão arrancar suspiros!
            </p>
            <button
              variant="outline"
              className="signup-button"
            >
              Criar conta
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};