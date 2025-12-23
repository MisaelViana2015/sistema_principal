
import { useState } from "react";
import { Upload, FileUp, AlertCircle, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";

export default function ImportTab() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('idle');

        // Simulação de upload por enquanto
        setTimeout(() => {
            setUploading(false);
            if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
                setStatus('success');
                setMessage(`Arquivo "${file.name}" recebido! A lógica de processamento será implementada em breve.`);
            } else {
                setStatus('error');
                setMessage('Formato inválido. Por favor envie um arquivo .csv ou .xlsx');
            }
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <FileUp className="w-8 h-8 text-blue-500" />
                        Importar Turnos Históricos
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                        Importe turnos, corridas e custos através de arquivo CSV ou Excel.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Area de Upload */}
                    <div className={`
                        border-2 border-dashed rounded-xl p-10 text-center transition-all
                        ${file
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }
                    `}>
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".csv, .xlsx, .xls"
                            onChange={handleFileChange}
                        />

                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                <Upload className="w-10 h-10" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {file ? file.name : "Escolher arquivo CSV ou Excel"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {file ? `${(file.size / 1024).toFixed(2)} KB` : "Clique para selecionar ou arraste aqui"}
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Botão de Ação */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
                        >
                            {uploading ? "Enviando..." : "Importar Dados"}
                        </Button>
                    </div>

                    {/* Feedback */}
                    {status === 'success' && (
                        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-300">Sucesso</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-400">{message}</AlertDescription>
                        </Alert>
                    )}

                    {status === 'error' && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Erro</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="text-lg">Modelo de Importação</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Colunas Necessárias
                        </h4>
                        <code className="text-sm bg-gray-100 dark:bg-gray-950 p-2 rounded block overflow-x-auto text-gray-700 dark:text-gray-300 font-mono">
                            motorista, veiculo, data_inicio, hora_inicio, hora_fim, km_inicial, km_final, valor_custos
                        </code>
                        <p className="text-sm text-gray-500 mt-2">
                            * Detalhes das corridas podem ser adicionados em colunas subsequentes ou em planilha separada (a definir).
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
