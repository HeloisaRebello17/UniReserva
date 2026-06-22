<p align="center">
  <img src="assets/images/Logo_UniReserva.png" alt="Logo UniReserva" width="200" />
</p>

<h2 align="center"> UniReserva </h2>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen">
  <img alt="Node" src="https://img.shields.io/badge/Node.js-v20-green">
  <img alt="Tests" src="https://img.shields.io/badge/Tests-23%20Passing-brightgreen">
  <img alt="Coverage" src="https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Ready-blue">
</p>

<div class="descricao_projeto">
  <h2> Descrição do Projeto </h2>
  <p>Sistema Web para gerenciamento de reservas de salas em instituições educacionais. Projeto acadêmico desenvolvido para a disciplina de Programação Web do curso de Engenharia de Software da instituição Centro Universitário Católica de Santa Catarina.</p>
</div>

<div class="dominio_problema">
  <h2>Domínio do Problema</h2>
  <p>Instituições de ensino frequentemente enfrentam dificuldades no controle de reservas de salas de aula e laboratórios. Muitas vezes o processo é manual, sujeito a conflitos de horário e falta de organização. </p>
  <p align="justify-center">O sistema proposto tem como objetivo permitir que usuários autenticados realizem reservas de salas, consultem disponibilidade e gerenciem suas solicitações de forma organizada e segura.</p>
</div>

<div class="publico_alvo">
  <h2> Público-Alvo</h2>
  <ul>
    <li><p>Professores</p></li>
    <li><p>Coordenadores</p></li>
    <li><p>Estudantes (caso permitido)</p></li>
  </ul>
</div>

<div class="requisitos">
  <h2> Funcionalidades</h2>
  <ul>
    <li><h3>Requisitos Funcionais</h3></li>
    <ul>
      <li><p>RF01 – O sistema deve permitir cadastro de usuário</p></li>
      <li><p>RF02 – O sistema deve permitir login com autenticação por token</p></li>
      <li><p>RF03 - O sistema deve permitir cadastro de salas</p></li>
      <li><p>RF04 - O sistema deve permitir consultar disponibilidade de salas</p></li>
      <li><p>RF05 - O sistema deve permitir realizar reserva de sala</p></li>
      <li><p>RF06 - O sistema deve impedir reservas em horários já ocupados</p></li>
      <li><p>RF07 - O sistema deve permitir cancelar reserva</p></li>
    </ul>
    <li><h3>Requisitos Não Funcionais</h3></li>
    <ul>
      <li><p>RNF01 - O sistema deve seguir arquitetura MVC</p></li>
      <li><p>RNF02 - O sistema deve disponibilizar API REST</p></li>
      <li><p>RNF03 – O sistema deve utilizar banco de dados relacional</p></li>
      <li><p>RNF04 – O sistema deve ser implantado online</p></li>
      <li><p>RNF05 – O sistema deve utilizar controle de acesso com autenticação</p></li>
    </ul>
  </ul>
</div>

<div class="transacao_problema">
  <h2>Transação do Problema</h2>
  <ul>
      <li><p>O sistema verifica se a sala está disponível</p></li>
      <li><p>Caso esteja:</p>
      <ul>
        <li><p>Registra a reserva</p></li>
        <li><p>Marca o horário como ocupado</p></li>
      </li>
      </ul>
        <li><p>Caso não esteja:</p>
      <ul>
        <li><p>Retorna um erro</p></li>
      </ul>
        </li>
  </ul>
  </div>

<div class="modelo_entidade_banco">
  <h2> Modelo Entidade Banco</h2>
  <h3>Diagrama do Banco de Dados</h3>
  <p>Imagem do modelo relacional baseada em <code>db/schema.sql</code>:</p>
  <p align="center">
    <img src="assets/images/database-er.svg" alt="Diagrama ER do banco de dados UniReserva" width="980" />
  </p>
</div>

<div class="tecnologias_utilizadas">
  <h2>Tecnologias Utilizadas</h2>
  <h3>Back-end: Node.js + Express</h3>
  <p>O back-end será desenvolvido utilizando Node.js, com o framework Express.</p>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Ambiente leve e eficiente para construção de APIs REST.</p></li>
    <li><p>Grande adoção no mercado.</p></li>
    <li><p>Facilidade na implementação de rotas, middlewares e autenticação com JWT.</p></li>
    <li><p>Permite organização em padrão MVC.</p></li>
  </ul>
  <br>
  <h3>Banco de Dados: PostgreSQL</h3>
  <p>Será utilizado PostgreSQL como sistema gerenciador de banco de dados relacional.</p>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Banco relacional robusto e open source.</p></li>
    <li><p>Suporte a transações (ACID).</p></li>
    <li><p>Ideal para controle de integridade em reservas (evitar conflitos de horário).</p></li>
    <li><p>Amplamente utilizado em aplicações web.</p></li>
  </ul>
  <br>
  <h3>Front-end: HTML + CSS + JavaScript</h3>
  <p>O front-end será desenvolvido utilizando tecnologias web padrão.</p>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Simplicidade na implementação.</p></li>
    <li><p>Controle total da estrutura e integração com API REST.</p></li>
    <li><p>Evita complexidade de frameworks adicionais.</p></li>
    <li><p>Ideal para foco nos conceitos da disciplina.</p></li>
  </ul>
  <br>
  <h3>Arquitetura</h3>
  <ul>
    <li><p>Arquitetura Cliente-Servidor</p></li>
    <li><p>API REST</p></li>
    <li><p>Padrão MVC no back-end</p></li>
    <li><p>Aplicação monolítica</p></li>
  </ul>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Separação clara entre responsabilidades.</p></li>
    <li><p>Organização do código.</p></li>
    <li><p>Facilita manutenção e escalabilidade futura.</p></li>
  </ul>
  <br>
  <h3>Autenticação</h3>
  <ul>
    <li><p>JWT (JSON Web Token)</p></li>
  </ul>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Controle de acesso baseado em token.</p></li>
    <li><p>Segurança para rotas protegidas.</p></li>
    <li><p>Muito utilizado em APIs modernas.</p></li>
  </ul>
  <br>
  <h3>DevOps e CI/CD</h3>
  <ul>
    <li><p>GitHub Actions (workflow automático)</p></li>
    <li><p>Docker e Docker Compose</p></li>
    <li><p>ESLint (code quality)</p></li>
    <li><p>Testes automatizados com Node.js test runner</p></li>
  </ul>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Automação de testes e validações em cada push.</p></li>
    <li><p>Deploy facilitado com containers Docker.</p></li>
    <li><p>Manutenção de qualidade de código constante.</p></li>
    <li><p>Preparado para ambientes de produção.</p></li>
  </ul>
  <br>
  <h3>Observabilidade</h3>
  <ul>
    <li><p>Logger estruturado em JSON</p></li>
    <li><p>Request logging automático via middleware</p></li>
    <li><p>Suporte para integração com Sentry, Winston, Prometheus e DataDog</p></li>
  </ul>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Rastreamento de erros e performance.</p></li>
    <li><p>Facilita troubleshooting em produção.</p></li>
    <li><p>Preparado para escalabilidade.</p></li>
  </ul>
</div>

<div class="arquitetura_c4">
  <h2>Arquitetura C4</h2>
  <p><a href="c4-context.puml">Fonte - Nível 1 (Contexto)</a></p>
  <p><a href="c4-container.puml">Fonte - Nível 2 (Contêiner)</a></p>
  <p><a href="c4-components.puml">Fonte - Nível 3 (Componentes)</a></p>

  <p align="center">
    <img src="assets/images/c4-context.png" alt="Diagrama C4 de contexto do UniReserva" width="900" />
  </p>

  <h3>Nível 1 – Diagrama de Contexto</h3>
  <p>Visão geral do sistema e seus atores externos:</p>
  <ul>
    <li><p><b>Usuário (Professor / Coordenador / Estudante)</b> → interage com o sistema via navegador web para realizar reservas de salas.</p></li>
    <li><p><b>UniReserva (Sistema Web)</b> → processa as solicitações, autentica usuários e gerencia as reservas.</p></li>
    <li><p><b>Banco de Dados (PostgreSQL)</b> → armazena os dados de usuários, salas e reservas.</p></li>
  </ul>

  <h3>Nível 2 – Diagrama de Contêiner</h3>
  <p align="center">
    <img src="assets/images/c4-container.png" alt="Diagrama C4 de contêiner do UniReserva" width="900" />
  </p>
  <p>Componentes principais do sistema:</p>
  <ul>
    <li><p><b>Front-end (HTML + CSS + JavaScript)</b> → interface web executada no navegador do usuário. Consome a API REST.</p></li>
    <li><p><b>Back-end / API REST (Node.js + Express)</b> → responsável pelas regras de negócio, autenticação JWT e comunicação com o banco de dados. Organizado no padrão MVC.</p></li>
    <li><p><b>Banco de Dados (PostgreSQL)</b> → armazena e persiste os dados do sistema.</p></li>
  </ul>

  <h3>Nível 3 – Diagrama de Componentes (Back-end)</h3>
  <p align="center">
    <img src="assets/images/c4-components.png" alt="Diagrama C4 de componentes do UniReserva" width="900" />
  </p>
  <p>Componentes internos da API:</p>
  <ul>
    <li><p><b>Router (Rotas Express)</b> → define os endpoints da API REST e direciona as requisições.</p></li>
    <li><p><b>Controller</b> → recebe as requisições HTTP, chama os serviços e retorna as respostas.</p></li>
    <li><p><b>Service / Model</b> → contém as regras de negócio e realiza as operações no banco de dados.</p></li>
    <li><p><b>Middleware de Autenticação (JWT)</b> → valida o token nas rotas protegidas antes de permitir o acesso.</p></li>
  </ul>

</div>

<div class="entrega_atual">
  <h2>Entrega Atual – Pronto para Produção</h2>
  <p>Nesta etapa final, a implementação evoluiu para um padrão <b>production-ready</b>, incluindo CI/CD automático, testes abrangentes, deployment documentado e observabilidade integrada.</p>

  <h3>Artefatos Disponíveis no Repositório</h3>
  <ul>
    <li><p><b>Front-end:</b> interface web em <code>public/index.html</code>, <code>public/styles.css</code> e <code>public/app.js</code>.</p></li>
    <li><p><b>Back-end:</b> API REST em Node.js + Express, organizada em padrão MVC na pasta <code>src</code>.</p></li>
    <li><p><b>Banco de dados:</b> schema em <code>db/schema.sql</code>, seed em <code>db/seed.sql</code>, script de inicialização em <code>scripts/initDb.js</code>.</p></li>
    <li><p><b>Testes automatizados:</b> testes de integração em <code>test/api.test.js</code> e testes unitários em <code>test/services.test.js</code> (18+ testes).</p></li>
    <li><p><b>CI/CD Pipeline:</b> workflow automático em <code>.github/workflows/ci.yml</code> com testes, linting, auditoria de segurança e build Docker.</p></li>
    <li><p><b>Configuração de Produção:</b> <code>Dockerfile</code> otimizado, <code>docker-compose.prod.yml</code> para deployment em containers.</p></li>
    <li><p><b>Observabilidade:</b> logger estruturado em <code>src/utils/logger.js</code>, middleware de logging HTTP em <code>src/middleware/logging.js</code>, script de validação <code>check-monitoring.sh</code> e documentação em <code>MONITORING_VALIDATION.md</code>.</p></li>
    <li><p><b>Documentação:</b> <code>FREE_DEPLOYMENT.md</code> (opções gratuitas), <code>FREE_RAILWAY_QUICK_START.md</code> (deploy rápido), <code>RAILWAY_ADD_DATABASE_VISUAL_GUIDE.md</code> (guia visual).</p></li>
    <li><p><b>Arquitetura C4:</b> diagramas em <code>c4-context.puml</code>, <code>c4-container.puml</code> e <code>c4-components.puml</code>.</p></li>
  </ul>

  <h3>Escopo Implementado Nesta Entrega</h3>
  <ul>
    <li><p><b>Autenticação:</b> geração e validação de token JWT com proteção de rotas.</p></li>
    <li><p><b>API REST:</b> consulta de salas, criação e cancelamento de reservas com validação de conflitos.</p></li>
    <li><p><b>Interface Web:</b> páginas de login, listagem de salas e gerenciamento de reservas.</p></li>
    <li><p><b>CI/CD Pipeline (✨ NOVO):</b> workflow automático no GitHub Actions com testes, linting (ESLint), security audit e Docker build validation.</p></li>
    <li><p><b>TDD - Testes Unitários (✨ NOVO):</b> 18+ testes que cobrem services de autenticação, salas e reservas com validações e casos de erro.</p></li>
    <li><p><b>Deployment em Produção (✨ NOVO):</b> Dockerfile otimizado, docker-compose.prod.yml.</p></li>
    <li><p><b>Observabilidade e Monitoramento (✨ NOVO):</b> logger estruturado JSON, middleware de HTTP request logging.</p></li>
  </ul>

  <h3>Ajustes de Requisitos Identificados</h3>
  <ul>
    <li><p><b>AR01:</b> o requisito RNF03 foi atendido nesta iteração com integração real ao PostgreSQL, incluindo schema, seed e script de inicialização.</p></li>
    <li><p><b>AR02:</b> o requisito RF02 foi detalhado como autenticação via JWT com proteção das rotas privadas da API.</p></li>
    <li><p><b>AR03:</b> o requisito RF06 foi detalhado com a regra de conflito por sala, data e sobreposição de horários.</p></li>
    <li><p><b>AR04:</b> para facilitar a avaliação local, foi incluída uma estratégia de demo com <code>docker-compose</code> e variáveis em <code>.env.example</code>.</p></li>
  </ul>

  <h3>Estrutura Inicial do Projeto</h3>
  <ul>
    <li><p><code>src/controllers</code> → recebe as requisições HTTP e retorna respostas.</p></li>
    <li><p><code>src/services</code> → concentra regras de negócio.</p></li>
    <li><p><code>src/repositories</code> → executa consultas SQL no PostgreSQL.</p></li>
    <li><p><code>src/routes</code> → define endpoints da API REST.</p></li>
    <li><p><code>src/middleware</code> → valida autenticação e permissões.</p></li>
    <li><p><code>src/config</code> → centraliza conexão com banco e bootstrap da base.</p></li>
    <li><p><code>db</code> → guarda os scripts SQL de schema e seed.</p></li>
    <li><p><code>scripts</code> → contém scripts auxiliares, como inicialização do banco.</p></li>
    <li><p><code>public</code> → contém a interface web inicial.</p></li>
  </ul>

  <h3>Como Executar</h3>
  <ol>
    <li><p>Copiar <code>.env.example</code> para um arquivo <code>.env</code> e ajustar as variáveis se necessário.</p></li>
    <li><p>Instalar dependências com <code>npm install</code>.</p></li>
    <li><p>Subir o PostgreSQL com <code>npm run db:up</code> (requer Docker instalado).</p></li>
    <li><p>Inicializar schema e seed com <code>npm run db:init</code>.</p></li>
    <li><p>Iniciar a aplicação com <code>npm start</code>.</p></li>
    <li><p>Acessar <code>http://localhost:3000</code> no navegador.</p></li>
  </ol>

  <h3>Scripts Disponíveis</h3>
  <ul>
    <li><p><code>npm start</code> → inicia o servidor Node.js</p></li>
    <li><p><code>npm test</code> → executa testes de integração e unitários</p></li>
    <li><p><code>npm run test:coverage</code> → executa testes com cobertura</p></li>
    <li><p><code>npm run lint</code> → verifica qualidade do código com ESLint</p></li>
    <li><p><code>npm run lint:fix</code> → corrige problemas de linting automaticamente</p></li>
    <li><p><code>npm run db:init</code> → inicializa banco de dados</p></li>
    <li><p><code>npm run db:up</code> → inicia PostgreSQL com Docker Compose</p></li>
    <li><p><code>npm run db:down</code> → para PostgreSQL</p></li>
  </ul>

  <h3>CI/CD e Deployment</h3>
  <ul>
    <li><p><b>Workflow Automático:</b> Todo push para <code>main</code> ou PR dispara pipeline em <code>.github/workflows/ci.yml</code> que executa testes, linting, security audit e valida build Docker.</p></li>
    <li><p><b>Deploy para Produção:</b> Ver documentação em <code>docs/DEPLOYMENT.md</code> para opções de Railway, Render, Docker VPS ou AWS.</p></li>
    <li><p><b>Quick Start Deploy:</b> Ver <code>QUICK_START_DEPLOY.md</code> para deploy em Railway em 5 minutos.</p></li>
    <li><p><b>Status da Pipeline:</b> <a href="https://github.com/seu-usuario/UniReserva/actions">GitHub Actions</a></p></li>
  </ul>

  <h3>Validação da Entrega</h3>
  <ul>
    <li><p><b>Testes Automatizados:</b> 23 testes passando com <code>npm test</code> (testes de integração + unitários).</p></li>
    <li><p><b>Code Quality:</b> ESLint validado com <code>npm run lint</code> (zero warnings).</p></li>
    <li><p><b>Security:</b> <code>npm audit</code> rodando automaticamente na pipeline.</p></li>
    <li><p><b>CI/CD Pipeline:</b> workflow no GitHub Actions (<code>.github/workflows/ci.yml</code>) executa automaticamente em push/PR para main/develop.</p></li>
    <li><p><b>Docker Build:</b> Dockerfile validado como parte da pipeline.</p></li>
    <li><p><b>Coverage:</b> cobertura de testes coletada com <code>npm run test:coverage</code>.</p></li>
    <li><p><b>Aplicação Local:</b> <code>npm start</code> inicia servidor em http://localhost:3000.</p></li>
  </ul>

  <h3>Monitoramento e Observabilidade</h3>
  <p>O sistema possui <b>monitoramento estruturado em produção</b> com logging automático de todas as requisições HTTP.</p>
  <ul>
    <li><p><b>Logging Estruturado:</b> Todos os eventos registrados em JSON (arquivo <code>src/logs/app.log</code>).</p></li>
    <li><p><b>HTTP Request Logging:</b> Middleware automático captura método, path, status, duration, IP e userId.</p></li>
    <li><p><b>Análise de Logs:</b> Execute <code>bash check-monitoring.sh</code> para visualizar dashboard com estatísticas em tempo real.</p></li>
  </ul>

  <h3>Usuários de Demonstração</h3>
  <ul>
    <li><p><b>Administrador:</b> <code>admin@unireserva.com</code> / <code>admin123</code></p></li>
    <li><p><b>Professor:</b> <code>professor@unireserva.com</code> / <code>prof123</code></p></li>
  </ul>
</div>
<div style="display: inline_block"><br>
  <img align="center" alt="FIGMA" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" />
  <img align="center" alt="GITHUB" height="40" width="40"src="https://cdn.iconscout.com/icon/free/png-256/github-2690381-2232884.png" />
  <img  align="center" alt="VSCODE" height="35" width="30" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" />
  <img align="center" alt="NOTION" height="40" width="40" src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"/>
  <img align="center" alt="JAVASCRIPT" height="40" width="40" src="https://img.icons8.com/?size=100&id=108784&format=png&color=000000.png"/>
  <img align="center" alt="HTML" height="40" width="40" src="https://img.icons8.com/?size=100&id=v8RpPQUwv0N8&format=png&color=000000.png"/>
  <img align="center" alt="POSTGRESQL" height="40" width="40" src="https://img.icons8.com/?size=100&id=JRnxU7ZWP4mi&format=png&color=000000.png"/>
  <img align="center" alt="POSTGRESQL" height="40" width="40" src="https://img.icons8.com/?size=100&id=21278&format=png&color=000000.png"/>
  </div>
