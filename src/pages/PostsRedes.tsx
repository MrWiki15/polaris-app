import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  Share2, 
  Copy,
  Check,
  TrendingUp,
  ShoppingCart,
  Package,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, getWeekSales, getMonthSales, getLowStockProducts } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type PostType = 'ventas' | 'producto' | 'promocion' | 'logro';

export const PostsRedes: React.FC = () => {
  const { data } = useApp();
  const { sales, products, settings } = data;

  const [selectedType, setSelectedType] = useState<PostType>('ventas');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const weekSales = useMemo(() => getWeekSales(sales), [sales]);
  const monthSales = useMemo(() => getMonthSales(sales), [sales]);
  const weekTotal = weekSales.reduce((sum, s) => sum + s.amount, 0);
  const monthTotal = monthSales.reduce((sum, s) => sum + s.amount, 0);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const generatePost = (): string => {
    const businessName = settings.businessName || 'Nuestro Negocio';
    
    switch (selectedType) {
      case 'ventas':
        return `📊 ¡Semana exitosa en ${businessName}!

💰 Ventas de la semana: ${formatCurrency(weekTotal, settings.currencySymbol)}
📈 Ventas del mes: ${formatCurrency(monthTotal, settings.currencySymbol)}
🛒 ${weekSales.length} transacciones esta semana

¡Gracias por su preferencia! 🙏

#Negocio #Emprendimiento #Ventas #Exito`;

      case 'producto':
        if (!selectedProduct) return 'Selecciona un producto primero';
        return `✨ ¡Producto destacado! ✨

📦 ${selectedProduct.name}
💵 Precio: ${formatCurrency(selectedProduct.price, settings.currencySymbol)}
${selectedProduct.quantity > 0 ? `✅ ¡En stock! (${selectedProduct.quantity} disponibles)` : '⚠️ Últimas unidades'}

¡Visítanos en ${businessName}!

#Producto #Oferta #Disponible #${selectedProduct.category || 'Tienda'}`;

      case 'promocion':
        const topProducts = products.slice(0, 3);
        return `🔥 ¡OFERTAS ESPECIALES! 🔥

${topProducts.map(p => `▶️ ${p.name} - ${formatCurrency(p.price, settings.currencySymbol)}`).join('\n')}

📍 ${businessName}
📱 Contáctanos para más información

¡Te esperamos! 🎉

#Oferta #Promocion #Descuento #Ahorro`;

      case 'logro':
        return `🏆 ¡Celebramos con ustedes! 🏆

📊 Este mes en ${businessName}:
• ${monthSales.length} clientes satisfechos
• ${products.length} productos en catálogo
• ¡Seguimos creciendo gracias a ti!

💪 Su apoyo nos impulsa a mejorar cada día.

¡Gracias por confiar en nosotros! ❤️

#Logro #Gracias #Clientes #Comunidad`;

      default:
        return '';
    }
  };

  const postContent = generatePost();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postContent);
      setCopied(true);
      toast({
        title: '¡Copiado!',
        description: 'El texto se ha copiado al portapapeles',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el texto',
        variant: 'destructive',
      });
    }
  };

  const postTypes = [
    { value: 'ventas', label: 'Resumen de ventas', icon: TrendingUp },
    { value: 'producto', label: 'Producto destacado', icon: Package },
    { value: 'promocion', label: 'Promoción', icon: Star },
    { value: 'logro', label: 'Logro/Celebración', icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 sm:p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Posts para Redes</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Genera contenido para promocionar tu negocio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Options */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <h3 className="font-semibold mb-4">Tipo de publicación</h3>
            <div className="grid grid-cols-2 gap-2">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value as PostType)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
                    selectedType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <type.icon className={cn(
                    'w-5 h-5',
                    selectedType === type.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Selection for producto type */}
          {selectedType === 'producto' && (
            <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
              <h3 className="font-semibold mb-4">Selecciona un producto</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {products.length > 0 ? (
                  products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-xl transition-all text-left',
                        selectedProductId === product.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                      )}
                    >
                      <div>
                        <span className="font-medium text-sm">{product.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatCurrency(product.price, settings.currencySymbol)}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay productos en el inventario
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Vista previa</h3>
              <Button
                size="sm"
                onClick={handleCopy}
                className={cn(
                  'transition-all',
                  copied ? 'bg-success hover:bg-success' : ''
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-muted rounded-xl p-4 whitespace-pre-wrap text-sm min-h-[200px]">
              {postContent}
            </div>
          </div>

          <div className="bg-info/5 border border-info/20 rounded-2xl p-4">
            <h4 className="font-medium text-info mb-2">💡 Consejos</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Publica en horarios de alta actividad (9-11am, 7-9pm)</li>
              <li>• Añade fotos reales de tus productos</li>
              <li>• Responde rápido a los comentarios</li>
              <li>• Usa historias para mostrar el día a día</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsRedes;
