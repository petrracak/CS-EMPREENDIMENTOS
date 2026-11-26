import {
  AirVent,
  ArrowUpDown,
  Baby,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  CookingPot,
  Dog,
  Droplets,
  Dumbbell,
  Fence,
  Flame,
  Home,
  KeyRound,
  Landmark,
  LayoutGrid,
  MapPin,
  Mountain,
  ShieldCheck,
  ShoppingCart,
  Sofa,
  Sparkles,
  Sun,
  Trees,
  Ruler,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * O ícone de cada linha de característica, diferencial ou ficha técnica,
 * escolhido pelas palavras do texto. A CS escreve como sempre ("Garagem
 * coberta para 2 carros") e o ícone vem sozinho (um carro). Sem palavra
 * conhecida, um brilho neutro.
 *
 * A ordem importa: a primeira regra que bate vence. "Suíte com banheiro"
 * é quarto, não banheiro.
 */
const REGRAS: [RegExp, LucideIcon][] = [
  [/su[ií]te|quarto|dormit/i, BedDouble],
  [/banheiro|lavabo|wc\b/i, Bath],
  [/garagem|vaga|estacionamento|carro/i, Car],
  [/piscina|deck molhado/i, Waves],
  [/gourmet|churrasq|grill|espa[cç]o de festa/i, Flame],
  [/cozinha|copa/i, CookingPot],
  [/sala|estar|living/i, Sofa],
  [/elevador/i, ArrowUpDown],
  [/portaria|seguran|c[âa]mera|monitorad|cerca|guarita|controle de acesso|muro/i, ShieldCheck],
  [/academia|fitness|muscula/i, Dumbbell],
  [/playground|brinquedo|crian[cç]a|kids/i, Baby],
  [/pet|cachorro/i, Dog],
  [/jardim|verde|[áa]rvore|arboriz|pra[cç]a|paisag/i, Trees],
  [/solar|ilumina|luz natural|ventila/i, Sun],
  [/ar[- ]condicionado|climatiz/i, AirVent],
  [/internet|wi-?fi|fibra/i, Wifi],
  [/energia|el[ée]tric|gerador/i, Zap],
  [/[áa]gua|reservat|caixa d/i, Droplets],
  [/mercado|com[ée]rcio|loja/i, ShoppingCart],
  [/varanda|sacada|quintal|[áa]rea externa|lateral/i, Fence],
  [/vista|rooftop|terra[cç]o|mirante/i, Mountain],
  [/m²|m2|metro|[áa]rea|terreno|lote/i, Ruler],
  [/andar|pavimento|pr[ée]dio|torre|bloco/i, Building2],
  [/casa|resid[êe]ncia|sobrado/i, Home],
  [/entrega|prazo|previs|ano/i, Calendar],
  [/registro|incorpora|documenta|escritura/i, Landmark],
  [/perto|pr[óo]ximo|localiza|minutos|bairro|centro|avenida|rua/i, MapPin],
  [/chave|pronto para morar|entregue/i, KeyRound],
  [/planta|layout|distribui/i, LayoutGrid],
];

export function iconeDoTexto(texto: string): LucideIcon {
  for (const [regra, icone] of REGRAS) if (regra.test(texto)) return icone;
  return Sparkles;
}
