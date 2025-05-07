
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Image as ImageIcon, X } from 'lucide-react';

interface MessageComposerProps {
  onMessageReady: (message: string, image: File | null) => void;
}

const MessageComposer = ({ onMessageReady }: MessageComposerProps) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (!selectedFile) {
      return;
    }

    // Check if file is an image
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    setImage(selectedFile);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, escreva uma mensagem antes de prosseguir.",
        variant: "destructive",
      });
      return;
    }

    onMessageReady(message, image);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Compor Mensagem</CardTitle>
        <CardDescription>
          Escreva a mensagem e adicione imagens se desejar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Digite sua mensagem aqui... Use {nome} para personalizar com o nome do contato."
            className="min-h-[150px] resize-y"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        
        {imagePreview ? (
          <div className="relative rounded-md overflow-hidden border border-gray-200">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-auto max-h-[200px] object-contain bg-gray-100" 
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
            <Input
              type="file"
              id="image-upload"
              className="hidden"
              onChange={handleImageChange}
              accept="image/*"
            />
            <label 
              htmlFor="image-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-600">
                Adicionar imagem
              </span>
              <span className="text-xs text-gray-500 mt-1">
                JPG, PNG ou GIF até 5MB
              </span>
            </label>
          </div>
        )}

        <div className="bg-secondary p-3 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Prévia da mensagem:</h3>
          <div className="bg-whatsapp-light rounded-lg p-3 whatsapp-message text-sm">
            {message || "Sua mensagem aparecerá aqui..."}
          </div>
          {imagePreview && (
            <div className="mt-2 text-xs text-gray-500">
              + 1 imagem anexada
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSendMessage} 
          disabled={!message.trim()} 
          className="w-full"
        >
          Prosseguir
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MessageComposer;
