import { motion } from "framer-motion";
import { Plus, Edit2, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Motorista {
  id: string;
  name: string;
  email: string;
}

const mockMotoristas: Motorista[] = [
  { id: "1", name: "João Silva", email: "joao.silva@email.com" },
  { id: "2", name: "Maria Santos", email: "maria.santos@email.com" },
  { id: "3", name: "Pedro Oliveira", email: "pedro.oliveira@email.com" },
  { id: "4", name: "Ana Costa", email: "ana.costa@email.com" },
];

const AdminMotoristas = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-racing-purple" />
          Gestão de Motoristas
        </h2>
        <Button className="btn-futuristic gap-2">
          <Plus className="w-4 h-4" />
          Novo Motorista
        </Button>
      </div>

      {/* Motoristas List */}
      <div className="space-y-3">
        {mockMotoristas.map((motorista, index) => (
          <motion.div
            key={motorista.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="futuristic-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">{motorista.name}</h3>
                  <p className="text-sm text-white/60 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {motorista.email}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/20">
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminMotoristas;
