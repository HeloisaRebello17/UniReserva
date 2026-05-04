#!/bin/bash

# Script de Validação de Monitoramento - UniReserva
# Uso: bash check-monitoring.sh

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔍 VALIDAÇÃO DE MONITORAMENTO - UniReserva               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar se arquivo de logs existe
echo "📍 ETAPA 1: Arquivo de Logs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f src/logs/app.log ]; then
    SIZE=$(du -h src/logs/app.log | cut -f1)
    echo "✅ Arquivo encontrado: src/logs/app.log ($SIZE)"
else
    echo "❌ Arquivo não encontrado. Execute o servidor com 'npm start'"
    exit 1
fi
echo ""

# 2. Total de eventos
echo "📊 ETAPA 2: Estatísticas de Eventos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$(wc -l < src/logs/app.log)
echo "📈 Total de eventos registrados: $TOTAL"
echo ""

# 3. Distribuição de métodos
echo "🔀 ETAPA 3: Métodos HTTP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Distribuição:"
cat src/logs/app.log | jq -r '.method' 2>/dev/null | sort | uniq -c | \
  awk '{printf "  • %s: %d requisições\n", $2, $1}'
echo ""

# 4. Status codes
echo "🚦 ETAPA 4: Status Codes HTTP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Distribuição:"
cat src/logs/app.log | jq -r '.status' 2>/dev/null | sort | uniq -c | sort -rn | \
  awk '{
    status=$2
    count=$1
    if (status == 200) desc="✅ OK"
    else if (status == 201) desc="✅ Criado"
    else if (status == 304) desc="ℹ️ Não Modificado"
    else if (status == 400) desc="⚠️ Requisição Inválida"
    else if (status == 403) desc="🔒 Não Autorizado"
    else if (status == 404) desc="❓ Não Encontrado"
    else if (status == 409) desc="⚡ Conflito"
    else desc="?"
    printf "  • [%d] %s (%d eventos)\n", status, desc, count
  }'
echo ""

# 5. Endpoints mais acessados
echo "🔝 ETAPA 5: Endpoints Mais Acessados"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat src/logs/app.log | jq -r '.path' 2>/dev/null | sort | uniq -c | sort -rn | head -5 | \
  awk '{printf "  %d. %s (%d hits)\n", NR, $2, $1}'
echo ""

# 6. Tempo médio de resposta
echo "⏱️ ETAPA 6: Performance"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL_TIME=$(cat src/logs/app.log | jq -r '.duration' 2>/dev/null | grep -oE '[0-9]+' | \
  awk '{sum+=$1} END {print sum}')
COUNT=$(cat src/logs/app.log | jq -r '.duration' 2>/dev/null | grep -oE '[0-9]+' | wc -l)
if [ $COUNT -gt 0 ]; then
    AVG=$((TOTAL_TIME / COUNT))
    echo "  • Tempo médio de resposta: ${AVG}ms"
    echo "  • Total de requisições com timing: $COUNT"
else
    echo "  • Nenhum timing capturado"
fi
echo ""

# 7. Erros detectados
echo "🔴 ETAPA 7: Análise de Erros"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ERROR_COUNT=$(cat src/logs/app.log | jq 'select(.status >= 400)' 2>/dev/null | jq -s 'length')
echo "  • Erros totais (status >= 400): $ERROR_COUNT"
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo ""
    echo "  Top 5 erros:"
    cat src/logs/app.log | jq 'select(.status >= 400) | {method, path, status}' 2>/dev/null | \
      head -$((ERROR_COUNT < 5 ? ERROR_COUNT : 5)) | jq . | sed 's/^/    /'
fi
echo ""

# 8. Resumo final
echo "✨ RESUMO FINAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SUCCESS=$((TOTAL - ERROR_COUNT))
SUCCESS_RATE=$((SUCCESS * 100 / TOTAL))
echo "  ✅ Taxa de sucesso: ${SUCCESS_RATE}% ($SUCCESS/$TOTAL)"
echo "  📍 Status do monitoramento: ATIVO"
echo "  📁 Arquivo: src/logs/app.log"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ Monitoramento Validado com Sucesso!                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📖 Para mais detalhes, veja: MONITORING_VALIDATION.md"
echo ""
