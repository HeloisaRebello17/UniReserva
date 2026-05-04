# 🎯 Guia Visual: Adicionar PostgreSQL no Railway

## Onde Clicar para Adicionar Banco de Dados

### Cenário 1: Primeira Vez (Projeto Vazio)

```
┌─────────────────────────────────────────────────────┐
│  RAILWAY DASHBOARD                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Seu Projeto: "UniReserva"                         │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  + New                                      │   │
│  │  └─ Clique AQUI! ☝️                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Containers:                                        │
│  ├─ UniReserva (seu app Node.js)                   │
│  │  Status: Deploying...                           │
│  │                                                  │
│  └─ (banco virá aqui após adicionar)               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Passo 1: Clique em "+ New"

```
Você verá um menu dropdown:

┌──────────────────────────┐
│  + New      ▼            │
├──────────────────────────┤
│  Database                │ ← Clique AQUI
│  GitHub Repo             │
│  GitHub Branch           │
│  File                    │
└──────────────────────────┘
```

### Passo 2: Selecione "Database"

```
Após clicar em "Database", você verá opções:

┌──────────────────────────────────┐
│  Create a new database           │
├──────────────────────────────────┤
│  ☑️  PostgreSQL      ← Clique     │
│  ☐  MySQL                        │
│  ☐  MongoDB                      │
│  ☐  Redis                        │
│  ☐  Mariadb                      │
└──────────────────────────────────┘
```

### Passo 3: Selecione "PostgreSQL"

```
Clique no botão "PostgreSQL"

Railway criará o banco automaticamente ✨
```

### Passo 4: Confirme no Dashboard

```
Depois de alguns segundos, você verá:

┌─────────────────────────────────────────────────────┐
│  RAILWAY DASHBOARD                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Containers:                                        │
│  ├─ UniReserva (seu app)                           │
│  │  Status: ✅ Running                              │
│  │                                                  │
│  └─ postgres (seu banco!)                          │
│     Status: ✅ Running                              │
│     Host: xxxxxxxxx.railway.internal                │
│     Port: 5432                                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Screenshot Passo-a-Passo

### 1️⃣ Dashboard Inicial

```
Você vê isso:

Railway App
├─ Your Project "UniReserva"
│  └─ [+ New] ← Clique aqui
│
└─ Deployments
   └─ unireserva-prod (rodando)
```

### 2️⃣ Menu Dropdown

```
Após clicar "+ New":

Dropdown Menu:
├─ Database ← Clique aqui
├─ GitHub Repo
├─ GitHub Branch
└─ File
```

### 3️⃣ Selecionar Database

```
Popup aparece:

[Create a new database]

☑ PostgreSQL ← Clique aqui
☐ MySQL
☐ MongoDB
☐ Redis
☐ MariaDB

(Buttons)
[Cancel] [Create]
```

### 4️⃣ PostgreSQL Sendo Criado

```
Rails mostra:

Creating PostgreSQL database...
⏳ 10%
⏳ 30%
⏳ 60%
✅ 100% - PostgreSQL created!
```

### 5️⃣ PostgreSQL Adicionado

```
Dashboard atualizado:

Your Project
├─ UniReserva (Node.js app)
│  └─ View Details
│
└─ postgres (PostgreSQL)
   └─ View Details
```

---

## Alternativa: Se o App Já Existe

Se você já criou o app e quer adicionar DB depois:

### Método 1: Via Dashboard

```
1. Vá para seu projeto no Railway
2. Clique em "+ New"
3. Selecione "Database"
4. Escolha "PostgreSQL"
5. Confirme
```

### Método 2: Via Repositório Template

```
1. Railway → "New Project"
2. "Start from a Template"
3. Procure por "PostgreSQL + Node"
4. Ou "Databases" → "PostgreSQL"
```

---

## Como Saber que Funcionou?

Depois que o PostgreSQL foi adicionado:

✅ Você verá **dois containers** no dashboard:

- `UniReserva` (seu app)
- `postgres` (seu banco)

✅ Ambos com status **✅ Running**

✅ Ao clicar em "Variables" do app, você verá as variáveis do banco:

```
${{Postgres.PGHOST}}
${{Postgres.PGPORT}}
${{Postgres.PGUSER}}
${{Postgres.PGPASSWORD}}
${{Postgres.PGDATABASE}}
```

✅ Os logs do postgres mostram:

```
[DONE] postgres running on port 5432
```

---

## Troubleshooting

### Problema: "+ New" não aparece

**Solução:**

1. Recarregue a página (F5)
2. Ou clique em seu projeto no painel esquerdo
3. O botão "+ New" deve aparecer

### Problema: PostgreSQL não inicia

**Solução:**

1. Vá para o container "postgres"
2. Clique em "View Logs"
3. Procure por erro específico
4. Tente deletar e criar novamente

### Problema: Variáveis não aparecem automaticamente

**Solução:**

1. Aguarde 1-2 minutos
2. Atualize a página (F5)
3. Vá para "Variables" do seu app
4. Elas devem aparecer agora

---

## Próximo Passo

Depois que PostgreSQL for criado:

✅ Ir para **Step 4** do guia principal
✅ Configurar as **Variáveis** do seu app:

- NODE_ENV=production
- JWT_SECRET=<seu-secret>
- LOG_LEVEL=info

✅ Railway vai **auto-popular**:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME

---

## ⏱️ Timing

- Clicar em "+ New": 5 segundos
- Selecionar PostgreSQL: 5 segundos
- PostgreSQL inicializar: 30-60 segundos
- **Total: ~1-2 minutos** ✅

---

## 🎉 Resultado

Depois disso, você terá:

```
✅ App Node.js rodando em: https://seu-projeto.railway.app
✅ PostgreSQL rodando internamente
✅ Banco conectado automaticamente
✅ Variáveis de env configuradas
```

Pronto para o **Step 4: Configurar Variáveis**! 🚀
