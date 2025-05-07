
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Phone, RefreshCw, AlertTriangle, WifiOff, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RemoteServerHelp from './RemoteServerHelp';

interface WhatsAppConnectionProps {
  onConnected: (phoneNumber: string) => void;
}

// WhatsApp Web JS direct connection option
const LOCAL_SERVER_URL = 'http://localhost:8085';

const WhatsAppConnection = ({ onConnected }: WhatsAppConnectionProps) => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState<'local' | 'demo'>('local');
  const [showLocalServerInstructions, setShowLocalServerInstructions] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Create a unique session ID if it doesn't exist
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
      setSessionId(newSessionId);
    }
  }, [sessionId]);
  
  // Check initial local server availability
  useEffect(() => {
    checkLocalServer();
  }, []);
  
  // Poll for connection status
  const statusCheckIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Clean up interval on component unmount
      if (statusCheckIntervalRef.current) {
        window.clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);
  
  const checkLocalServer = async () => {
    try {
      const response = await fetch(`${LOCAL_SERVER_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setApiMode('local');
        setConnectionError(null);
        setShowLocalServerInstructions(false);
        
        toast({
          title: "Servidor local detectado",
          description: "Conexão com servidor WPPConnect estabelecida.",
        });
      } else {
        throw new Error('Local server returned an error');
      }
    } catch (error) {
      console.error("Local server check failed:", error);
      setApiMode('demo');
      setConnectionError('Servidor local não detectado. Use modo de demonstração ou inicie o servidor local.');
      setShowLocalServerInstructions(true);
    }
  };
  
  const checkConnectionStatus = async () => {
    if (!sessionId || apiMode === 'demo') return;
    
    try {
      const response = await fetch(`${LOCAL_SERVER_URL}/api/session/status/${sessionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to check connection status');
      
      const data = await response.json();
      if (data.status === 'CONNECTED' || data.connected) {
        // If connected, stop polling and notify
        if (statusCheckIntervalRef.current) {
          window.clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        
        setIsConnecting(false);
        setQrCodeData(null);
        
        // Get phone number information if available
        try {
          const infoResponse = await fetch(`${LOCAL_SERVER_URL}/api/session/phone-number/${sessionId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (infoResponse.ok) {
            const infoData = await infoResponse.json();
            const phoneNumber = infoData.number || "Conectado (Número não disponível)";
            onConnected(phoneNumber);
            
            toast({
              title: "WhatsApp conectado!",
              description: `Número conectado com sucesso.`,
              variant: "default",
            });
          } else {
            onConnected("Conectado");
          }
        } catch (error) {
          onConnected("Conectado");
        }
      }
    } catch (error) {
      console.error("Error checking connection status:", error);
      // We don't set error state here to avoid interrupting QR code display
    }
  };

  const initializeWhatsAppLocal = async () => {
    setIsInitializing(true);
    setConnectionError(null);
    setIsConnecting(true);
    
    try {
      // Try to start a new session
      const response = await fetch(`${LOCAL_SERVER_URL}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          webhook: null,
          waitQrCode: true
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize WhatsApp session: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.qrcode || data.qr) {
        setQrCodeData(data.qrcode || data.qr);
        
        // Start polling for connection status
        if (statusCheckIntervalRef.current) {
          window.clearInterval(statusCheckIntervalRef.current);
        }
        
        statusCheckIntervalRef.current = window.setInterval(() => checkConnectionStatus(), 3000);
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o código QR com seu WhatsApp para conectar.",
        });
        
        setIsInitializing(false);
      } else {
        throw new Error('QR code not received');
      }
    } catch (error) {
      console.error("Error initializing WhatsApp:", error);
      handleApiFailure();
    }
  };
  
  const handleApiFailure = () => {
    setConnectionError('Não foi possível conectar com o servidor local. Usando modo de demonstração ou verifique as instruções para iniciar o servidor.');
    setApiMode('demo');
    setIsInitializing(false);
    setShowLocalServerInstructions(true);
    
    toast({
      title: "Erro na conexão",
      description: "Servidor local indisponível. Usando modo de demonstração.",
      variant: "destructive",
    });
  };

  // For demo purposes when API is unavailable
  const simulateConnection = () => {
    setIsConnecting(true);
    setApiMode('demo');
    setConnectionError(null);
    
    // Generate a demo QR code
    const demoQrCode = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WhatsAppDemo";
    setQrCodeData(demoQrCode);
    
    setTimeout(() => {
      const mockPhoneNumber = "+55 11 98765-4321";
      setIsConnecting(false);
      setQrCodeData(null);
      onConnected(mockPhoneNumber);
      
      toast({
        title: "WhatsApp conectado! (Simulação)",
        description: `Número ${mockPhoneNumber} conectado com sucesso.`,
        variant: "default",
      });
    }, 3000);
  };

  const refreshQRCode = () => {
    // Clear any existing error state
    setConnectionError(null);
    
    if (apiMode === 'demo') {
      simulateConnection();
    } else {
      // Reinitialize the connection process
      initializeWhatsAppLocal();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Conecte seu WhatsApp</CardTitle>
        <CardDescription>
          Escaneie o QR Code com seu WhatsApp para começar a enviar mensagens
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {connectionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {connectionError} 
              {apiMode === 'demo' && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs" 
                    onClick={() => {
                      setApiMode('local');
                      setConnectionError(null);
                      checkLocalServer();
                    }}
                  >
                    Tentar servidor local novamente
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {showLocalServerInstructions && (
          <RemoteServerHelp onCheckServer={checkLocalServer} />
        )}
        
        {apiMode === 'local' && !connectionError && !showLocalServerInstructions && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Conectando com o servidor WPPConnect local. Se encontrar problemas, verifique se o servidor está rodando.
            </AlertDescription>
          </Alert>
        )}
        
        {!qrCodeData ? (
          <div className="p-8 text-center">
            <p className="mb-4 text-gray-600">
              {apiMode === 'demo' ? 
                "Modo de demonstração ativado. Clique abaixo para simular uma conexão." : 
                "Clique no botão abaixo para gerar um código QR e conectar seu WhatsApp."
              }
            </p>
            
            <div className="flex flex-col space-y-2">
              {apiMode === 'local' ? (
                <Button 
                  onClick={initializeWhatsAppLocal} 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isInitializing}
                >
                  {isInitializing ? "Gerando QR Code..." : "Gerar QR Code"}
                </Button>
              ) : (
                <Button 
                  onClick={simulateConnection}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simular Conexão
                </Button>
              )}
            </div>
            
            {apiMode === 'local' && (
              <div className="mt-4 text-xs text-gray-500">
                <p className="flex items-center justify-center">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Se estiver com problemas de conexão, use o modo de demonstração
                </p>
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto mt-1" 
                  onClick={() => {
                    setApiMode('demo');
                    setConnectionError(null);
                  }}
                >
                  Mudar para modo de demonstração
                </Button>
              </div>
            )}
            
            {apiMode === 'demo' && !showLocalServerInstructions && (
              <div className="mt-4 text-xs text-gray-500">
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto" 
                  onClick={() => setShowLocalServerInstructions(true)}
                >
                  Ver instruções para conexão real
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative border border-gray-200 p-4 rounded-lg bg-white">
              {apiMode === 'local' ? (
                <QRCodeSVG 
                  value={qrCodeData} 
                  size={256}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1Ij48cGF0aCBmaWxsPSIjMjVEMzY2IiBkPSJNNDUsMjIuNUMzMy43LDMzLjgsMTEuMywzMy44LDAsMjIuNVMxMS4zLDExLjMsMjIuNSwwUzQ1LDExLjMsNDUsMjIuNSIvPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0zNiwxNS42Yy0xLjUtMS41LTMuNC0yLjYtNS42LTMuMmMtMi4yLTAuNi00LjUtMC43LTYuOC0wLjJjLTIuMiwwLjUtNC4yLDEuNi01LjksMy4xYy0xLjcsMS41LTMsLTIuMi0zLjcsNWMtMC43LDIuMi0wLjksNC42LTAuNCw2LjljMC41LDIuMywxLjYsNC40LDMuMSw2LjJjMS41LDEuOCwzLjQsMy4xLDUuNiwzLjljMi4yLDAuOCw0LjUsMSw2LjgsMC42YzIuMy0wLjQsNC40LTEuNCw2LjItM2MxLjctMS42LDMtMy42LDMuNi01LjljMC42LTIuMywwLjctNC43LDAuMS02LjlDMzkuMSwxOS4yLDM3LjgsMTcuMSwzNiwxNS42eiBNMzMuOCwzMC41Yy0xLjQsMS40LTMuMSwyLjQtNSwyLjljLTEuOSwwLjUtNCwwLjUtNS45LTAuMWMtMS45LTAuNS0zLjctMS41LTUuMi0yLjlzLTIuNi0zLjEtMy4yLTVjLTAuNi0xLjktMC42LTMuOSwwLTUuOGMwLjUtMS45LDEuNi0zLjcsMS0zLjlzLTAuMywwLjEsMiwwLjVjMi4zLDAuNCwzLjgsMC4zLDUuNi0wLjRjMS44LTAuNywzLjMsMy4yLDQuNCw0LjhjMS4xLDEuNiwxLjcsMy42LDEuNyw1LjZDMzYsMjYuOSwzNS4yLDI4LjksMzMuOCwzMC41eiIvPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0zMSwyMi43YzAsMC41LTAuMSwxLjEtMC4yLDEuNmwtMS4zLTAuMmMwLTAuNCwwLjEtMC44LDAuMS0xLjNjMC0wLjQsMC0wLjktMC4xLTEuM2wwLDBsMS4zLTAuMmMwLjEsMC41LDAuMiwxLjEsMC4yLDEuNlYyMi43eiIvPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0yOS40LDE4LjFsLTEuMSwwLjdjLTAuMy0wLjQtMC41LTAuOS0wLjktMS4yYy0wLjMtMC4zLTAuNy0wLjctMS4xLTAuOWwwLjctMS4xYzAuNCwwLjMsMC45LDAuNiwxLjMsMVMyOSwxNy42LDI5LjQsMTguMXoiLz48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMjYsMTUuN2wtMC40LDEuM2MtMC45LTAuMy0xLjktMC41LTIuOS0wLjV2LTEuM0MyMy44LDE1LjEsMjUsMTUuMywyNiwxNS43eiIvPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0yMywxNy43Yy0wLjUsMC0wLjksMC4xLTEuMywwLjFjLTAuNCwwLjEtMC45LDAuMi0xLjMsMC4zbC0wLjQtMS4zYzAuNS0wLjIsMS0wLjMsMS41LTAuNGMwLjUtMC4xLDEtMC4yLDEuNi0wLjJWMTcuN3oiLz48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTguNywxOC40Yy0wLjQsMC4zLTAuOCwwLjYtMS4xLDAuOWMtMC4zLDAuMy0wLjYsMC43LTAuOSwxLjFsLTEuMS0wLjdjMC4zLTAuNCwwLjYtMC45LDEtMS4zYzAuNC0wLjQsMC45LTAuOCwxLjQtMS4xTDE4LjcsMTguNHoiLz48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTUuNSwyMS45Yy0wLjIsMC45LTAuNCwxLjgtMC4zLDIuN2gtMS4zYy0wLjEtMS4xLDAuMS0yLjIsMC40LTMuMkwxNS41LDIxLjl6Ii8+PHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTE2LDI2LjhjLTAuMS0wLjUtMC4yLTAuOS0wLjItMS40YzAtMC40LTAuMS0wLjktMC4xLTEuM2wxLjMtMC4xYzAsMC41LDAuMSwxLDAuMSwxLjRjMCwwLjUsMC4xLDEsMC4yLDEuNEwxNiwyNi44eiIvPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNy44LDI5bC0wLjgsMXYwYy0wLjQtMC4zLTAuNy0wLjYtMS0xYy0wLjMtMC40LTAuNi0wLjgtMC44LTEuMmwxLjItMC41YzAuMiwwLjQsMC40LDAuNywwLjYsMC45QzE3LjMsMjguNSwxNy42LDI4LjgsMTcuOCwyOXoiLz48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMjEuNywzMC42bDAuMS0wLjFjLTAuOS0wLjItMS44LTAuNi0yLjctMS4xbDAuNi0xLjJjMC44LDAuNCwxLjYsMC44LDIuNCwxYzAuMywwLjEsMC42LDAuMSwwLjksMC4ydjEuM2MtMC4yLDAtMC41LDAtMC43LDBDMJBI>",
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              ) : (
                <img 
                  src={qrCodeData} 
                  alt="WhatsApp QR Code" 
                  className="w-64 h-64"
                />
              )}
            </div>
            
            <div className="text-sm text-gray-600 mb-4 mt-4 text-center">
              <p className="mb-2">Abra o WhatsApp no seu celular e escaneie o código QR</p>
              <p className="text-xs text-gray-500">
                {apiMode === 'local' ? 
                  "O código expira em 60 segundos" : 
                  "Este é um QR Code de demonstração"}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 items-center w-full">
              <Button
                onClick={refreshQRCode}
                disabled={isInitializing}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} />
                Atualizar QR Code
              </Button>
              
              {apiMode === 'local' ? (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setApiMode('demo');
                    simulateConnection();
                  }}
                  className="text-sm"
                >
                  Mudar para modo de demonstração
                </Button>
              ) : (
                <Button
                  onClick={simulateConnection}
                  disabled={isConnecting}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {isConnecting ? "Conectando..." : "Simular Conexão"}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-gray-500">
        <p>Mantenha seu celular conectado e com acesso à internet</p>
      </CardFooter>
    </Card>
  );
};

export default WhatsAppConnection;
