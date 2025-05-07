
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, FileSpreadsheet, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Contact {
  phone: string;
  name?: string;
}

interface ContactUploadProps {
  onContactsLoaded: (contacts: Contact[]) => void;
}

const ContactUpload = ({ onContactsLoaded }: ContactUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFileError(null);
    
    if (!selectedFile) {
      return;
    }

    // Check if file is Excel (.xlsx)
    if (!selectedFile.name.endsWith('.xlsx')) {
      setFileError('Por favor, selecione um arquivo Excel (.xlsx).');
      return;
    }

    setFile(selectedFile);
  };

  const processContacts = () => {
    if (!file) {
      setFileError('Nenhum arquivo selecionado.');
      return;
    }

    setIsUploading(true);

    // In a real app, we'd use a library like SheetJS to process the Excel file
    // For this demo, we'll simulate contact processing
    setTimeout(() => {
      // Mock contacts from "Excel file"
      const mockContacts: Contact[] = [
        { phone: '+5511987654321', name: 'João Silva' },
        { phone: '+5511987654322', name: 'Maria Oliveira' },
        { phone: '+5511987654323', name: 'Carlos Santos' },
        { phone: '+5511987654324', name: 'Ana Souza' },
        { phone: '+5511987654325', name: 'Paulo Lima' },
        { phone: '+5511987654326', name: 'Lucia Pereira' },
        { phone: '+5511987654327', name: 'Roberto Alves' },
        { phone: '+5511987654328', name: 'Julia Costa' },
        { phone: '+5511987654329', name: 'Felipe Martins' },
        { phone: '+5511987654330', name: 'Patricia Ferreira' },
      ];

      onContactsLoaded(mockContacts);
      setIsUploading(false);
      
      toast({
        title: "Contatos carregados!",
        description: `${mockContacts.length} contatos importados com sucesso.`,
      });
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Carregar Contatos</CardTitle>
        <CardDescription>
          Faça upload de uma planilha Excel (.xlsx) com os contatos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fileError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{fileError}</AlertDescription>
          </Alert>
        )}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".xlsx"
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer flex flex-col items-center"
          >
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">
              Clique para selecionar um arquivo Excel
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Somente arquivos .xlsx são aceitos
            </span>
          </label>
        </div>

        {file && (
          <div className="flex items-center justify-between rounded-md bg-secondary p-3">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium truncate max-w-[180px]">{file.name}</span>
            </div>
            <Check className="h-5 w-5 text-green-500" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={processContacts} 
          disabled={!file || isUploading} 
          className="w-full"
        >
          {isUploading ? "Processando..." : "Carregar Contatos"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContactUpload;
