import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Cake, Phone, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Aniversariantes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else {
      loadAniversariantes();
    }
  }, [user, loading, navigate]);

  const loadAniversariantes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('data_nascimento');
      
      if (error) throw error;
      
      const hoje = data?.filter(cliente => {
        const dataNasc = new Date(cliente.data_nascimento);
        const hoje = new Date();
        return dataNasc.getDate() === hoje.getDate() && 
               dataNasc.getMonth() === hoje.getMonth();
      }) || [];
      
      setAniversariantes(hoje);
    } catch (error) {
      console.error('Error loading birthdays:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Cake className="h-8 w-8 text-accent" />
              Aniversariantes de Hoje
            </h1>
            <p className="text-muted-foreground mt-2">
              {aniversariantes.length} {aniversariantes.length === 1 ? 'cliente fazendo' : 'clientes fazendo'} aniversário hoje 🎉
            </p>
          </div>
        </div>

        {aniversariantes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Cake className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">Nenhum aniversariante hoje</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aniversariantes.map((cliente) => (
              <Card key={cliente.id} className="hover:shadow-xl transition-all border-accent/20">
                <CardHeader className="bg-accent/5">
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <Cake className="h-5 w-5" />
                    {cliente.nome}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Data de Nascimento</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(cliente.data_nascimento), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                    </div>
                  </div>
                  
                  {cliente.endereco && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Endereço</p>
                        <p className="text-sm text-muted-foreground">{cliente.endereco}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
