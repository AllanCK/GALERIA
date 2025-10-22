import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Produto } from "@/types/database";
import type { Tables } from "@/integrations/supabase/types";

type Obra = Tables<"obras">;

const Produtos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    nome: "",
    tipo_produto: "",
    obra_id: "",
    quantidade_estoque: "0",
    valor: "",
    imagem_path: "",
  });

  useEffect(() => {
    checkAuth();
    fetchProdutos();
    fetchObras();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchObras = async () => {
    try {
      const { data, error } = await supabase
        .from("obras")
        .select("*")
        .order("nome");

      if (error) throw error;
      setObras(data || []);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("galeria-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("galeria-assets")
        .getPublicUrl(filePath);

      setFormData({ ...formData, imagem_path: publicUrl });
      setImagePreview(publicUrl);

      toast({
        title: "Imagem enviada",
        description: "A imagem foi enviada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const produtoData = {
        nome: formData.nome,
        tipo_produto: formData.tipo_produto || null,
        obra_id: formData.obra_id ? parseInt(formData.obra_id) : null,
        quantidade_estoque: parseInt(formData.quantidade_estoque) || 0,
        valor: parseFloat(formData.valor) || 0,
        imagem_path: formData.imagem_path || null,
      };

      if (editingProduto) {
        const { error } = await supabase
          .from("produtos")
          .update(produtoData)
          .eq("id", editingProduto.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado",
          description: "As informações do produto foram atualizadas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("produtos")
          .insert([produtoData]);

        if (error) throw error;

        toast({
          title: "Produto cadastrado",
          description: "O produto foi cadastrado com sucesso.",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro ao salvar produto",
        description: "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      tipo_produto: produto.tipo_produto || "",
      obra_id: produto.obra_id?.toString() || "",
      quantidade_estoque: produto.quantidade_estoque.toString(),
      valor: produto.valor.toString(),
      imagem_path: produto.imagem_path || "",
    });
    setImagePreview(produto.imagem_path || "");
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });

      fetchProdutos();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo_produto: "",
      obra_id: "",
      quantidade_estoque: "0",
      valor: "",
      imagem_path: "",
    });
    setEditingProduto(null);
    setImagePreview("");
  };

  const getObraNome = (obraId: number | null) => {
    if (!obraId) return "Sem obra";
    const obra = obras.find((o) => o.id === obraId);
    return obra ? obra.nome : "Obra não encontrada";
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Produtos</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduto ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tipo_produto">Tipo do Produto</Label>
                  <Input
                    id="tipo_produto"
                    value={formData.tipo_produto}
                    onChange={(e) => setFormData({ ...formData, tipo_produto: e.target.value })}
                    placeholder="Ex: Impressão, Moldura, Postal..."
                  />
                </div>

                <div>
                  <Label htmlFor="obra_id">Obra de Arte Associada</Label>
                  <Select
                    value={formData.obra_id}
                    onValueChange={(value) => setFormData({ ...formData, obra_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma obra (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem obra associada</SelectItem>
                      {obras.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id.toString()}>
                          {obra.nome} ({obra.numero_identificacao})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantidade_estoque">Quantidade em Estoque</Label>
                  <Input
                    id="quantidade_estoque"
                    type="number"
                    min="0"
                    value={formData.quantidade_estoque}
                    onChange={(e) => setFormData({ ...formData, quantidade_estoque: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="valor">Valor de Venda (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="imagem">Imagem do Produto</Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        id="imagem"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingImage}
                        onClick={() => document.getElementById("imagem")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? "Enviando..." : "Upload"}
                      </Button>
                    </div>

                    {imagePreview && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduto ? "Atualizar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Obra Associada</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum produto cadastrado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell>
                        {produto.imagem_path ? (
                          <img
                            src={produto.imagem_path}
                            alt={produto.nome}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            Sem imagem
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{produto.tipo_produto || "-"}</TableCell>
                      <TableCell>{getObraNome(produto.obra_id)}</TableCell>
                      <TableCell>{produto.quantidade_estoque}</TableCell>
                      <TableCell>R$ {produto.valor.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(produto)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(produto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Produtos;
