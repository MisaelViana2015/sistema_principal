import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Wrench, ChevronDown, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Manutencao {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  data: string;
  veiculo: string;
}

const mockManutencoes: Manutencao[] = [
  { id: "1", titulo: "revisao_BYD, 20 Mil KM", descricao: "Revisão BYD preventiva", valor: 450, data: "2024-01-15", veiculo: "TQQ0A07" },
  { id: "2", titulo: "Troca de Óleo", descricao: "Troca de óleo sintético", valor: 280, data: "2024-01-10", veiculo: "TQQ0725" },
  { id: "3", titulo: "Rodízio de Pneus", descricao: "Rodízio e balanceamento", valor: 120, data: "2024-01-05", veiculo: "TQS4C30" },
  { id: "4", titulo: "Revisão Elétrica", descricao: "Verificação do sistema elétrico", valor: 350, data: "2024-01-02", veiculo: "TQU0H17" },
];

const AdminManutencoes = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Wrench className="w-5 h-5 text-racing-purple" />
          Histórico de Manutenções
        </h2>
        <Button className="btn-futuristic gap-2">
          <Plus className="w-4 h-4" />
          Nova Manutenção
        </Button>
      </div>

      {/* Filters Card */}
      <div className="futuristic-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3 flex-wrap">
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
              <option>Todos os Veículos</option>
              <option>TQQ0A07</option>
              <option>TQQ0725</option>
              <option>TQS4C30</option>
            </select>
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
              <option>Todos os Anos</option>
              <option>2024</option>
              <option>2023</option>
            </select>
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
              <option>Todos os Meses</option>
              <option>Janeiro</option>
              <option>Fevereiro</option>
              <option>Março</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-sm text-white/70 hover:text-white transition-colors">
            <ChevronDown className="w-4 h-4" />
            Mais Recentes
          </button>
        </div>
      </div>

      {/* Manutencoes List */}
      <div className="space-y-3">
        {mockManutencoes.map((manutencao, index) => (
          <motion.div
            key={manutencao.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="futuristic-card p-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white">{manutencao.titulo}</h3>
                  <p className="text-sm text-white/60">{manutencao.descricao}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(manutencao.data).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white/70">
                      {manutencao.veiculo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-white flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-warning" />
                    R$ {manutencao.valor.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminManutencoes;
