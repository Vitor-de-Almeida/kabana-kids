import type { ReactNode } from "react"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { WaitlistForm } from "../../components/WaitlistForm"

const numeros = [
  { valor: "12", rotulo: "anos cuidando de crianças" },
  { valor: "1:6", rotulo: "adulto por criança" },
  { valor: "até 12", rotulo: "crianças por turma" },
  { valor: "96%", rotulo: "das famílias indicam" },
]

const turmas = [
  {
    nome: "Berçário",
    idade: "4 meses a 1 ano",
    horario: "7h30 às 18h30",
    cor: "from-ceu-100 to-ceu-200",
    itens: ["Rotina de sono e alimentação individual", "Relatório diário para a família", "Estímulo motor e sensorial"],
  },
  {
    nome: "Maternal",
    idade: "2 a 3 anos",
    horario: "7h30 às 18h30",
    cor: "from-lilas-100 to-lilas-200",
    itens: ["Desfralde com apoio da família", "Música, arte e movimento", "Primeiras rotinas em grupo"],
    destaque: true,
  },
  {
    nome: "Pré-escola",
    idade: "4 a 5 anos",
    horario: "7h30 às 18h30",
    cor: "from-ceu-100 to-lilas-200",
    itens: ["Letramento e raciocínio lógico", "Projetos e vida em grupo", "Preparação para o 1º ano"],
  },
]

const rotina = [
  { hora: "7h30", titulo: "Acolhida", texto: "Chegada tranquila, com brincadeira livre e colo quando precisa." },
  { hora: "9h00", titulo: "Roda de conversa", texto: "Calendário, combinados do dia e história do dia." },
  { hora: "10h00", titulo: "Atividade principal", texto: "Projeto da semana: arte, ciências, música ou culinária." },
  { hora: "12h00", titulo: "Almoço", texto: "Menu preparado por nutricionista, servido em família." },
  { hora: "13h00", titulo: "Descanso", texto: "Sala escurecida, música suave e respeito ao ritmo de cada um." },
  { hora: "15h30", titulo: "Parque", texto: "Brincadeira ao ar livre, água, areia e movimento." },
  { hora: "17h00", titulo: "Saída", texto: "Retrospectiva do dia e conversa com a família." },
]

const diferenciais = [
  {
    titulo: "Turmas pequenas",
    texto: "No máximo 12 crianças por sala, para que cada uma seja realmente vista.",
    icone: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm4 10c0-3.3-3.6-6-8-6s-8 2.7-8 6",
  },
  {
    titulo: "Equipe formada",
    texto: "Professoras com licenciatura em Pedagogia e formação continuada.",
    icone: "M4 7l8-4 8 4-8 4-8-4Zm0 6 8 4 8-4M6 10v5",
  },
  {
    titulo: "Espaço seguro",
    texto: "Acesso controlado, câmeras nas áreas comuns e protocolo de saída.",
    icone: "M12 3 5 6v6c0 4 3 7.4 7 9 4-1.6 7-5 7-9V6l-7-3Z",
  },
  {
    titulo: "Alimentação saudável",
    texto: "Cozinha própria e menu semanal aprovado por nutricionista.",
    icone: "M7 3v8a3 3 0 0 0 6 0V3M10 14v7M17 3c1.5 2 1.5 5 0 7v11",
  },
  {
    titulo: "Comunicação diária",
    texto: "Fotos, recados e relatórios no portal das famílias, todo dia.",
    icone: "M4 6h16v10H9l-5 4V6Z",
  },
  {
    titulo: "Adaptação gentil",
    texto: "Entrada gradual, no tempo da criança, com a família por perto.",
    icone: "M12 20s-7-4.4-7-9.5A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.5C19 15.6 12 20 12 20Z",
  },
]

const galeria = [
  { src: "/images/kabana-galeria-1.jpg", alt: "Crianças pintando com aquarela em mesa branca" },
  { src: "/images/kabana-galeria-2.jpg", alt: "Crianças correndo e rindo no parque da escola" },
  { src: "/images/kabana-galeria-3.jpg", alt: "Criança empilhando blocos macios em sala clara" },
]

const depoimentos = [
  {
    texto:
      "A adaptação da Manu foi muito tranquila. Em duas semanas ela já entrava sorrindo e contando o que ia fazer no dia.",
    nome: "Ana Almeida",
    papel: "mãe da Manu, Maternal",
  },
  {
    texto:
      "O que mais me acalma é a comunicação. Recebo foto, relato do almoço e do sono. Nunca fico no escuro sobre o dia dele.",
    nome: "Rafael Souza",
    papel: "pai do Theo, Berçário",
  },
  {
    texto:
      "Turma pequena faz toda diferença. As professoras conhecem cada criança pelo nome, pelo jeito e pelo que ela gosta.",
    nome: "Carla Menezes",
    papel: "mãe da Alice, Pré-escola",
  },
]

function Selo({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-lilas-200 bg-lilas-50 px-4 py-2 text-sm font-semibold text-lilas-600">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  )
}

export function LandingPage() {
  return (
    <div className="bg-white">
      <Header />

      {/* Hero */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animar-flutuar absolute -left-24 top-10 h-72 w-72 rounded-full bg-ceu-100 blur-3xl" />
          <div className="animar-flutuar absolute -right-16 top-40 h-80 w-80 rounded-full bg-lilas-100 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-ceu-100 px-4 py-2 text-sm font-bold text-ceu-700">
              <span className="h-2 w-2 rounded-full bg-ceu-500" />
              Matrículas abertas para 2027
            </span>

            <h1 className="font-display mt-6 text-4xl leading-[1.1] font-bold text-tinta sm:text-5xl lg:text-6xl">
              Um lugar seguro para <span className="text-ceu-500">crescer</span>,{" "}
              <span className="text-lilas-500">brincar</span> e aprender
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-tinta-suave">
              Educação infantil acolhedora, do berçário à pré-escola. Turmas pequenas, equipe formada em Pedagogia e
              comunicação diária com as famílias.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#lista-de-espera"
                className="rounded-full bg-lilas-500 px-8 py-4 font-bold text-white shadow-xl shadow-lilas-200 transition hover:bg-lilas-600"
              >
                Entrar na lista de espera
              </a>
              <a
                href="#sobre"
                className="rounded-full border border-ceu-200 bg-white px-8 py-4 font-bold text-tinta transition hover:border-ceu-300 hover:bg-ceu-50"
              >
                Conhecer a escola
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Selo>Turmas de até 12 crianças</Selo>
              <Selo>Acesso controlado</Selo>
              <Selo>Cozinha própria</Selo>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-br from-ceu-100 via-white to-lilas-100" />
            <img
              src="/images/kabana-hero.jpg"
              alt="Crianças brincando com blocos de madeira em sala clara da Kabana Kids"
              className="aspect-[4/3] w-full rounded-[2.5rem] object-cover shadow-2xl shadow-ceu-200/70"
            />
            <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl bg-white/95 px-5 py-4 shadow-xl shadow-ceu-200/60 backdrop-blur sm:left-8">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-ceu-100 text-ceu-600">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l3 2" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className="font-display text-sm font-bold text-tinta">Rotina previsível</p>
                <p className="text-xs text-tinta-suave">Do acolhimento à saída, todo dia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="bg-gradient-to-r from-ceu-50 via-white to-lilas-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {numeros.map((item) => (
            <div key={item.rotulo} className="text-center">
              <p className="font-display text-4xl font-bold text-lilas-500">{item.valor}</p>
              <p className="mt-2 text-sm text-tinta-suave">{item.rotulo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -left-5 -top-5 -z-10 h-40 w-40 rounded-3xl bg-lilas-100" />
            <img
              src="/images/kabana-sobre.jpg"
              alt="Professora lendo um livro para um grupo de crianças sentadas em roda"
              className="aspect-[4/3] w-full rounded-[2.5rem] object-cover shadow-xl shadow-lilas-100"
            />
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-bold uppercase tracking-widest text-ceu-500">Sobre a Kabana</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-tinta sm:text-4xl">
              Cuidado de casa, com olhar de escola
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-tinta-suave">
              A Kabana Kids nasceu do desejo de criar uma escola onde cada criança fosse conhecida pelo nome, pelo jeito
              e pelo próprio ritmo. Aqui o brincar é sério: é assim que a criança aprende sobre o mundo, sobre os outros
              e sobre si mesma.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Projeto pedagógico que une o brincar livre a atividades intencionais",
                "Portas abertas: as famílias podem visitar e acompanhar o dia",
                "Escuta ativa: reuniões individuais a cada trimestre",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-tinta-suave">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ceu-100 text-ceu-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Turmas */}
      <section id="turmas" className="bg-ceu-50/70 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-lilas-500">Turmas</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-tinta sm:text-4xl">
              Um grupo para cada fase da infância
            </h2>
            <p className="mt-5 text-lg text-tinta-suave">
              Todas as turmas funcionam em período integral, com opção de meio período pela manhã ou pela tarde.
            </p>
          </div>

          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {turmas.map((turma) => (
              <article
                key={turma.nome}
                className={`relative flex flex-col rounded-3xl border bg-white p-8 transition hover:-translate-y-1 ${
                  turma.destaque
                    ? "border-lilas-200 shadow-2xl shadow-lilas-100"
                    : "border-ceu-100 shadow-lg shadow-ceu-100/60"
                }`}
              >
                {turma.destaque && (
                  <span className="absolute -top-3 left-8 rounded-full bg-lilas-500 px-4 py-1 text-xs font-bold text-white">
                    Mais procurada
                  </span>
                )}
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${turma.cor}`} />
                <h3 className="font-display mt-6 text-2xl font-bold text-tinta">{turma.nome}</h3>
                <p className="mt-1 font-semibold text-lilas-500">{turma.idade}</p>
                <p className="mt-1 text-sm text-tinta-suave">Integral · {turma.horario}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {turma.itens.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-tinta-suave">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ceu-300" />
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="#lista-de-espera"
                  className="mt-8 rounded-full border border-lilas-200 py-3 text-center text-sm font-bold text-lilas-600 transition hover:bg-lilas-50"
                >
                  Quero saber das vagas
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Rotina */}
      <section id="rotina" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-ceu-500">Rotina</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-tinta sm:text-4xl">Um dia na Kabana Kids</h2>
          <p className="mt-5 text-lg text-tinta-suave">
            A previsibilidade da rotina dá segurança para a criança se soltar e explorar.
          </p>
        </div>

        <ol className="relative mt-14 space-y-8 border-l-2 border-dashed border-ceu-200 pl-8 sm:pl-12">
          {rotina.map((item) => (
            <li key={item.hora} className="relative">
              <span className="absolute -left-[2.55rem] top-1 grid h-8 w-8 place-items-center rounded-full bg-white ring-2 ring-lilas-200 sm:-left-[3.55rem]">
                <span className="h-2.5 w-2.5 rounded-full bg-lilas-400" />
              </span>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
                <span className="font-display w-16 shrink-0 text-lg font-bold text-ceu-600">{item.hora}</span>
                <div>
                  <h3 className="font-display text-xl font-bold text-tinta">{item.titulo}</h3>
                  <p className="mt-1 text-tinta-suave">{item.texto}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Diferenciais */}
      <section className="bg-gradient-to-b from-white to-lilas-50 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-lilas-500">Nosso jeito</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-tinta sm:text-4xl">
              O que as famílias encontram aqui
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {diferenciais.map((item) => (
              <article
                key={item.titulo}
                className="rounded-3xl border border-white bg-white/80 p-7 shadow-lg shadow-ceu-100/50 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ceu-100 text-ceu-600">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d={item.icone} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="font-display mt-5 text-xl font-bold text-tinta">{item.titulo}</h3>
                <p className="mt-2 leading-relaxed text-tinta-suave">{item.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-ceu-500">Galeria</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-tinta sm:text-4xl">Nossos espaços e nossos dias</h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galeria.map((foto) => (
            <figure key={foto.src} className="group overflow-hidden rounded-3xl bg-ceu-50">
              <img
                src={foto.src}
                alt={foto.alt}
                className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </figure>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="bg-ceu-50/70 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-lilas-500">Famílias</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-tinta sm:text-4xl">Quem já é da Kabana conta</h2>
          </div>

          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {depoimentos.map((depoimento) => (
              <blockquote
                key={depoimento.nome}
                className="flex flex-col rounded-3xl border border-ceu-100 bg-white p-8 shadow-lg shadow-ceu-100/60"
              >
                <svg viewBox="0 0 24 24" className="h-9 w-9 text-lilas-200" fill="currentColor">
                  <path d="M9 7c-3 1.4-4.5 3.9-4.5 7.4V17h5v-5H7c0-1.6.7-2.8 2-3.6L9 7Zm10 0c-3 1.4-4.5 3.9-4.5 7.4V17h5v-5H17c0-1.6.7-2.8 2-3.6L19 7Z" />
                </svg>
                <p className="mt-5 flex-1 leading-relaxed text-tinta-suave">{depoimento.texto}</p>
                <footer className="mt-7 flex items-center gap-3 border-t border-ceu-100 pt-5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-ceu-200 to-lilas-200 font-display font-bold text-white">
                    {depoimento.nome.charAt(0)}
                  </span>
                  <div>
                    <p className="font-display font-bold text-tinta">{depoimento.nome}</p>
                    <p className="text-sm text-tinta-suave">{depoimento.papel}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Lista de espera */}
      <section id="lista-de-espera" className="relative overflow-hidden py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-lilas-50 via-white to-ceu-50" />
        <div className="mx-auto grid max-w-6xl items-start gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr]">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-widest text-ceu-500">Lista de espera</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-tinta sm:text-4xl">
              Garanta a vaga da sua criança
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-tinta-suave">
              As turmas são pequenas e as vagas costumam acabar antes do início do ano. Deixe seus dados e nossa equipe
              entra em contato para conversar e agendar uma visita.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Sem taxa e sem compromisso de matrícula",
                "Prioridade por ordem de cadastro",
                "Visita guiada com a coordenação pedagógica",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-tinta-suave">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lilas-100 text-lilas-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <WaitlistForm />
        </div>
      </section>

      <Footer />
    </div>
  )
}
