import React, { useState, useEffect } from 'react';
import { getPokemon } from '../../services/api';
import './PokemonDetailsModal.css';

function PokemonDetailsModal({ pokemonId, onClose }) {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pokemonId) { 
      setLoading(true);
      setError(null);
      getPokemon(pokemonId)
        .then(data => {
          setPokemonDetails(data);
        })
        .catch(err => {
          console.error("Erro ao buscar detalhes do Pokémon:", err);
          setError("Não foi possível carregar os detalhes do Pokémon.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [pokemonId]);

  if (!pokemonId) {
    return null; 
  }

  if (loading) {
    return (
      <div className="pokemon-details-modal-overlay">
        <div className="pokemon-details-modal">
          <p>Carregando detalhes do Pokémon...</p>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pokemon-details-modal-overlay">
        <div className="pokemon-details-modal">
          <p className="error-message">{error}</p>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
      </div>
    );
  }

  if (!pokemonDetails) {
    return null;
  }

  return (
    <div className="pokemon-details-modal-overlay">
      <div className="pokemon-details-modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="pokemon-name">{pokemonDetails.name.toUpperCase()}</h2>
        <img
          src={pokemonDetails.sprites.front_default}
          alt={pokemonDetails.name}
          className="pokemon-image"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/000000?text=No+Image'; }}
        />
        <div className="details-section">
          <p><strong>ID:</strong> {pokemonDetails.id}</p>
          <p><strong>Altura:</strong> {pokemonDetails.height / 10} m</p> 
          <p><strong>Peso:</strong> {pokemonDetails.weight / 10} kg</p>
        </div>

        <div className="details-section">
          <h3>Tipos:</h3>
          <ul className="pokemon-types">
            {pokemonDetails.types.map((typeInfo) => (
              <li key={typeInfo.type.name} className={`type-${typeInfo.type.name}`}>
                {typeInfo.type.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="details-section">
          <h3>Habilidades:</h3>
          <ul className="pokemon-abilities">
            {pokemonDetails.abilities.map((abilityInfo) => (
              <li key={abilityInfo.ability.name}>
                {abilityInfo.ability.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="details-section">
          <h3>Estatísticas Base:</h3>
          <ul className="pokemon-stats">
            {pokemonDetails.stats.map((statInfo) => (
              <li key={statInfo.stat.name}>
                <strong>{statInfo.stat.name}:</strong> {statInfo.base_stat}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetailsModal;