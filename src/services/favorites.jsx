import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const storedFavorites = localStorage.getItem('pokemonFavorites');
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      console.error("Erro ao carregar favoritos do localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error("Erro ao salvar favoritos no localStorage:", error);
    }
  }, [favorites]);

  const toggleFavorite = (pokemonId) => {
    setFavorites((prevFavorites) => {
      const isCurrentlyFavorite = prevFavorites.includes(pokemonId);
      if (isCurrentlyFavorite) {
        return prevFavorites.filter((id) => id !== pokemonId);
      } else {
        return [...prevFavorites, pokemonId];
      }
    });
  };

  const isFavorite = (pokemonId) => {
    return favorites.includes(pokemonId);
  };

  const contextValue = {
    favorites,
    toggleFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;