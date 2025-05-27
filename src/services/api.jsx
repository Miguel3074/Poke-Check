const API_BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemon = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Erro ao buscar Pokémon ${id}:`, error);
        throw error;
    }
};

export const getPokemonList = async (limit = 20, offset = 0) => {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar lista de Pokémon:", error);
        throw error;
    }
};

export const getPokemonByType = async (type, limit = 20, offset = 0) => {
  try {
    const response = await fetch(`${API_BASE_URL}/type/${type}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const results = data.pokemon
    return { results };
  } catch (error) {
    console.error(`Erro ao buscar Pokémon do tipo ${type}:`, error);
    throw error;
  }
};

export const getPokemonTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/type`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Resposta da API /type:", data); // <--- ADICIONE ESTE LOG
    return data.results;
  } catch (error) {
    console.error("Erro ao buscar tipos de Pokémon:", error);
    throw error;
  }
};