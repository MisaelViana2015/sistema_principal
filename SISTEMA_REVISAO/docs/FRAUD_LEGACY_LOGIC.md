# Documentação da Lógica de Fraude Legada
Este documento foi extraído automaticamente a partir da análise da pasta legacy e documenta as fórmulas e regras de negócio utilizadas no engine anterior.

## 1. Thresholds Globais (Constantes)

| Variável | Valor | Descrição |
| :--- | :--- | :--- |
| `MIN_REVENUE_PER_KM` | **3** | Mínimo aceitável de R$/km |
| `MAX_REVENUE_PER_KM` | **20** | Máximo aceitável de R$/km (acima disso é suspeito) |
| `MIN_REVENUE_PER_HOUR` | **20** | Mínimo R$/hora |
| `MAX_REVENUE_PER_HOUR` | **150** | Máximo R$/hora (acima disso indica anomalia) |
| `MIN_RIDES_PER_HOUR` | **0.3** | Mínimo de corridas/hora |
| `MAX_RIDES_PER_HOUR` | **8** | Máximo de corridas/hora (volume humanamente impossível?) |
| `MIN_SHIFT_HOURS` | **0.16** | (aprox 10 min) Turnos menores que isso são suspeitos |
| `MAX_SHIFT_HOURS` | **14** | Turnos maiores que 14h geram alerta |
| `MAX_KM_GAP_NORMAL` | **250** | Salto máximo permitido no odômetro entre turnos consecutivos |

## 2. Regras de Detecção (Severity & Scoring)
Pontuação Base:
- **CRITICAL** (40 pts)
- **HIGH** (20 pts)
- **MEDIUM** (10 pts)
- **LOW** (5 pts)

Níveis de Risco:
- **CRÍTICO:** Score >= 70
- **SUSPEITO:** Score >= 35

### Regras Implementadas
1. **KM_ZERO_COM_RECEITA** (Critical / 40 pts)
   - Dispara se: KM Total <= 0 E Receita > 0.
   - Motivo: Impossível rodar 0km e gerar receita.

2. **RECEITA_KM_MUITO_BAIXA** (High / 20 pts)
   - Dispara se: R$/km < `MIN_REVENUE_PER_KM` (3).
   - Motivo: Corrida "barata demais" ou KM inflado.

3. **RECEITA_KM_MUITO_ALTA** (Critical / 40 pts)
   - Dispara se: R$/km > `MAX_REVENUE_PER_KM` (20).
   - Motivo: Valor lançado errado ou KM "esquecido".

4. **RECEITA_KM_DESVIO_CRITICO** (Critical / 40 pts)
   - Dispara se: R$/km for **4x maior** que a média histórica do motorista.

5. **RECEITA_HORA_MUITO_ALTA** (Critical / 40 pts)
   - Dispara se: R$/h > 150.

6. **POUCAS_CORRIDAS_HORA** (Low / 5 pts)
   - Dispara se: Corridas/h < 0.3.

7. **TURNO_CURTO_DEMAIS** (Medium / 10 pts)
   - Dispara se: Duração < 10min e teve corridas registradas.

8. **KM_RETROCEDEU** (Critical / 40 pts)
   - Dispara se: KM Inicial do turno atual < KM Final do turno anterior.
   - Motivo: Odômetro voltado ou erro grave de digitação.

9. **KM_SALTO_ABSURDO** (High / 20 pts)
   - Dispara se: Diferença entre turnos > 250km (sem registro no sistema).

10. **CLUSTER_OUTLIER_CRITICO** (Critical / 80 pts)
    - Dispara se: Distância euclidiana do vetor de características do turno para o centro do cluster mais próximo for >= 5.0.

## 3. Baseline (Perfil do Motorista)
O sistema calcula a média histórica (últimos **30 dias**, máx 200 turnos) para cada motorista:
- Média R$/km
- Média R$/hora
- Média Corridas/hora
- Ticket Médio
- Média KM/turno
- Média Duração/turno

Esses valores são usados para detectar desvios (Ex: regra 4).

## 4. Feature Vectors (Clusters)
Aparentemente usava-se vetores para agrupar comportamento padrão.
(Implementação detalhada em `riskClusters.ts` - requer análise se formos portar essa parte).
