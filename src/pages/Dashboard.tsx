import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Palette, Package, ShoppingCart, Cake } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    loadAniversariantes();
  }, []);

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const menuItems = [
    { title: 'Clientes', icon: Users, path: '/clientes', color: 'text-blue-600' },
    { title: 'Obras de Arte', icon: Palette, path: '/obras', color: 'text-purple-600' },
    { title: 'Produtos', icon: Package, path: '/produtos', color: 'text-green-600' },
    { title: 'Vendas', icon: ShoppingCart, path: '/vendas', color: 'text-accent' },
    { title: 'Aniversariantes', icon: Cake, path: '/aniversariantes', color: 'text-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Galeria de Arte</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {profile?.nome?.split(' ')[0]} ({profile?.tipo})
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        {aniversariantes.length > 0 && (
          <Card className="mb-8 border-accent/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Cake className="h-5 w-5" />
                Aniversariantes de Hoje 🎉
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aniversariantes.map((cliente) => (
                  <div key={cliente.id} className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <Card
              key={item.path}
              className="cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 group"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className={`p-4 bg-secondary rounded-2xl group-hover:scale-110 transition-transform ${item.color}`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-center">{item.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
