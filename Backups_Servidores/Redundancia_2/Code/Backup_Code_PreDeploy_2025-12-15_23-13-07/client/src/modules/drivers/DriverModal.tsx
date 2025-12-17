
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Driver } from "../../../../shared/schema";

interface DriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    driver?: Driver;
}

export function DriverModal({ isOpen, onClose, onSave, driver }: DriverModalProps) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [telefone, setTelefone] = useState("");
    const [role, setRole] = useState("driver");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (driver) {
                setNome(driver.nome);
                setEmail(driver.email);
                setTelefone(driver.telefone || "");
                setRole(driver.role);
                setSenha(""); // Senha vazia na edição significa "não alterar"
            } else {
                setNome("");
                setEmail("");
                setTelefone("");
                setRole("driver");
                setSenha("");
            }
        }
    }, [isOpen, driver]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const data: any = {
                nome,
                email,
                telefone,
                role
            };

            // Só envia senha se foi preenchida (criação ou alteração)
            if (senha) {
                data.senha = senha;
            }

            await onSave(data);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar motorista.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>

            <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">{driver ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nome" className="text-right text-gray-700 dark:text-gray-200">
                            Nome
                        </Label>
                        <Input
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="col-span-3 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right text-gray-700 dark:text-gray-200">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="senha" className="text-right text-gray-700 dark:text-gray-200">
                            Senha
                        </Label>
                        <Input
                            id="senha"
                            type="password"
                            placeholder={driver ? "Deixe em branco para manter" : "Senha obrigatória"}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="col-span-3 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="telefone" className="text-right text-gray-700 dark:text-gray-200">
                            Telefone
                        </Label>
                        <Input
                            id="telefone"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            className="col-span-3 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right text-gray-700 dark:text-gray-200">
                            Tipo
                        </Label>
                        <div className="col-span-3">
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                    <SelectItem value="driver" className="dark:text-gray-200 dark:focus:bg-slate-700">Motorista</SelectItem>
                                    <SelectItem value="admin" className="dark:text-gray-200 dark:focus:bg-slate-700">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading} className="dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700 dark:hover:bg-slate-700">Cancelar</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700">
                        {isLoading ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
