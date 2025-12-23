import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  Share2, 
  Copy,
  Check,
  TrendingUp,
  ShoppingCart,
  Package,
  Star,
  Users,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, getWeekSales, getMonthSales } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type PostType = 'ventas' | 'producto' | 'promocion' | 'logro' | 'agradecimiento';

export const PostsRedes: React.FC = () => {
  const { data } = useApp();
  const { sales, products, clients, settings } = data;

  const [selectedType, setSelectedType] = useState<PostType>('ventas');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [regenerateKey, setRegenerateKey] = useState(0);

  const weekSales = useMemo(() => getWeekSales(sales), [sales]);
  const monthSales = useMemo(() => getMonthSales(sales), [sales]);
  const weekTotal = weekSales.reduce((sum, s) => sum + s.amount, 0);
  const monthTotal = monthSales.reduce((sum, s) => sum + s.amount, 0);
  const customerCount = clients.filter(c => c.type === 'cliente').length;

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Random variations for posts
  const variations = useMemo(() => {
    const emojis = ['🎉', '✨', '🔥', '💪', '🙌', '⭐', '🎊', '💫'];
    const greetings = ['¡Hola!', '¡Saludos!', '¡Buenos días!', '¡Feliz día!'];
    const closings = ['¡Los esperamos!', '¡Te esperamos!', '¡Visítanos!', '¡No te lo pierdas!'];
    const thanks = ['¡Gracias!', '¡Mil gracias!', '¡Agradecidos!', '¡Bendiciones!'];
    
    return {
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      greeting: greetings[Math.floor(Math.random() * greetings.length)],
      closing: closings[Math.floor(Math.random() * closings.length)],
      thanks: thanks[Math.floor(Math.random() * thanks.length)],
    };
  }, [regenerateKey]);

  const businessName = settings.businessName || 'Nuestro Negocio';

  const generatePost = (): string => {
    switch (selectedType) {
      case 'ventas':
        return `📊 ¡Semana exitosa en ${businessName}! ${variations.emoji}

💰 Ventas de la semana: ${formatCurrency(weekTotal, settings.currencySymbol)}
📈 Ventas del mes: ${formatCurrency(monthTotal, settings.currencySymbol)}
🛒 ${weekSales.length} transacciones esta semana
${customerCount > 0 ? `👥 ${customerCount} clientes satisfechos` : ''}

${variations.thanks} Por su preferencia 🙏

#Negocio #Emprendimiento #Ventas #Exito #Cuba`;

      case 'producto':
        if (!selectedProduct) return 'Selecciona un producto primero';
        const discount = Math.floor(Math.random() * 15) + 5;
        return `${variations.emoji} ¡Producto destacado! ${variations.emoji}

📦 ${selectedProduct.name}
💵 Precio: ${formatCurrency(selectedProduct.price, settings.currencySymbol)}
${selectedProduct.quantity > 10 ? `✅ ¡En stock!` : selectedProduct.quantity > 0 ? `⚠️ ¡Últimas ${selectedProduct.quantity} unidades!` : '❌ Agotado'}

${variations.greeting} ${variations.closing}

📍 ${businessName}
${settings.businessPhone ? `📱 ${settings.businessPhone}` : ''}

#${selectedProduct.category?.replace(/\s/g, '') || 'Producto'} #Oferta #Disponible`;

      case 'promocion':
        const promoProducts = products.filter(p => p.quantity > 0).slice(0, 4);
        if (promoProducts.length === 0) return 'Agrega productos al inventario primero';
        return `🔥 ¡OFERTAS ESPECIALES! 🔥

${variations.greeting} En ${businessName} tenemos para ti:

${promoProducts.map(p => `▶️ ${p.name} - ${formatCurrency(p.price, settings.currencySymbol)}`).join('\n')}

📍 ${businessName}
${settings.businessPhone ? `📱 Contáctanos: ${settings.businessPhone}` : '📱 Contáctanos para más información'}

${variations.closing} 🎉

#Oferta #Promocion #Descuento #Ahorro #Cuba`;

      case 'logro':
        return `🏆 ¡Celebramos con ustedes! 🏆

${variations.greeting} Este mes en ${businessName}:

📊 ${monthSales.length} ventas realizadas
${customerCount > 0 ? `👥 ${customerCount} clientes en nuestra familia` : ''}
📦 ${products.length} productos disponibles
💰 ${formatCurrency(monthTotal, settings.currencySymbol)} en ventas

💪 Su apoyo nos impulsa a mejorar cada día.

${variations.thanks} Por confiar en nosotros ❤️

#Logro #Gracias #Clientes #Comunidad #Emprendimiento`;

      case 'agradecimiento':
        const randomClient = clients.filter(c => c.type === 'cliente')[
          Math.floor(Math.random() * clients.filter(c => c.type === 'cliente').length)
        ];
        return `❤️ ¡GRACIAS! ❤️

${variations.greeting}

Queremos agradecer a todos nuestros clientes por su preferencia y confianza.
${randomClient ? `\nUn saludo especial a ${randomClient.name} y a todos los que nos visitan.` : ''}

En ${businessName} trabajamos cada día para ofrecerles lo mejor.

${variations.thanks} 🙏

${settings.businessPhone ? `📱 ${settings.businessPhone}` : ''}

#Gracias #Clientes #Familia #${businessName.replace(/\s/g, '')}`;

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
        description: 'Pega el texto en tu red social favorita',
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

  const handleRegenerate = () => {
    setRegenerateKey(prev => prev + 1);
    toast({
      title: 'Regenerado',
      description: 'Se ha generado una nueva variación',
    });
  };

  const postTypes = [
    { value: 'ventas', label: 'Resumen ventas', icon: TrendingUp },
    { value: 'producto', label: 'Producto', icon: Package },
    { value: 'promocion', label: 'Promoción', icon: Star },
    { value: 'logro', label: 'Logro', icon: ShoppingCart },
    { value: 'agradecimiento', label: 'Gracias', icon: Users },
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
          Genera contenido automático basado en tus datos reales
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Options */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border">
            <h3 className="font-semibold mb-4">Tipo de publicación</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value as PostType)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center',
                    selectedType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <type.icon className={cn(
                    'w-5 h-5',
                    selectedType === type.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className="text-xs font-medium">{type.label}</span>
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
                          {formatCurrency(product.price, settings.currencySymbol)} • Stock: {product.quantity}
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
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerate}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
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
                      <Check className="w-4 h-4 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="bg-muted rounded-xl p-4 whitespace-pre-wrap text-sm min-h-[200px]">
              {postContent}
            </div>
          </div>

          <div className="bg-info/5 border border-info/20 rounded-2xl p-4">
            <h4 className="font-medium text-info mb-2">💡 Consejos</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Mejores horarios: 9-11am y 7-9pm</li>
              <li>• Añade fotos reales de tus productos</li>
              <li>• Responde rápido a los comentarios</li>
              <li>• Usa el botón regenerar para variaciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsRedes;
