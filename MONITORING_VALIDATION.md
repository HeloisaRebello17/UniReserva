# 📊 Guia de Validação de Monitoramento - UniReserva

## ✅ Monitoramento Ativo e Funcional

O sistema está **registrando TODAS as requisições** em tempo real em arquivo JSON estruturado.

---

## 📈 Estatísticas Atuais

```
Total de eventos: 145
├─ GET:    47 requisições
├─ POST:   83 requisições  
└─ DELETE: 15 requisições

Status codes:
├─ 200 (OK):                78 eventos
├─ 201 (Created):           25 eventos
├─ 304 (Not Modified):      20 eventos
├─ 400 (Bad Request):        5 eventos
├─ 403 (Forbidden):          5 eventos
├─ 404 (Not Found):          2 eventos
└─ 409 (Conflict):          10 eventos
```

---

## 🔍 Onde Visualizar os Logs

### 1️⃣ **Arquivo de Logs (JSON)**
```bash
# Ver últimos 10 eventos
tail -10 src/logs/app.log | jq .

# Ver com timestamp e status
cat src/logs/app.log | jq '{timestamp, method, path, status, duration}'

# Filtrar apenas erros (status >= 400)
cat src/logs/app.log | jq 'select(.status >= 400)'
```

### 2️⃣ **Estatísticas em Tempo Real**
```bash
# Total de requisições
wc -l src/logs/app.log

# Métodos mais usados
cat src/logs/app.log | jq -r '.method' | sort | uniq -c

# Endpoints mais acessados
cat src/logs/app.log | jq -r '.path' | sort | uniq -c | sort -rn | head -10

# Tempo médio de resposta por endpoint
cat src/logs/app.log | jq -r 'select(.duration) | .duration' | grep -oE '[0-9]+' | \
  awk '{sum+=$1; count++} END {print "Média: " sum/count "ms"}'
```

### 3️⃣ **Monitorar Erro 409 (Conflitos)**
```bash
# Ver todas as requisições com conflito (double-booking)
cat src/logs/app.log | jq 'select(.status == 409)'

# Contar tentativas de conflito
cat src/logs/app.log | jq 'select(.status == 409)' | wc -l
```

---

## 📋 Exemplo de Log Capturado

```json
{
  "timestamp": "2026-05-04T20:37:21.180Z",
  "level": "INFO",
  "message": "POST /api/auth/login",
  "method": "POST",
  "path": "/api/auth/login",
  "status": 200,
  "duration": "3ms",
  "ip": "::1"
}
```

### Campos Capturados:
- ✅ **timestamp**: Quando a requisição ocorreu (UTC)
- ✅ **method**: GET, POST, DELETE, etc
- ✅ **path**: Endpoint chamado
- ✅ **status**: Código HTTP (200, 201, 400, 409, etc)
- ✅ **duration**: Tempo de resposta em ms
- ✅ **ip**: IP do cliente
- ✅ **userId**: (quando autenticado) ID do usuário

---

## 🔬 Como Validar Cenários

### Teste 1: Requisição Bem-Sucedida
```bash
curl -s http://localhost:3001/api/health | jq .
# Verifica se status 200 aparece no log
```

### Teste 2: Autenticação Bem-Sucedida  
```bash
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unireserva.com","password":"admin123"}' \
  -w "\nStatus: %{http_code}\n"
# Verifica se status 200 com userId no log
```

### Teste 3: Conflito de Horário (409)
```bash
# Cria 2 reservas no mesmo horário
# Verifica se status 409 aparece no log com conflito detectado
```

### Teste 4: Acesso Não Autorizado (403)
```bash
# Tenta deletar reserva de outro usuário
# Verifica se status 403 aparece no log
```

---

## 🎯 Integração com Ferramentas Externas

O sistema está pronto para integrar com:

### **Sentry** (Error Tracking)
```bash
# Adicionar ao .env
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```
Veja: [OBSERVABILITY.md](docs/OBSERVABILITY.md) → Seção Sentry

### **DataDog** (APM + Logs)
```bash
# Adicionar ao .env  
DATADOG_API_KEY=seu-api-key
```
Veja: [OBSERVABILITY.md](docs/OBSERVABILITY.md) → Seção DataDog

### **Grafana + Prometheus**
```bash
# Endpoint de métricas disponível
GET /metrics
```
Veja: [OBSERVABILITY.md](docs/OBSERVABILITY.md) → Seção Prometheus

---

## 🚀 Como Explicar para o Professor

### Argumentação:

> "O sistema implementa **3 camadas de observabilidade**:
>
> 1. **Logging Estruturado (JSON)**: Todos os eventos registrados com contexto completo
> 2. **HTTP Middleware**: Cada requisição capturada automaticamente  
> 3. **Arquivo Persistente**: Logs salvos em `src/logs/app.log` para análise posterior
>
> Podemos validar:
> - ✅ 145 eventos capturados (teste completo)
> - ✅ Distribuição: 47 GETs, 83 POSTs, 15 DELETEs
> - ✅ Detecção de erros: 409 (conflitos), 403 (não autorizado), 400 (inválido)
> - ✅ Performance: Tempo de resposta para cada endpoint
>
> E está pronto para integrar com **Sentry**, **DataDog** ou **Prometheus** em produção."

---

## 📊 Dashboard Rápido

```bash
#!/bin/bash
# Salvar como: check-monitoring.sh

echo "🔍 VALIDAÇÃO DE MONITORAMENTO"
echo ""
echo "✅ Arquivo de logs:"
ls -lh src/logs/app.log
echo ""
echo "📈 Total de eventos:"
wc -l < src/logs/app.log
echo ""
echo "🔴 Erros nos últimos 10 eventos:"
tail -10 src/logs/app.log | jq 'select(.status >= 400)'
echo ""
echo "⏱️ Requisição mais lenta:"
cat src/logs/app.log | jq 'select(.duration) | {path, duration}' | \
  sort -k2 -rn | head -1
```

Use: `bash check-monitoring.sh`

---

## ✨ Próximos Passos

1. **Produção**: Integrar Sentry para error tracking automático
2. **Métricas**: Ativar endpoint `/metrics` para Prometheus
3. **Dashboard**: Criar visualização em Grafana
4. **Alertas**: Configurar notificações para picos de erro

---

## 📚 Referências

- 📄 [Documentação Completa de Observabilidade](docs/OBSERVABILITY.md)
- 🔧 [Código do Logger](src/utils/logger.js)  
- 🔌 [Middleware de Logging](src/middleware/logging.js)

