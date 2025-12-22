import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, FileText, Car, Zap, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TipoCusto {
  id: string;
  nome: string;
  icon: React.ElementType;
  isPadrao: boolean;
}

const mockTiposCusto: TipoCusto[] = [
  { id: "1", nome: "Outros", icon: DollarSign, isPadrao: true },
  { id: "2", nome: "Pedágio", icon: MapPin, isPadrao: true },
  { id: "3", nome: "Recarga APP", icon: Zap, isPadrao: true },
  { id: "4", nome: "Recarga Carro", icon: Car, isPadrao: true },
];

const AdminTiposCusto = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-racing-purple" />
          Tipos de Custo
        </h2>
        <Button className="btn-futuristic gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Tipo
        </Button>
      </div>

      {/* Tipos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTiposCusto.map((tipo, index) => {
          const Icon = tipo.icon;

          return (
            <motion.div
              key={tipo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="futuristic-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-racing-purple/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-racing-purple" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">{tipo.nome}</h3>
                    {tipo.isPadrao && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-secondary text-muted-foreground">
                        Padrão
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTiposCusto;
