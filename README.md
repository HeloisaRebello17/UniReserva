<p align="center">
  <img src="assets/images/Logo_UniReserva.png" alt="Logo UniReserva" width="200" />
</p>

<h2 align="center"> UniReserva </h2>

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
  <h4>Usuário</h4>
  <ul>
    <li><p>id</p></li>
    <li><p>nome</p></li>
    <li><p>email</p></li>
    <li><p>senha</p></li>
    <li><p>tipo (admin / comum)</p></li>
  </ul>
    <h4>Sala</h4>
  <ul>
    <li><p>id</p></li>
    <li><p>nome</p></li>
    <li><p>capacidade</p></li>
    <li><p>tipo (laboratório / sala comum)</p></li>
  </ul>
      <h4>Reserva</h4>
  <ul>
    <li><p>id</p></li>
    <li><p>data</p></li>
    <li><p>horário início</p></li>
    <li><p>horário fim</p></li>
    <li><p>id_usuario</p></li>
    <li><p>id_sala</p></li>
    <li><p>status</p></li>
  </ul>
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
