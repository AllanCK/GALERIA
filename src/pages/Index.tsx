// Update this page (the content is just a fallback if you fail to update the page)

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="text-center space-y-8 p-8">
        <div className="flex justify-center">
          <div className="p-6 bg-accent/10 rounded-3xl">
            <Palette className="h-20 w-20 text-accent" />
          </div>
        </div>
        <h1 className="text-6xl font-bold tracking-tight">Galeria de Arte</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Sistema completo de gerenciamento para galerias de arte
        </p>
        <Button 
          onClick={() => navigate('/auth')} 
          size="lg"
          className="bg-accent hover:bg-accent/90 text-lg px-8 py-6"
        >
          Acessar Sistema
        </Button>
      </div>
    </div>
  );
};

export default Index;
