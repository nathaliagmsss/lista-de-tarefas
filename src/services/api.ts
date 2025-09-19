import { useQuery } from '@tanstack/react-query';

// Interface para frase motivacional
interface Quote {
  text: string;
  author: string;
}

// Função para buscar frase motivacional
const fetchMotivationalQuote = async (): Promise<Quote> => {
  try {
    const response = await fetch('https://api.quotable.io/random?tags=motivational');
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    const data = await response.json();
    return {
      text: data.content,
      author: data.author,
    };
  } catch (error) {
    // Fallback para quando a API falhar
    return {
      text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
      author: "Robert Collier"
    };
  }
};

// Hook personalizado para usar a frase motivacional
export const useMotivationalQuote = () => {
  return useQuery({
    queryKey: ['motivationalQuote'],
    queryFn: fetchMotivationalQuote,
    staleTime: 60 * 60 * 1000, // 1 hora
  });
};