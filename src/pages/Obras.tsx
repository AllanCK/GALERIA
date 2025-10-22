import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Obra, Cliente } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Pencil, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface ObraFormData {
  nome: string;
  numero_identificacao: string;
  colecao: string;
  certificado: string;
  status: 'cliente' | 'exposicao';
  cliente_id: string;
  imagem_path: string;
}

export default function Obras() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm<ObraFormData>();

  const status = watch('status');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    loadObras();
    loadClientes();
  }, []);

  const loadObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setObras((data || []) as Obra[]);
    } catch (error) {
      console.error('Error loading obras:', error);
      toast.error('Erro ao carregar obras de arte');
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `obras/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('galeria-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('galeria-assets')
        .getPublicUrl(filePath);

      setValue('imagem_path', publicUrl);
      setImagePreview(publicUrl);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: ObraFormData) => {
    try {
      const obraData = {
        nome: data.nome,
        numero_identificacao: data.numero_identificacao,
        colecao: data.colecao || null,
        certificado: data.certificado || null,
        status: data.status,
        cliente_id: data.status === 'cliente' ? parseInt(data.cliente_id) : null,
        imagem_path: data.imagem_path || null,
      };

      if (editingObra) {
        const { error } = await supabase
          .from('obras')
          .update(obraData)
          .eq('id', editingObra.id);
        
        if (error) throw error;
        toast.success('Obra atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('obras')
          .insert([obraData]);
        
        if (error) throw error;
        toast.success('Obra cadastrada com sucesso!');
      }

      setIsDialogOpen(false);
      reset();
      setEditingObra(null);
      setImagePreview(null);
      loadObras();
    } catch (error) {
      console.error('Error saving obra:', error);
      toast.error('Erro ao salvar obra de arte');
    }
  };

  const handleEdit = (obra: Obra) => {
    setEditingObra(obra);
    setValue('nome', obra.nome);
    setValue('numero_identificacao', obra.numero_identificacao);
    setValue('colecao', obra.colecao || '');
    setValue('certificado', obra.certificado || '');
    setValue('status', obra.status);
    setValue('cliente_id', obra.cliente_id?.toString() || '');
    setValue('imagem_path', obra.imagem_path || '');
    setImagePreview(obra.imagem_path);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta obra?')) return;

    try {
      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Obra excluída com sucesso!');
      loadObras();
    } catch (error) {
      console.error('Error deleting obra:', error);
      toast.error('Erro ao excluir obra');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingObra(null);
    setImagePreview(null);
    reset();
  };

  const getClienteNome = (clienteId: number | null) => {
    if (!clienteId) return '-';
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || '-';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-4xl font-bold tracking-tight">Obras de Arte</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingObra(null); reset(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingObra ? 'Editar Obra' : 'Nova Obra de Arte'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Obra *</Label>
                    <Input id="nome" {...register('nome', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_identificacao">Nº Identificação *</Label>
                    <Input id="numero_identificacao" {...register('numero_identificacao', { required: true })} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="colecao">Coleção</Label>
                    <Input id="colecao" {...register('colecao')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificado">Nº Certificado</Label>
                    <Input id="certificado" {...register('certificado')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Localização *</Label>
                  <Select onValueChange={(value) => setValue('status', value as 'cliente' | 'exposicao')} defaultValue={editingObra?.status || 'exposicao'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a localização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exposicao">Em Exposição</SelectItem>
                      <SelectItem value="cliente">Com Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === 'cliente' && (
                  <div className="space-y-2">
                    <Label htmlFor="cliente_id">Cliente *</Label>
                    <Select onValueChange={(value) => setValue('cliente_id', value)} defaultValue={editingObra?.cliente_id?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id.toString()}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Imagem da Obra</Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="flex-1"
                      />
                      {uploadingImage && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Upload className="h-4 w-4 animate-pulse" />
                          Enviando...
                        </div>
                      )}
                    </div>
                    
                    {imagePreview && (
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-secondary">
                        <img 
                          src={imagePreview} 
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploadingImage}>
                    {editingObra ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map((obra) => (
            <Card key={obra.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{obra.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {obra.numero_identificacao}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(obra)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(obra.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {obra.imagem_path ? (
                  <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-secondary">
                    <img 
                      src={obra.imagem_path} 
                      alt={obra.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square mb-4 rounded-lg bg-secondary flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  {obra.colecao && (
                    <div>
                      <span className="font-medium">Coleção:</span> {obra.colecao}
                    </div>
                  )}
                  {obra.certificado && (
                    <div>
                      <span className="font-medium">Certificado:</span> {obra.certificado}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Localização:</span>{' '}
                    {obra.status === 'exposicao' ? 'Em Exposição' : 'Com Cliente'}
                  </div>
                  {obra.status === 'cliente' && obra.cliente_id && (
                    <div>
                      <span className="font-medium">Cliente:</span> {getClienteNome(obra.cliente_id)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {obras.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma obra de arte cadastrada ainda.</p>
              <p className="text-sm mt-2">Clique em "Nova Obra" para começar.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
