import pkg from 'pg';
const { Pool } = pkg;

// URL de conexão da Railway (externa)
const DATABASE_URL = 'postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 1
});

async function analyzeAndFixShifts() {
  const client = await pool.connect();

  try {
    console.log('🔍 Conectado ao banco de dados Railway...\n');

    // 1. Buscar todos os turnos fechados
    const shiftsResult = await client.query(`
      SELECT 
        id,
        driver_id,
        total_bruto,
        total_custos,
        liquido,
        repasse_empresa,
        repasse_motorista,
        status,
        fim
      FROM shifts
      WHERE status = 'fechado'
      ORDER BY fim DESC
    `);

    console.log(`📊 Total de turnos fechados: ${shiftsResult.rows.length}\n`);

    // 2. Identificar turnos com problema 50/50
    const problematicShifts = shiftsResult.rows.filter(shift => {
      const liquido = parseFloat(shift.liquido) || 0;
      const repasseEmpresa = parseFloat(shift.repasse_empresa) || 0;
      const repasseMotorista = parseFloat(shift.repasse_motorista) || 0;

      // Verificar se está dividindo 50/50 (com margem de erro de 1 real)
      const diff = Math.abs(repasseEmpresa - repasseMotorista);
      const is5050 = diff < 1 && repasseEmpresa > 0;

      // Verificar se deveria ser 60/40
      const expectedEmpresa = liquido * 0.6;
      const expectedMotorista = liquido * 0.4;
      const shouldBe6040 = Math.abs(repasseEmpresa - expectedEmpresa) > 1;

      return is5050 && shouldBe6040;
    });

    console.log(`⚠️  Turnos com problema 50/50: ${problematicShifts.length}\n`);

    if (problematicShifts.length === 0) {
      console.log('✅ Nenhum turno com problema encontrado!');
      return;
    }

    // 3. Mostrar detalhes dos turnos problemáticos
    console.log('📋 TURNOS COM PROBLEMA:\n');
    problematicShifts.forEach((shift, index) => {
      const liquido = parseFloat(shift.liquido) || 0;
      const repasseEmpresa = parseFloat(shift.repasse_empresa) || 0;
      const repasseMotorista = parseFloat(shift.repasse_motorista) || 0;

      const expectedEmpresa = liquido * 0.6;
      const expectedMotorista = liquido * 0.4;

      console.log(`${index + 1}. Turno ID: ${shift.id}`);
      console.log(`   Driver ID: ${shift.driver_id}`);
      console.log(`   Fechado em: ${shift.fim}`);
      console.log(`   Líquido: R$ ${liquido.toFixed(2)}`);
      console.log(`   ATUAL - Empresa: R$ ${repasseEmpresa.toFixed(2)} | Motorista: R$ ${repasseMotorista.toFixed(2)}`);
      console.log(`   CORRETO - Empresa: R$ ${expectedEmpresa.toFixed(2)} | Motorista: R$ ${expectedMotorista.toFixed(2)}`);
      console.log('');
    });

    // 4. Perguntar se deseja corrigir
    console.log('🔧 INICIANDO CORREÇÃO...\n');

    let fixedCount = 0;

    for (const shift of problematicShifts) {
      const liquido = parseFloat(shift.liquido) || 0;
      const repasseEmpresa = (liquido * 0.6).toFixed(2);
      const repasseMotorista = (liquido * 0.4).toFixed(2);

      await client.query(`
        UPDATE shifts
        SET 
          repasse_empresa = $1,
          repasse_motorista = $2
        WHERE id = $3
      `, [repasseEmpresa, repasseMotorista, shift.id]);

      fixedCount++;
      console.log(`✅ Turno ${shift.id} corrigido: Empresa R$ ${repasseEmpresa} | Motorista R$ ${repasseMotorista}`);
    }

    console.log(`\n🎉 Total de turnos corrigidos: ${fixedCount}`);

    // 5. Validar correções
    console.log('\n🔍 VALIDANDO CORREÇÕES...\n');

    const validationResult = await client.query(`
      SELECT 
        id,
        liquido,
        repasse_empresa,
        repasse_motorista
      FROM shifts
      WHERE id = ANY($1)
    `, [problematicShifts.map(s => s.id)]);

    let allCorrect = true;
    validationResult.rows.forEach(shift => {
      const liquido = parseFloat(shift.liquido) || 0;
      const repasseEmpresa = parseFloat(shift.repasse_empresa) || 0;
      const repasseMotorista = parseFloat(shift.repasse_motorista) || 0;

      const expectedEmpresa = liquido * 0.6;
      const expectedMotorista = liquido * 0.4;

      const empresaOk = Math.abs(repasseEmpresa - expectedEmpresa) < 0.01;
      const motoristaOk = Math.abs(repasseMotorista - expectedMotorista) < 0.01;

      if (empresaOk && motoristaOk) {
        console.log(`✅ Turno ${shift.id}: CORRETO`);
      } else {
        console.log(`❌ Turno ${shift.id}: AINDA COM PROBLEMA`);
        allCorrect = false;
      }
    });

    if (allCorrect) {
      console.log('\n✅ TODAS AS CORREÇÕES VALIDADAS COM SUCESSO!');
    } else {
      console.log('\n⚠️  ALGUMAS CORREÇÕES FALHARAM - VERIFIQUE MANUALMENTE');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar
analyzeAndFixShifts()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
