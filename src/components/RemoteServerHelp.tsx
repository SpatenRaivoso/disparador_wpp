
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface RemoteServerHelpProps {
  onCheckServer: () => void;
}

const RemoteServerHelp: React.FC<RemoteServerHelpProps> = ({ onCheckServer }) => {
  return (
    <Alert className="mb-4 bg-amber-50">
      <Info className="h-4 w-4" />
      <AlertDescription className="mt-2">
        <p className="font-bold mb-1">Para utilizar o WhatsApp real:</p>
        <ol className="list-decimal pl-4 space-y-1 text-sm">
          <li>Instale o servidor WPPConnect localmente:</li>
          <code className="block bg-gray-100 p-2 mb-2 text-xs rounded">
            npm i -g @wppconnect-team/wppconnect-server
          </code>
          <li>Execute o servidor na porta 8085:</li>
          <code className="block bg-gray-100 p-2 mb-2 text-xs rounded">
            npx wppconnect-server --port=8085 --cors
          </code>
          <li>Clique em "Tentar servidor local" após iniciar o servidor</li>
        </ol>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 text-xs" 
          onClick={onCheckServer}
        >
          Tentar servidor local
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default RemoteServerHelp;
