# Instruções de Importação de Turnos

## Como usar:

### 1. Preencher o CSV

Use o arquivo `importacao_turnos_detalhado.csv` como modelo.

**Campos do CSV:**
- `email_motorista`: Email do motorista cadastrado no sistema
- `placa_veiculo`: Placa do veículo cadastrado
- `data_inicial`: Data de início do turno (formato: DD/MM/AAAA)
- `hora_inicial`: Hora de início (formato: HH:MM)
- `data_final`: Data de fim do turno (formato: DD/MM/AAAA)
- `hora_final`: Hora de fim (formato: HH:MM)
- `km_inicial`: Quilometragem inicial
- `km_final`: Quilometragem final
- `tipo_lancamento`: `custo` ou `corrida`
- `hora_lancamento`: Hora da corrida (HH:MM) - vazio para custos
- `tipo_corrida`: `app` ou `particular` - vazio para custos
- `valor`: Valor em formato decimal (ex: 12.50)
- `observacao`: Descrição do custo (ex: Recarga App, Recarga Carro, Outro)

### 2. Exemplo de preenchimento

Para cada turno, você vai ter múltiplas linhas:
- **3 linhas de custos** (Recarga App, Recarga Carro, Outro)
- **N linhas de corridas** (uma para cada corrida do turno)

Todos compartilham os mesmos dados de turno (email, placa, datas, km).

### 3. Executar a importação

```bash
npx tsx server/scripts/importarTurnos.ts importacao_turnos_detalhado.csv
```

### 4. O que o script faz

✅ Lê o CSV
✅ Agrupa as linhas por turno
✅ Valida se motorista e veículo existem
✅ Calcula todos os totais automaticamente:
   - Total bruto (app + particular)
   - Líquido (bruto - custos)
   - 60% empresa / 40% motorista
   - Total de corridas
   - Valor por KM
   - Duração do turno
✅ Insere o turno completo com todas as corridas e custos

### Observações importantes:

- O motorista e o veículo **devem estar cadastrados** no sistema antes da importação
- Use ponto (.) para decimais nos valores (ex: 12.50 não 12,50)
- As datas devem estar no formato DD/MM/AAAA
- As horas devem estar no formato HH:MM
- Para custos com valor zero, você pode incluir a linha, o script vai ignorar
