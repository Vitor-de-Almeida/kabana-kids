import type { ReactNode } from "react"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { WaitlistForm } from "../../components/WaitlistForm"

const numeros = [
  { valor: "3 para 10", rotulo: "professoras por bebês no Berçário" },
  { valor: "até 14", rotulo: "crianças por turma no Infantil, com 2 professoras" },
  { valor: "até 10", rotulo: "crianças por turma no Fundamental, com 2 professoras" },
  { valor: "7h às 19h", rotulo: "de segunda a sexta" },
]

const turmas = [
  {
    nome: "Berçário",
    idade: "4 meses a 1 ano e 11 meses",
    equipe: "10 bebês · 3 professoras",
    cor: "from-ceu-100 to-ceu-200",
    itens: ["Acolhimento e construção de vínculos", "Estimulação sensorial e motora", "Rotina no ritmo de cada bebê"],
  },
  {
    nome: "Educação Infantil",
    idade: "Infantil 1 a 5 · 2 a 5 anos",
    equipe: "Até 14 crianças · 2 professoras",
    cor: "from-lilas-100 to-lilas-200",
    itens: ["Autonomia, linguagem e convivência", "Experiências Montessori e brincadeiras", "Transição para o Fundamental"],
    // Exemplo: aguardando a escola confirmar a turma mais procurada
    destaque: true,
  },
  {
    nome: "Ensino Fundamental",
    idade: "1º ao 5º ano",
    equipe: "Até 10 crianças · 2 professoras",
    cor: "from-ceu-100 to-lilas-200",
    itens: ["Alfabetização, leitura e escrita", "Raciocínio lógico e pensamento crítico", "Acompanhamento próximo"],
  },
]

const rotina = [
  {
    etapa: "Berçário",
    titulo: "Rotina no ritmo do bebê",
    texto: "Alimentação, mamadeiras, trocas, sono e estimulação organizados conforme as necessidades de cada bebê.",
  },
  {
    etapa: "Infantil",
    titulo: "Rotina organizada",
    texto: "Alimentação, higiene, atividades pedagógicas, experiências Montessori, brincadeiras e descanso.",
  },
  {
    etapa: "Fundamental",
    titulo: "Rotina de estudos",
    texto: "Leitura, escrita, matemática, projetos, atividades complementares, intervalos e convivência.",
  },
  {
    etapa: "Integral",
    titulo: "Rotina ampliada",
    texto: "Quem fica mais tempo tem aprendizagem, alimentação, descanso, brincadeiras e atividades complementares.",
  },
]

const diferenciais = [
  {
    titulo: "Turmas pequenas",
    texto: "No máximo 14 crianças por sala no Infantil e 10 no Fundamental, sempre com 2 professoras.",
    icone: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm4 10c0-3.3-3.6-6-8-6s-8 2.7-8 6",
  },
  {
    titulo: "Equipe integrada",
    texto: "Profissionais da área pedagógica, administrativa, de coordenação, alimentação e organização.",
    icone: "M4 7l8-4 8 4-8 4-8-4Zm0 6 8 4 8-4M6 10v5",
  },
  // Exemplo: aguardando a escola confirmar os itens de segurança
  {
    titulo: "Espaço seguro",
    texto: "Acesso controlado, câmeras nas áreas comuns e protocolo de saída.",
    icone: "M12 3 5 6v6c0 4 3 7.4 7 9 4-1.6 7-5 7-9V6l-7-3Z",
  },
  {
    titulo: "Alimentação equilibrada",
    texto: "Rotina de refeições adequada a cada idade, com atenção às restrições alimentares.",
    icone: "M7 3v8a3 3 0 0 0 6 0V3M10 14v7M17 3c1.5 2 1.5 5 0 7v11",
  },
  {
    titulo: "Comunicação com a família",
    texto: "Rotina, comunicados e recados pelo aplicativo Clip Escola, o canal oficial com as professoras.",
    icone: "M4 6h16v10H9l-5 4V6Z",
  },
  {
    titulo: "Adaptação gentil",
    texto: "Respeitamos o tempo, os sentimentos e as necessidades de cada criança nessa nova etapa.",
    icone: "M12 20s-7-4.4-7-9.5A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.5C19 15.6 12 20 12 20Z",
  },
]

const galeria = [
  { src: "/images/kabana-galeria-1.jpg", alt: "Crianças pintando com aquarela em mesa branca" },
  { src: "/images/kabana-galeria-2.jpg", alt: "Crianças correndo e rindo no parque da escola" },
  { src: "/images/kabana-galeria-3.jpg", alt: "Criança empilhando blocos macios em sala clara" },
]

// Exemplo: virão das famílias, com autorização escrita
const depoimentos = [
  {
    texto:
      "A adaptação da Manu foi muito tranquila. Em duas semanas ela já entrava sorrindo e contando o que ia fazer no dia.",
    nome: "Ana Almeida",
    papel: "mãe da Manu, Infantil 1",
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
    papel: "mãe da Alice, Infantil 4",
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
            {/* Exemplo: aguardando a escola confirmar o ano das matrículas */}
            <span className="inline-flex items-center gap-2 rounded-full bg-ceu-100 px-4 py-2 text-sm font-bold text-ceu-700">
              <span className="h-2 w-2 rounded-full bg-ceu-500" />
              Matrículas abertas para 2027
            </span>

            <h1 className="font-display mt-6 text-4xl leading-[1.1] font-bold text-tinta sm:text-5xl lg:text-6xl">
              Um lugar seguro para <span className="text-ceu-500">crescer</span>,{" "}
              <span className="text-lilas-500">brincar</span> e aprender
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-tinta-suave">
              Do Berçário ao 5º ano, tendo a metodologia Montessori como referência. Turmas pequenas, ambiente
              acolhedor e parceria próxima com as famílias.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#matricula"
                className="rounded-full bg-lilas-500 px-8 py-4 font-bold text-white shadow-xl shadow-lilas-200 transition hover:bg-lilas-600"
              >
                Quero fazer a matrícula
              </a>
              <a
                href="#sobre"
                className="rounded-full border border-ceu-200 bg-white px-8 py-4 font-bold text-tinta transition hover:border-ceu-300 hover:bg-ceu-50"
              >
                Conhecer a escola
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Selo>Turmas de até 14 crianças</Selo>
              <Selo>Metodologia Montessori</Selo>
              <Selo>Inglês, Libras e Capoeira</Selo>
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
              Muito mais que uma escola
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-tinta-suave">
              O Centro de Educação Infantil Kabana Kids, em Piraquara (PR), é dedicado à educação, ao cuidado e ao
              desenvolvimento integral das crianças. Oferecemos um ambiente seguro, acolhedor, afetivo e estimulante,
              onde cada criança é respeitada em sua individualidade e tem a oportunidade de aprender, brincar, descobrir
              e crescer.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-tinta-suave">
              Temos como referência a metodologia Montessori, que vê a criança como protagonista da própria
              aprendizagem. Valorizamos a autonomia, a liberdade com responsabilidade e as experiências concretas.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Meio período, períodos intermediários, período integral e contraturno escolar",
                "Inglês, Libras, Capoeira, Yoga, musicalização, artes e psicomotricidade",
                "Parceria com as famílias, com comunicação e transparência",
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
              Do Berçário ao 5º ano, em meio período, períodos intermediários, período integral ou contraturno.
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
                <p className="mt-1 text-sm text-tinta-suave">{turma.equipe}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {turma.itens.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-tinta-suave">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ceu-300" />
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="#matricula"
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
            Cada etapa tem a sua rotina, adaptada à idade e às necessidades das crianças.
          </p>
        </div>

        <ol className="relative mt-14 space-y-8 border-l-2 border-dashed border-ceu-200 pl-8 sm:pl-12">
          {rotina.map((item) => (
            <li key={item.etapa} className="relative">
              <span className="absolute -left-[2.55rem] top-1 grid h-8 w-8 place-items-center rounded-full bg-white ring-2 ring-lilas-200 sm:-left-[3.55rem]">
                <span className="h-2.5 w-2.5 rounded-full bg-lilas-400" />
              </span>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
                <span className="font-display w-28 shrink-0 text-lg font-bold text-ceu-600">{item.etapa}</span>
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

      {/* Matrícula */}
      <section id="matricula" className="relative overflow-hidden py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-lilas-50 via-white to-ceu-50" />
        <div className="mx-auto grid max-w-6xl items-start gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr]">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-widest text-ceu-500">Matrícula</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-tinta sm:text-4xl">
              Garanta a vaga da sua criança
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-tinta-suave">
              As turmas são pequenas e as vagas costumam acabar antes do início do ano. Deixe seus dados e nossa equipe
              entra em contato em até 2 dias úteis para conversar e agendar uma visita.
            </p>

            {/* Exemplo: aguardando a escola confirmar estas condições */}
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
