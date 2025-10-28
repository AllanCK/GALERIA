import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Cliente, Obra, Produto, Venda } from '@/types/database';

const Vendas = () => {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [obrasDisponiveis, setObrasDisponiveis] = useState<Obra[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [clienteOpen, setClienteOpen] = useState(false);
  const [clienteValue, setClienteValue] = useState('');
  const [tipoItem, setTipoItem] = useState<'obra' | 'produto'>('obra');
  const [itemOpen, setItemOpen] = useState(false);
  const [itemValue, setItemValue] = useState('');
  const [valorTotal, setValorTotal] = useState('');

  useEffect(() => {
    checkAuth();
    loadVendas();
    loadClientes();
    loadTodasObras();
    loadObrasDisponiveis();
    loadProdutos();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const loadVendas = async () => {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .order('data_venda', { ascending: false });

      if (error) throw error;
      setVendas((data || []) as Venda[]);
    } catch (error) {
      console.error('Error loading vendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const loadTodasObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .order('nome');

      if (error) throw error;
      setObras((data || []) as Obra[]);
    } catch (error) {
      console.error('Error loading obras:', error);
    }
  };

  const loadObrasDisponiveis = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('status', 'exposicao')
        .order('nome');

      if (error) throw error;
      setObrasDisponiveis((data || []) as Obra[]);
    } catch (error) {
      console.error('Error loading obras disponiveis:', error);
    }
  };

  const loadProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .gt('quantidade_estoque', 0)
        .order('nome');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Error loading produtos:', error);
    }
  };

  const handleSubmit = async () => {
    if (!clienteValue || !itemValue || !valorTotal) {
      toast.error('Preencha todos os campos');
      return;
    }

    const selectedCliente = clientes.find(c => c.id === parseInt(clienteValue));
    if (!selectedCliente) {
      toast.error('Cliente inválido');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      // Inserir venda
      const { error: vendaError } = await supabase
        .from('vendas')
        .insert({
          cliente_id: selectedCliente.id,
          vendedor_auth_id: session.user.id,
          tipo_item: tipoItem,
          item_id: parseInt(itemValue),
          valor_total: parseFloat(valorTotal),
          data_venda: new Date().toISOString()
        });

      if (vendaError) throw vendaError;

      // Atualizar obra ou produto
      if (tipoItem === 'obra') {
        const { error: obraError } = await supabase
          .from('obras')
          .update({
            status: 'cliente',
            cliente_id: selectedCliente.id
          })
          .eq('id', parseInt(itemValue));

        if (obraError) throw obraError;
      } else {
        const produto = produtos.find(p => p.id === parseInt(itemValue));
        if (produto) {
          const { error: produtoError } = await supabase
            .from('produtos')
            .update({
              quantidade_estoque: produto.quantidade_estoque - 1
            })
            .eq('id', parseInt(itemValue));

          if (produtoError) throw produtoError;
        }
      }

      toast.success('Venda registrada com sucesso!');
      setDialogOpen(false);
      resetForm();
      loadVendas();
      loadTodasObras();
      loadObrasDisponiveis();
      loadProdutos();
    } catch (error) {
      console.error('Error saving venda:', error);
      toast.error('Erro ao registrar venda');
    }
  };

  const resetForm = () => {
    setClienteValue('');
    setTipoItem('obra');
    setItemValue('');
    setValorTotal('');
  };

  const getClienteNome = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || 'N/A';
  };

  const getItemNome = (tipoItem: string, itemId: number) => {
    if (tipoItem === 'obra') {
      const obra = obras.find(o => o.id === itemId);
      return obra?.nome || 'N/A';
    } else {
      const produto = produtos.find(p => p.id === itemId);
      return produto?.nome || 'N/A';
    }
  };

  const selectedCliente = clientes.find(c => c.id === parseInt(clienteValue));
  const availableItems = tipoItem === 'obra' ? obrasDisponiveis : produtos;
  const selectedItem = availableItems.find(i => i.id === parseInt(itemValue));

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Vendas</h1>
            <p className="text-muted-foreground">Registre e gerencie vendas de obras e produtos</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6">
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nova Venda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={clienteOpen}
                      className="w-full justify-between"
                    >
                      {selectedCliente ? selectedCliente.nome : "Selecione o cliente..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {clientes.map((cliente) => (
                            <CommandItem
                              key={cliente.id}
                              value={cliente.nome}
                              onSelect={() => {
                                setClienteValue(cliente.id.toString());
                                setClienteOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  clienteValue === cliente.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {cliente.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Item</Label>
                <Select value={tipoItem} onValueChange={(value: 'obra' | 'produto') => {
                  setTipoItem(value);
                  setItemValue('');
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obra">Obra de Arte</SelectItem>
                    <SelectItem value="produto">Produto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{tipoItem === 'obra' ? 'Obra de Arte' : 'Produto'}</Label>
                <Popover open={itemOpen} onOpenChange={setItemOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={itemOpen}
                      className="w-full justify-between"
                    >
                      {selectedItem ? selectedItem.nome : `Selecione ${tipoItem === 'obra' ? 'a obra' : 'o produto'}...`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={`Buscar ${tipoItem === 'obra' ? 'obra' : 'produto'}...`} />
                      <CommandList>
                        <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
                        <CommandGroup>
                          {availableItems.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.nome}
                              onSelect={() => {
                                setItemValue(item.id.toString());
                                setItemOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  itemValue === item.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.nome}
                              {tipoItem === 'produto' && 'quantidade_estoque' in item && (
                                <span className="ml-2 text-muted-foreground text-sm">
                                  (Estoque: {item.quantidade_estoque})
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor Total (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  Registrar Venda
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma venda registrada
                  </TableCell>
                </TableRow>
              ) : (
                vendas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell>{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{getClienteNome(venda.cliente_id)}</TableCell>
                    <TableCell className="capitalize">{venda.tipo_item}</TableCell>
                    <TableCell>{getItemNome(venda.tipo_item, venda.item_id)}</TableCell>
                    <TableCell>R$ {venda.valor_total.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Vendas;
