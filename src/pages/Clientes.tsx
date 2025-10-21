import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Clientes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    data_nascimento: '',
    telefone: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else {
      loadClientes();
    }
  }, [user, loading, navigate]);

  const loadClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');
    
    if (error) {
      toast.error('Erro ao carregar clientes');
    } else {
      setClientes(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const { error } = await supabase
        .from('clientes')
        .update(formData)
        .eq('id', editingId);
      
      if (error) {
        toast.error('Erro ao atualizar cliente');
      } else {
        toast.success('Cliente atualizado!');
        resetForm();
        loadClientes();
      }
    } else {
      const { error } = await supabase
        .from('clientes')
        .insert([formData]);
      
      if (error) {
        toast.error('Erro ao criar cliente');
      } else {
        toast.success('Cliente criado!');
        resetForm();
        loadClientes();
      }
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData({
      nome: cliente.nome,
      endereco: cliente.endereco,
      data_nascimento: cliente.data_nascimento,
      telefone: cliente.telefone,
    });
    setEditingId(cliente.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error('Erro ao excluir cliente');
      } else {
        toast.success('Cliente excluído!');
        loadClientes();
      }
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', endereco: '', data_nascimento: '', telefone: '' });
    setEditingId(null);
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">Clientes</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{cliente.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{cliente.endereco}</p>
                <p className="text-sm">
                  <span className="font-medium">Nascimento:</span>{' '}
                  {format(new Date(cliente.data_nascimento), 'dd/MM/yyyy')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Telefone:</span> {cliente.telefone}
                </p>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(cliente.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
