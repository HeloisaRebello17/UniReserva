# ⚡ Deploy Gratuito em 10 Minutos (Railway)

## 🎯 Objetivo

Colocar UniReserva online **100% GRÁTIS** usando Railway.

**Custo:** $0 (usando créditos gratuitos de $5/mês)
**Tempo:** 10 minutos

---

## ✅ Pré-requisitos

- ✅ Código commitado em GitHub
- ✅ Conta GitHub funcionando
- ✅ Arquivo `Dockerfile` presente (já temos!)

---

## 🚀 Step-by-Step

### Step 1: Acessar Railway (1 minuto)

```
1. Abra https://railway.app
2. Clique em "Sign in with GitHub"
3. Autorize Railway a acessar sua conta
4. Pronto! Você está logado ✅
```

### Step 2: Criar Projeto (1 minuto)

```
1. Railway Dashboard aparece
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha sua conta GitHub
5. Selecione "UniReserva-main"
6. Clique "Deploy"
```

Railroad começará a detectar Dockerfile e criar container!

### Step 3: Adicionar Banco de Dados (2 minutos)

**Confuso de onde clicar?** 👉 Veja [RAILWAY_ADD_DATABASE_VISUAL_GUIDE.md](RAILWAY_ADD_DATABASE_VISUAL_GUIDE.md)

```
1. Seu projeto está sendo criado...
2. Quando terminar, clique em "+ New"
3. Selecione "Database"
4. Selecione "PostgreSQL"
5. Railway cria automaticamente (sem precisar nomear)
```

Railway irá provisionar PostgreSQL automaticamente ✨

**O que você verá após:**

- Container "postgres" adicionado ao dashboard
- Status: ✅ Running
- Variáveis de banco preenchidas automaticamente

### Step 4: Configurar Variáveis (3 minutos)

**Abra seu projeto → "Variables"**

Adicione estas variáveis:

```
NODE_ENV
production

JWT_SECRET
<Cole aqui o valor gerado abaixo>

LOG_LEVEL
info
```

**Variáveis de Database (copie-cole):**

```
DB_HOST
${{Postgres.PGHOST}}

DB_PORT
${{Postgres.PGPORT}}

DB_USER
${{Postgres.PGUSER}}

DB_PASSWORD
${{Postgres.PGPASSWORD}}

DB_NAME
${{Postgres.PGDATABASE}}
```

### Gerar JWT_SECRET (na sua máquina local)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado (ex: `a3f2c9e1b8d4f6a2c1e9b7d3f5a8c2e4b6d9f1a3c5e7b9d1f3a5c7e9b1d3`)

Cole em `JWT_SECRET`

### Step 5: Deploy! (2 minutos)

```
1. Railway detecta Dockerfile automaticamente
2. Se houver mudanças, clique "Redeploy"
3. Veja logs em tempo real
4. Aguarde até ver: "Successfully deployed"
5. ✅ Pronto!
```

### Step 6: Obter URL Pública (1 minuto)

```
1. Seu projeto → "Deployments"
2. Veja URL gerada (ex: unireserva-prod.railway.app)
3. Clique em "View Live"
4. App abre em novo browser tab 🎉
```

---

## 🔗 Sua URL é:

```
https://seu-projeto.railway.app
```

Compartilhe essa URL com qualquer pessoa! Ela pode acessar o UniReserva agora.

---

## ✅ Testar Aplicação

### 1. Health Check

Abra no browser:

```
https://seu-projeto.railway.app/api/health
```

Deve retornar:

```json
{
  "status": "ok",
  "message": "UniReserva API em execução."
}
```

### 2. Acessar Interface

```
https://seu-projeto.railway.app
```

Login:

- **Email**: professor@unireserva.com
- **Senha**: prof123

### 3. Testar Funcionalidades

- [ ] Fazer login
- [ ] Ver salas disponíveis
- [ ] Criar uma reserva
- [ ] Cancelar reserva

---

## 📊 Monitoramento

No **Railway Dashboard**:

```
Seu Projeto → Overview
├── Deployments (ver histórico)
├── Logs (ver em tempo real)
├── Metrics (CPU, Memory, Requests)
├── Variables (editar vars)
└── Settings (configurações)
```

---

## 💰 Custo

```
Free Tier: $5/mês em créditos

Seu app usa:
├── App container: ~$0.50/mês
├── PostgreSQL: ~$1.50/mês
└── Total: ~$2.00/mês

✅ Saldo sobrando: $3.00/mês
```

**Resultado: 100% GRÁTIS** 🎉

---

## 🆘 Se Algo der Errado

### App não inicia

```
1. Clique em seu projeto
2. Abra "Logs"
3. Procure por linhas com "ERROR" ou "ERR"
4. Leia a mensagem de erro
5. Corrija no código local
6. git push origin main
7. Railway faz redeploy automático
```

### Database não conecta

```
1. Verifique se PostgreSQL está "running"
2. Confirme variáveis em "Variables"
3. Veja se DB_HOST, DB_USER, etc. estão preenchidas
4. Clique "Redeploy"
```

### Erro: "Permission denied"

```
Provavelmente variável não configurada
1. Abra "Variables"
2. Confirme que todas estão preenchidas
3. Clique "Redeploy"
```

---

## 🎁 Bonus: Domínio Customizado (Opcional)

Se quiser usar seu próprio domínio (ex: reservas.com):

```
Railway → Seu Projeto → Settings → Domains
→ "Add Custom Domain"
→ Digite: seu-dominio.com
→ Railway gera certificado SSL automático
→ Atualize DNS do seu domínio (Railway mostra instruções)
```

---

## 📋 Checklist Final

- [ ] Código está em main (git push feito)
- [ ] Conta Railway criada
- [ ] Projeto criado em Railway
- [ ] PostgreSQL adicionado
- [ ] Variáveis configuradas (6 variables)
- [ ] JWT_SECRET gerado e colado
- [ ] Deploy completo e "green"
- [ ] URL acessível no browser
- [ ] Health endpoint respondendo
- [ ] Login funcionando
- [ ] Reservas sendo criadas

---

## 🎉 PRONTO!

Seu UniReserva está **online e gratuito**!

```
URL: https://seu-projeto.railway.app
Status: ✅ Rodando
Custo: $0/mês
Banco: PostgreSQL gerenciado
Logs: Tempo real no Dashboard
```

**Compartilhe a URL com qualquer pessoa!**

---

## 💡 Dicas

1. **Atualizações automáticas**: Qualquer `git push` para `main` trigger redeploy em Railway
2. **Monitorar uso**: Vá em Railway → Account → Usage para ver quanto tá usando dos créditos
3. **Backups**: Railway faz backup automático do BD
4. **Logs**: Sempre check os logs quando algo der errado

---

## 📞 Suporte Railway

Se tiver problema:

- Railway Docs: https://docs.railway.app
- Railway Community: https://railway.app/chat

---

**Parabéns! Você fez deploy gratuito! 🚀**
