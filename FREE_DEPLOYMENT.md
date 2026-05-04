# 💰 Deploy Gratuito - UniReserva

## 🆓 Opções 100% Gratuitas

### Option 1: Railway (Recomendado ⭐⭐⭐⭐⭐)

**Plano Gratuito:**

- ✅ $5/mês em créditos (suficiente)
- ✅ PostgreSQL incluído
- ✅ Node.js app
- ✅ SSL/HTTPS automático
- ✅ Domínio `.railway.app`

**Passo 1: Criar Conta**

```bash
# Acesse
https://railway.app

# Clique "Sign in with GitHub"
# Autorize Railway
```

**Passo 2: New Project**

```
1. Dashboard → "New Project"
2. "Deploy from GitHub repo"
3. Selecione UniReserva-main
4. Railway detecta Dockerfile ✨
```

**Passo 3: Add PostgreSQL**

```
Dashboard → "+ New" → "Database" → "PostgreSQL"
Railway configura automaticamente ✅
```

**Passo 4: Configure Variables**

```
Vá para "Variables" e adicione:

NODE_ENV=production
JWT_SECRET=<veja comando abaixo>
LOG_LEVEL=info

Database:
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
```

**Gerar JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Passo 5: Deploy**

```
Clique "Deploy" e aguarde 3-5 minutos
URL: https://seu-projeto.railway.app ✅
```

**Custo Real:**

- ✅ $0 (usando créditos gratuitos de $5/mês)
- Suficiente para: ~100 GB data transfer + container pequeno

**⏱️ Tempo total: 10 minutos**

---

### Option 2: Render (Alternativa Gratuita ⭐⭐⭐⭐)

**Plano Gratuito:**

- ✅ 1 web service gratuito (hibernates depois de 15min sem uso)
- ✅ PostgreSQL incluído
- ✅ SSL automático
- ✅ GitHub integration

**Passo 1: Criar Conta**

```bash
https://render.com
# Sign up with GitHub
```

**Passo 2: New Web Service**

```
1. "+ New" → "Web Service"
2. Conecte GitHub repo
3. Selecione UniReserva-main
```

**Passo 3: Configure**

```
Build Command: npm ci
Start Command: npm start
Environment: Node.js
Region: Ohio (gratuito)
```

**Passo 4: Add PostgreSQL**

```
1. "+ New" → "PostgreSQL"
2. Nome: unireserva-db
3. Render cria automaticamente
```

**Passo 5: Environment Variables**

```
NODE_ENV=production
JWT_SECRET=<seu-secret>
DATABASE_URL=<fornecido-pelo-render>
LOG_LEVEL=info
```

**Custo Real:**

- ✅ $0 (plano gratuito puro)
- ⚠️ App hiberna depois de 15 min sem uso (wake-up rápido)
- ✅ Perfeito para MVP/projeto estudantil

**⏱️ Tempo total: 15 minutos**

---

### Option 3: Fly.io (Gratuito + Escalável ⭐⭐⭐⭐)

**Plano Gratuito:**

- ✅ 3 apps compartilhados
- ✅ PostgreSQL incluído
- ✅ Mais rápido que Render
- ✅ Sem hibernation

**Passo 1: Instalar CLI**

```bash
curl -L https://fly.io/install.sh | sh

# Ou com npm
npm install -g @fly/cli
```

**Passo 2: Login**

```bash
fly auth login
# Autorize com GitHub
```

**Passo 3: Deploy**

```bash
cd /home/heloisa-cabral/Downloads/UniReserva-main

# Criar arquivo fly.toml
fly launch --image registry.fly.io/unireserva:latest

# Responda as perguntas:
# App name: unireserva-seu-nome
# Region: Choose one with free tier (lax, sjc)
# Set up Postgres? Yes
# Deploy now? Yes
```

**Passo 4: Configure Variables**

```bash
fly secrets set NODE_ENV=production
fly secrets set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
fly secrets set LOG_LEVEL=info

# Ver secrets
fly secrets list
```

**Passo 5: Deploy**

```bash
fly deploy
# Aguarde 2-3 minutos
# URL: https://seu-app.fly.dev ✅
```

**Custo Real:**

- ✅ $0 (plano gratuito ilimitado)
- Sem hibernation
- ✅ Melhor performance

**⏱️ Tempo total: 10 minutos**

---

### Option 4: Railway + Vercel (Frontend/Backend Split)

Se quiser ainda mais barato:

**Vercel (Frontend) - FREE**

```bash
# Deployar front-end estático
npm run build  # Se tiver
git push origin main
# Vercel detecta automaticamente
# URL: https://seu-projeto.vercel.app
```

**Railway (Backend) - FREE com $5/mês créditos**

```
# Backend em Railway
# API em: https://seu-backend.railway.app
```

---

## 📊 Comparação das Opções Gratuitas

| Plataforma  | Custo            | Hibernation | Performance | Setup | Recomendação |
| ----------- | ---------------- | ----------- | ----------- | ----- | ------------ |
| **Railway** | $5/mês créditos  | ❌ Não      | ⭐⭐⭐⭐    | Fácil | ⭐⭐⭐⭐⭐   |
| **Render**  | FREE             | ✅ 15 min   | ⭐⭐⭐      | Fácil | ⭐⭐⭐⭐     |
| **Fly.io**  | FREE             | ❌ Não      | ⭐⭐⭐⭐    | Médio | ⭐⭐⭐⭐     |
| **Heroku**  | ❌ Descontinuado | -           | -           | -     | ❌           |

---

## 🚀 Recomendação: Railway (Melhor Custo-Benefício)

**Por que Railway?**

1. ✅ Créditos gratuitos ($5/mês)
2. ✅ Nunca hiberna (always-on)
3. ✅ PostgreSQL gerenciado
4. ✅ Interface super simples
5. ✅ Deploy automático em push
6. ✅ Logs em tempo real

**Custo mensal estimado:**

- App pequeno: $2-3/mês
- Com créditos: **$0** 🎉

**Duraria quanto tempo com $5 créditos?**

- ✅ 2-3 meses para app em dev/demo
- Suficiente para MVP ou projeto estudantil

---

## 📋 Passo-a-Passo Railway (Mais Simples)

### 1️⃣ Preparar GitHub

```bash
cd /home/heloisa-cabral/Downloads/UniReserva-main

# Confirmar tudo commitado
git status
# Expected: nothing to commit

# Se houver mudanças
git add .
git commit -m "final: production ready"
git push origin main
```

### 2️⃣ Criar Conta Railway

```
https://railway.app
→ "Sign in with GitHub"
→ Autorize
```

### 3️⃣ Criar Projeto

```
Dashboard
→ "New Project"
→ "Deploy from GitHub repo"
→ Selecione seu usuário GitHub
→ Selecione "UniReserva-main"
```

### 4️⃣ Configurar PostgreSQL

```
Projeto Dashboard
→ "+ New"
→ "Database"
→ "PostgreSQL"
→ Railway cria com nome "postgres"
```

### 5️⃣ Adicionar Variáveis

```
Projeto → Variables

Adicione:
NODE_ENV=production
JWT_SECRET=<gere com comando>
LOG_LEVEL=info

Database auto-configurado:
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
```

### 6️⃣ Gerar JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole em `JWT_SECRET`

### 7️⃣ Deploy

```
Railway detecta Dockerfile automaticamente
Clique em "Deploy"
Aguarde 3-5 minutos
✅ App ao vivo!
```

---

## ✅ Testar Deploy

### 1️⃣ Acessar App

```
Railway Dashboard → seu projeto
→ "View Live"
```

Ou diretamente:

```
https://seu-projeto.railway.app
```

### 2️⃣ Testar Health Endpoint

```bash
curl https://seu-projeto.railway.app/api/health

# Expected:
# {"status":"ok","message":"UniReserva API em execução."}
```

### 3️⃣ Testar Login

```bash
curl -X POST https://seu-projeto.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor@unireserva.com","password":"prof123"}'

# Expected: JWT token no response
```

### 4️⃣ Acessar no Navegador

```
https://seu-projeto.railway.app
```

Login:

- Email: `professor@unireserva.com`
- Senha: `prof123`

---

## 💡 Dicas para Manter Gratuito

### Railway

1. ✅ Usar créditos $5/mês (gratuito)
2. ✅ App pequeno usa ~$2-3/mês
3. ✅ Monitorar usage em Dashboard
4. ✅ Fazer cleanup de images Docker antigas

### Render

1. ✅ Plano gratuito puro
2. ⚠️ App hiberna após 15 min inatividade
3. ✅ Wake-up automático (5-10 seg)
4. ✅ Ideal para projeto estudantil

### Fly.io

1. ✅ Plano gratuito ilimitado
2. ✅ Sem hibernation
3. ✅ 3 apps gratuitos compartilhados
4. ✅ Melhor performance

---

## 🎯 Escolha Fácil

### Para Iniciantes

→ **Railway** (mais simples, $0 com créditos)

### Para Máxima Economia

→ **Render** (100% grátis, mas hiberna)

### Para Melhor Performance

→ **Fly.io** (grátis, sem hibernation)

---

## 🚀 Checklist Deploy Gratuito

- [ ] Código commitado em main
- [ ] Dockerfile presente
- [ ] Variáveis de ambiente definidas
- [ ] Conta criada (Railway/Render/Fly.io)
- [ ] GitHub conectado
- [ ] PostgreSQL provisionado
- [ ] Deploy iniciado
- [ ] Health endpoint respondendo
- [ ] Login funcionando
- [ ] URL acessível publicamente

---

## 🆘 Troubleshooting Gratuito

### Railway

**App não inicia**

```
→ Dashboard → Logs
→ Procure por "ERR" ou "ERROR"
```

**Database não conecta**

```
→ Verificar variáveis em "Variables"
→ Confirmar que PostgreSQL está "running"
```

**Fora de créditos**

```
→ Upgrade para plano pago ($5+)
→ Ou usar Render/Fly.io (grátis)
```

### Render

**App hibernado**

```
→ Normal! Acesse novamente
→ Wake-up em 5-10 segundos
```

**Deployment falhando**

```
→ Verific Build Logs
→ Confirmar npm install funciona
```

### Fly.io

**Deploy com erro**

```bash
# Ver logs
fly logs

# Deploy novamente
fly deploy --force
```

---

## 📊 Custo Mensal Real

| Cenário                    | Railway       | Render | Fly.io |
| -------------------------- | ------------- | ------ | ------ |
| Desenvolvimento            | $0 (créditos) | $0     | $0     |
| MVP com poucos usuários    | $0-2/mês      | $0     | $0     |
| Produção com 1000 usuários | $10-30/mês    | ~$0    | $0-10  |

---

## 🎉 Conclusão

**UniReserva pode rodar GRÁTIS em:**

✅ **Railway** - $5/mês créditos (0 cost com uso moderado)
✅ **Render** - 100% grátis (com hibernation)
✅ **Fly.io** - 100% grátis (melhor performance)

**Todas as opções incluem:**

- ✅ Node.js app
- ✅ PostgreSQL database
- ✅ SSL/HTTPS
- ✅ Domínio público
- ✅ Logs e monitoring

**Tempo para online: 10-15 minutos**

**Custo: $0** 🎉

---

## 📞 Próximos Passos

1. Escolha plataforma (Railway recomendado)
2. Crie conta com GitHub
3. Conecte repositório
4. Configure PostgreSQL
5. Adicione variáveis
6. Deploy! 🚀

**Tudo gratuito!** 💰
