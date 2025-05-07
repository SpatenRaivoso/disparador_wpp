
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface Contact {
  phone: string;
  name?: string;
}

interface SendingProgressProps {
  contacts: Contact[];
  message: string;
  image: File | null;
  onComplete: () => void;
  onReset: () => void;
}

interface SendingStatus {
  sent: number;
  failed: number;
  pending: number;
}

const SendingProgress = ({ contacts, message, image, onComplete, onReset }: SendingProgressProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState<SendingStatus>({
    sent: 0,
    failed: 0,
    pending: contacts.length,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  // Calculate progress percentage
  const progressPercentage = Math.round((status.sent + status.failed) * 100 / contacts.length);
  
  // Reset everything when contacts, message or image change
  useEffect(() => {
    setStatus({
      sent: 0,
      failed: 0,
      pending: contacts.length,
    });
    setCurrentIndex(0);
    setIsSending(false);
    setIsPaused(false);
  }, [contacts, message, image]);

  // Start sending messages
  const startSending = () => {
    setIsSending(true);
    setIsPaused(false);
  };

  // Pause sending
  const pauseSending = () => {
    setIsPaused(true);
  };

  // Cancel sending
  const cancelSending = () => {
    if (window.confirm("Tem certeza que deseja cancelar o envio?")) {
      setIsSending(false);
      setIsPaused(false);
      toast({
        title: "Envio cancelado",
        description: `${status.sent} mensagens enviadas antes do cancelamento.`,
      });
    }
  };

  // Effect to simulate sending messages
  useEffect(() => {
    let timeoutId: number;
    
    const sendNextMessage = () => {
      // Stop if we reached the end or if sending is paused/cancelled
      if (currentIndex >= contacts.length || !isSending || isPaused) {
        return;
      }
      
      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      if (success) {
        setStatus(prev => ({
          ...prev,
          sent: prev.sent + 1,
          pending: prev.pending - 1,
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          failed: prev.failed + 1,
          pending: prev.pending - 1,
        }));
      }
      
      setCurrentIndex(prev => prev + 1);
      
      // Schedule next message with a random delay (300-800ms)
      const delay = Math.floor(Math.random() * 500) + 300;
      timeoutId = window.setTimeout(sendNextMessage, delay);
    };
    
    // Start sending process if active
    if (isSending && !isPaused && currentIndex < contacts.length) {
      timeoutId = window.setTimeout(sendNextMessage, 500);
    }
    
    // Check if complete
    if (currentIndex >= contacts.length && isSending) {
      setIsSending(false);
      toast({
        title: "Envio concluído!",
        description: `${status.sent} mensagens enviadas, ${status.failed} falhas.`,
      });
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSending, isPaused, currentIndex, contacts, toast]);

  const getProgressColorClass = () => {
    if (!isSending && currentIndex === 0) return "bg-gray-300";
    if (status.failed > status.sent / 3) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Enviando Mensagens</CardTitle>
        <CardDescription>
          {contacts.length} contatos selecionados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
            indicatorClassName={getProgressColorClass()}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-100 p-3 rounded-md">
            <p className="text-xs text-green-800">Enviadas</p>
            <p className="text-lg font-bold text-green-700">{status.sent}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-md">
            <p className="text-xs text-red-800">Falhas</p>
            <p className="text-lg font-bold text-red-700">{status.failed}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-md">
            <p className="text-xs text-blue-800">Pendentes</p>
            <p className="text-lg font-bold text-blue-700">{status.pending}</p>
          </div>
        </div>
        
        {currentIndex < contacts.length && (
          <div className="bg-secondary p-3 rounded-lg">
            <h3 className="text-xs font-semibold mb-1">Enviando para:</h3>
            <p className="text-sm">
              {currentIndex < contacts.length ? (
                <>
                  <span className="font-medium">{contacts[currentIndex].name || "Sem nome"}</span>
                  <span className="text-gray-500 ml-1">
                    ({contacts[currentIndex].phone})
                  </span>
                </>
              ) : "Concluído"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {currentIndex >= contacts.length ? (
          <Button 
            onClick={onReset} 
            className="w-full"
          >
            Voltar ao início
          </Button>
        ) : (
          <>
            {!isSending ? (
              <Button 
                onClick={startSending} 
                className="w-full"
              >
                Iniciar Envio
              </Button>
            ) : (
              <div className="flex w-full gap-2">
                {!isPaused ? (
                  <Button 
                    onClick={pauseSending} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Pausar
                  </Button>
                ) : (
                  <Button 
                    onClick={startSending} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Continuar
                  </Button>
                )}
                <Button 
                  onClick={cancelSending} 
                  variant="destructive" 
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default SendingProgress;
