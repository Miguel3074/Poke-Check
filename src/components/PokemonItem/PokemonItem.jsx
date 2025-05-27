import './PokemonItem.css';
import React, { useState, useEffect } from 'react';
import { getPokemon } from '../../services/api';
import { useFavorites } from '../../services/favorites';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import '@fortawesome/fontawesome-free/css/all.min.css'; 

function PokemonItem({ pokemonId, onClick }) {
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(pokemonId);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPokemon(pokemonId)
      .then(data => {
        setPokemonData(data);
      })
      .catch(err => {
        console.error(`Erro ao buscar dados do Pokémon ${pokemonId}:`, err);
        setError("Erro ao carregar dados do Pokémon.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pokemonId]);

  if (loading) {
    return <div className="pokemon loading-placeholder"><p>Carregando...</p></div>;
  }

  if (error) {
    return <div className="pokemon error"><p>{error}</p></div>;
  }

  if (!pokemonData) {
    return null;
  }

  const handleFavoriteClick = (event) => {
    event.stopPropagation();
    toggleFavorite(pokemonId);
  };

  return (
    <div className="pokemon" onClick={() => onClick(pokemonId)}>
      <button className="favorite-button" onClick={handleFavoriteClick}>
        <FontAwesomeIcon
          icon={isFavorite ? faHeartSolid : faHeartRegular} 
          color={isFavorite ? 'red' : 'grey'}
          size="lg"
        />
      </button>
      <h2>{pokemonData.id}</h2>
      <h2>{pokemonData.name}</h2>
      <img
        src={pokemonData.sprites.front_default}
        alt={pokemonData.name}
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/cccccc/000000?text=No+Image'; }}
      />
    </div>
  );
}

export default PokemonItem;