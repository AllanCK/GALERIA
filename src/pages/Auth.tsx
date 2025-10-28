import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { toast } from 'sonner';
import { Palette } from 'lucide-react';
import type { Obra } from '@/types/database';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'gerente' | 'vendedor'>('vendedor');
  const [loading, setLoading] = useState(false);
  const [obras, setObras] = useState<Obra[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadObras();
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselApi]);

  const loadObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .not('imagem_path', 'is', null)
        .limit(5);

      if (error) {
        console.error('Error loading obras:', error);
        throw error;
      }
      
      console.log('Obras carregadas:', data);
      setObras((data || []) as Obra[]);
    } catch (error) {
      console.error('Error loading obras:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error('Erro ao fazer login: ' + error.message);
        } else {
          toast.success('Login realizado com sucesso!');
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, nome, tipo);
        if (error) {
          toast.error('Erro ao criar conta: ' + error.message);
        } else {
          toast.success('Conta criada! Verifique seu email.');
        }
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="container max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Carousel Section */}
        <div className="hidden md:block">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-accent/10 rounded-3xl">
                <Palette className="h-12 w-12 text-accent" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-2">Galeria de Arte</h2>
            <p className="text-muted-foreground">Explore nossa coleção de obras exclusivas</p>
          </div>
          
          {obras.length > 0 ? (
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {obras.map((obra) => (
                  <CarouselItem key={obra.id}>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                      <img
                        src={obra.imagem_path || ''}
                        alt={obra.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', obra.imagem_path);
                          e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Obra+de+Arte';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <h3 className="text-white text-2xl font-bold">{obra.nome}</h3>
                        {obra.colecao && (
                          <p className="text-white/80 text-sm mt-1">Coleção: {obra.colecao}</p>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          ) : (
            <div className="text-center p-8 bg-secondary/20 rounded-xl">
              <p className="text-muted-foreground">Carregando obras de arte...</p>
            </div>
          )}
        </div>

        {/* Auth Form Section */}
        <Card className="w-full shadow-xl">
          <CardHeader className="space-y-1 text-center md:hidden">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-accent/10 rounded-2xl">
                <Palette className="h-8 w-8 text-accent" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Galeria de Arte</CardTitle>
            <CardDescription>
              {isLogin ? 'Entre com suas credenciais' : 'Crie sua conta'}
            </CardDescription>
          </CardHeader>
          <CardHeader className="space-y-1 text-center hidden md:block">
            <CardTitle className="text-3xl font-bold">
              {isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Entre com suas credenciais' : 'Preencha os dados abaixo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Usuário</Label>
                    <Select value={tipo} onValueChange={(value: 'gerente' | 'vendedor') => setTipo(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendedor">Vendedor</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
                {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-accent hover:underline"
              >
                {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
