
import { useState } from 'react';
import WhatsAppConnection from "@/components/WhatsAppConnection";
import ContactUpload from "@/components/ContactUpload";
import MessageComposer from "@/components/MessageComposer";
import SendingProgress from "@/components/SendingProgress";
import { Toaster } from "@/components/ui/toaster";

interface Contact {
  phone: string;
  name?: string;
}

enum Step {
  Connect = 1,
  UploadContacts,
  ComposeMessage,
  SendMessages
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Connect);
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  // Step handlers
  const handleConnected = (phoneNumber: string) => {
    setConnectedNumber(phoneNumber);
    setCurrentStep(Step.UploadContacts);
  };

  const handleContactsLoaded = (loadedContacts: Contact[]) => {
    setContacts(loadedContacts);
    setCurrentStep(Step.ComposeMessage);
  };

  const handleMessageReady = (composedMessage: string, selectedImage: File | null) => {
    setMessage(composedMessage);
    setImage(selectedImage);
    setCurrentStep(Step.SendMessages);
  };

  const handleComplete = () => {
    // Do any cleanup or final steps here
  };

  const resetFlow = () => {
    setCurrentStep(Step.Connect);
    setConnectedNumber(null);
    setContacts([]);
    setMessage("");
    setImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto py-8 px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            WhatsApp Mass Sender
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Envie mensagens em massa para seus contatos de forma simples e rápida
          </p>
        </header>

        {/* Step indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[Step.Connect, Step.UploadContacts, Step.ComposeMessage, Step.SendMessages].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step 
                      ? "step-active"
                      : currentStep > step 
                      ? "step-completed"
                      : "step-pending"
                  }`}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                {step < Step.SendMessages && (
                  <div className={`w-12 h-1 ${
                    currentStep > step 
                      ? "bg-green-500" 
                      : "bg-gray-200"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Connected status */}
        {connectedNumber && (
          <div className="bg-green-100 text-green-800 text-sm rounded-md p-2 mb-6 mx-auto max-w-md flex items-center justify-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            WhatsApp conectado: {connectedNumber}
          </div>
        )}

        {/* Step content */}
        {currentStep === Step.Connect && (
          <WhatsAppConnection onConnected={handleConnected} />
        )}

        {currentStep === Step.UploadContacts && (
          <ContactUpload onContactsLoaded={handleContactsLoaded} />
        )}

        {currentStep === Step.ComposeMessage && (
          <MessageComposer onMessageReady={handleMessageReady} />
        )}

        {currentStep === Step.SendMessages && (
          <SendingProgress 
            contacts={contacts} 
            message={message} 
            image={image} 
            onComplete={handleComplete}
            onReset={resetFlow}
          />
        )}

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Desenvolvido para envio de campanhas promocionais via WhatsApp</p>
          <p className="text-xs mt-1">Use com responsabilidade e respeite as políticas do WhatsApp</p>
        </footer>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
