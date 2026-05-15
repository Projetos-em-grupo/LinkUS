import Header from "./Header.jsx";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { text: "Troque mensagens ilimitadas" },
    { text: "Compartilhe citações na redes" },
    { text: "Grupos e comunidades" },
    { text: "Descubra pessoas por interesses" },
  ];

  return (
    <div className="flex flex-col items-center w-full bg-[#f5f9ff]">
      <div className="w-full max-w-360">

        {/* BANNER PRINCIPAL */}
        <section className="flex flex-col-reverse items-center justify-between gap-10 px-6 mt-24 lg:flex-row lg:px-55t-[145px]">
          <img
            className="object-cover w-70 h-70 sm:w-100 sm:h-100 lg:w-lg lg:h-128"
            alt="Person reading a book"
            src="./ilustrations/ilustracao5.png"
          />

          <div className="max-w-165 text-center lg:text-left">
            <h1 className="font-['Lato'] font-bold text-black text-3xl sm:text-4xl lg:text-[40px] leading-tight lg:leading-12">
              Conecte-se através dos livros
            </h1>

            <p className="mt-3 font-['Lato'] font-normal text-black text-lg sm:text-xl lg:text-[25px] leading-relaxed lg:leading-[33.6px]">
              converse, compartilhe e descubra novas histórias
            </p>

            <button
              className="cursor-pointer mt-6 w-53 h-16 rounded-[34px] bg-[#265fda] text-white text-2xl font-['Poppins'] font-light hover:bg-cyan-600 transition-colors"
              onClick={() => {
                navigate("/entrar");
              }}
            >
              Começar
            </button>
          </div>
        </section>

        {/* SEÇÃO DE FEATURES */}
        <section className="relative mt-24">
          <div className="relative w-full bg-[#161b33] min-h-173.25 overflow-hidden">
            {/* ELEMENTOS DECORATIVOS */}
            <img
              className="absolute w-48 h-57.5 object-cover top-0 left-0"
              alt="Rectangle"
              src="./icons/retangulo.svg"
            />

            <img
              className="absolute w-48 h-30 top-20 left-16.5"
              alt="Frame"
              src="./icons/frame.svg"
            />

            {/* LISTA DE FEATURES */}
            <div className="relative z-10 flex flex-col gap-6 px-6 py-28 sm:px-16 lg:absolute lg:top-55.5 lg:left-80">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <img
                    className="w-13.75 h-10 mr-5.5"
                    alt="Feature icon"
                    src="./icons/checkmark.svg"
                  />

                  <div className="font-['Poppins'] font-normal text-white text-lg lg:text-[20px]">
                    {feature.text}
                  </div>
                </div>
              ))}
            </div>

            {/* IMAGEM DIREITA */}
            <img
              className="hidden lg:block absolute -bottom-63.75 -right-12.5 w-100 h-112.5 object-cover"
              alt="People reading"
              src="./img/imagem.svg"
            />
          </div>
        </section>

        {/* BANNER FINAL */}
        <section className="flex flex-col items-center justify-center gap-12 px-6 py-20 bg-[#265fda] lg:flex-row lg:justify-between lg:px-20.75 lg:h-241">
          <img
            className="object-cover w-7080px] sm:w-95 sm:h-95 lg:w-115.25 lg:h-115.25"
            alt="People sharing books"
            src="./ilustrations/ilustracao6.png"
          />

          <div className="max-w-152.25 text-center lg:text-left">
            <h2 className="font-['Lato'] font-bold text-white text-3xl lg:text-[40px] leading-tight lg:leading-12">
              Sua próxima história começa aqui!
            </h2>

            <p className="mt-6 font-['Lato'] font-normal text-white text-lg lg:text-[22px] leading-relaxed lg:leading-[38.4px]">
              Junte-se a milhares de leitores e <br />
              descubra livros que vão arrancar suspiros!
            </p>

            <button
              onClick={() => {
                navigate("/cadastro");
              }}
              className="cursor-pointer mt-14 w-53 h-16 rounded-[34px] bg-[#f5f9ff] text-[#265fda] text-2xl font-['Poppins'] font-light hover:text-blue-600 hover:bg-neutral-300 transition-colors"
            >
              Criar conta
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};