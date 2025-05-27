import React, { useState, useEffect } from 'react';
import { getPokemon } from '../../services/api';
import './PokemonDetailsModal.css';

function getPokemonIdFromUrl(url) {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 2];
}

function parseEvolutionChain(chainData) {
  const stages = [];

  function processStage(stageNodeList) {
    if (!stageNodeList || stageNodeList.length === 0) {
      return;
    }

    const currentStagePokemon = [];
    const nextStageNodes = [];

    stageNodeList.forEach(node => {
      if (node.species && node.species.name && node.species.url) {
        currentStagePokemon.push({
          name: node.species.name,
          id: getPokemonIdFromUrl(node.species.url)
        });
      }
      if (node.evolves_to && node.evolves_to.length > 0) {
        nextStageNodes.push(...node.evolves_to);
      }
    });

    if (currentStagePokemon.length > 0) {
      stages.push(currentStagePokemon);
    }

    processStage(nextStageNodes);
  }

  if (chainData) {
    processStage([chainData]);
  }
  return stages;
}


function PokemonDetailsModal({ pokemonId, onClose }) {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [evolutionChain, setEvolutionChain] = useState([]);
  const [evolutionLoading, setEvolutionLoading] = useState(false);
  const [evolutionError, setEvolutionError] = useState(null);

  useEffect(() => {
    if (pokemonId) {
      setLoading(true);
      setError(null);
      setPokemonDetails(null);
      setEvolutionChain([]);
      setEvolutionError(null);

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

  useEffect(() => {
    if (pokemonDetails && pokemonDetails.species && pokemonDetails.species.url) {
      setEvolutionLoading(true);
      setEvolutionError(null);
      setEvolutionChain([]);

      const fetchFullEvolutionData = async () => {
        try {
          const speciesResponse = await fetch(pokemonDetails.species.url);
          if (!speciesResponse.ok) throw new Error('Falha ao buscar dados da espécie.');
          const speciesData = await speciesResponse.json();

          if (!speciesData.evolution_chain || !speciesData.evolution_chain.url) {
            setEvolutionError("Cadeia de evolução não encontrada para esta espécie.");
            setEvolutionLoading(false);
            return;
          }

          const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
          if (!evolutionChainResponse.ok) throw new Error('Falha ao buscar dados da cadeia de evolução.');
          const evolutionChainData = await evolutionChainResponse.json();

          const parsedStages = parseEvolutionChain(evolutionChainData.chain);

          const stagesWithDetails = await Promise.all(
            parsedStages.map(async (stage) => {
              return Promise.all(
                stage.map(async (pokemonInStage) => {
                  if (!pokemonInStage.id) {
                    return { ...pokemonInStage, name: pokemonInStage.name, sprite: null };
                  }
                  try {
                    const details = await getPokemon(pokemonInStage.id);
                    return {
                      id: details.id,
                      name: details.name,
                      sprite: details.sprites?.front_default,
                    };
                  } catch (detailError) {
                    console.error(`Falha ao buscar detalhes para ${pokemonInStage.name} (ID: ${pokemonInStage.id}) na cadeia de evolução:`, detailError);
                    return { ...pokemonInStage, name: pokemonInStage.name, sprite: null };
                  }
                })
              );
            })
          );
          setEvolutionChain(stagesWithDetails);

        } catch (err) {
          console.error("Erro ao processar cadeia de evolução:", err);
          setEvolutionError("Não foi possível carregar a cadeia de evolução.");
        } finally {
          setEvolutionLoading(false);
        }
      };

      fetchFullEvolutionData();
    }
  }, [pokemonDetails]);


  if (!pokemonId) {
    return null;
  }

  const renderLoading = () => (
    <div className="pokemon-details-modal-overlay">
      <div className="pokemon-details-modal">
        <p>Carregando detalhes do Pokémon...</p>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
    </div>
  );

  const renderError = (errorMessage) => (
    <div className="pokemon-details-modal-overlay">
      <div className="pokemon-details-modal">
        <p className="error-message">{errorMessage}</p>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
    </div>
  );

  if (loading) return renderLoading();
  if (error) return renderError(error);
  if (!pokemonDetails) return null;

  return (
    <div className="pokemon-details-modal-overlay" onClick={onClose}>
      <div className="pokemon-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="pokemon-name">{pokemonDetails.name.toUpperCase()}</h2>
        <img
          src={pokemonDetails.sprites?.front_default}
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
              <li key={typeInfo.type.name} className={`type-tag type-${typeInfo.type.name.toLowerCase()}`}>
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

        {/* Seção da Cadeia de Evolução */}
        <div className="details-section evolution-chain-section">
          <h3>Cadeia de Evolução:</h3>
          {evolutionLoading && <p>Carregando cadeia de evolução...</p>}
          {evolutionError && !evolutionLoading && <p className="error-message">{evolutionError}</p>}
          {!evolutionLoading && !evolutionError && evolutionChain.length > 0 && (
            <div className="evolution-stages-container">
              {evolutionChain.map((stage, stageIndex) => (
                <React.Fragment key={stageIndex}>
                  <div className="evolution-stage">
                    {stage.map(pokemon => (
                      <div className="evolution-pokemon-card" key={pokemon.id || pokemon.name}>
                        <img
                          src={pokemon.sprite || 'https://placehold.co/96x96/cccccc/000000?text=No+Sprite'}
                          alt={pokemon.name}
                          className="evolution-sprite"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/cccccc/000000?text=N/A'; }}
                        />
                        <p className="evolution-pokemon-name">{pokemon.name ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) : '???'}</p>
                      </div>
                    ))}
                  </div>
                  {stageIndex < evolutionChain.length - 1 && (
                    <span className="evolution-arrow">&rarr;</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          {!evolutionLoading && !evolutionError && evolutionChain.length === 0 && (
            <p>Não há mais evoluções ou dados não disponíveis.</p>
          )}
        </div>


        <div className="details-section">
          <h3>Estatísticas Base:</h3>
          <ul className="pokemon-stats">
            {pokemonDetails.stats.map((statInfo) => (
              <li key={statInfo.stat.name}>
                <strong>{statInfo.stat.name.replace('-', ' ')}:</strong> {statInfo.base_stat}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetailsModal;