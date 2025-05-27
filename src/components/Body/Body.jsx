import './Body.css';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PokemonItem from '../PokemonItem/PokemonItem';
import PokemonDetailsModal from '../PokemonDetailsModal/PokemonDetailsModal';
import Filter from '../Filter/Filter';
import { getPokemonList, getPokemon, getPokemonByType, getPokemonTypes } from '../../services/api';
import { useFavorites } from '../../services/favorites';

function Body() {
  const [pokemonList, setPokemonList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allPokemonLoaded, setAllPokemonLoaded] = useState(false);
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const loadIncrement = 66;
  const initialFetchDone = useRef(false);
  const { favorites } = useFavorites();

  const fetchPokemonData = useCallback(async () => {
    if (loading || allPokemonLoaded) return;
    setLoading(true);
    try {
      let listData;
      if (filterType) {
        listData = await getPokemonByType(filterType, loadIncrement, offset);
      } else {
        listData = await getPokemonList(loadIncrement, offset);
      }

      if (listData.results && listData.results.length > 0) {
        const detailedPokemons = await Promise.all(listData.results.map(pokemon => {
          const url = filterType ? pokemon.pokemon.url : pokemon.url;
          return getPokemon(url.split('/').slice(-2, -1)[0]);
        }));

        setPokemonList((prevList) => {
          const newUniquePokemons = detailedPokemons.filter(newPokemon =>
            newPokemon && !prevList.some(existingPokemon => existingPokemon.id === newPokemon.id)
          );
          return [...prevList, ...newUniquePokemons];
        });

        setOffset((prevOffset) => prevOffset + loadIncrement);
        setAllPokemonLoaded(!listData.next);
      } else {
        setAllPokemonLoaded(true);
      }
    } catch (err) {
      console.error("Erro ao buscar lista de Pokémon:", err);
    } finally {
      setLoading(false);
    }
  }, [offset, loading, allPokemonLoaded, loadIncrement, filterType]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchPokemonData();
      initialFetchDone.current = true;
    }
  }, [fetchPokemonData]);

  const handleScroll = useCallback(() => {
    if (!loading && !allPokemonLoaded && window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight) {
      fetchPokemonData();
    }
  }, [loading, allPokemonLoaded, fetchPokemonData]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

useEffect(() => {
  getPokemonTypes()
    .then(typesArray => {
      if (typesArray && Array.isArray(typesArray)) {
        setAvailableTypes(typesArray.map(type => type.name));
      } else {
        console.error("Erro: A resposta de getPokemonTypes não foi um array válido:", typesArray);
      }
    })
    .catch(err => console.error("Erro ao buscar tipos de Pokémon:", err));
}, []);

  const handlePokemonClick = (id) => {
    setSelectedPokemonId(id);
  };

  const handleCloseModal = () => {
    setSelectedPokemonId(null);
  };

  const handleFilterByType = (type) => {
    setFilterType(type);
    setAllPokemonLoaded(false);
    initialFetchDone.current = false;
  };

  const handleFilterFavorites = (isChecked) => {
    setShowFavorites(isChecked);
  };

  const handleSearchByName = (name) => {
    setSearchName(name.toLowerCase());
  };

  const displayedPokemonList = useMemo(() => {
    let currentList = pokemonList;

    if (showFavorites) {
      currentList = currentList.filter(pokemon => favorites.includes(String(pokemon.id)));
    }

    if (filterType) {
      currentList = currentList.filter(pokemon =>
        pokemon.types.some(typeInfo => typeInfo.type.name === filterType)
      );
    }

    return currentList;
  }, [pokemonList, showFavorites, filterType, favorites]);


  return (
    <>
      <Filter
        onFilterByType={handleFilterByType}
        onFilterFavorites={handleFilterFavorites}
        showFavorites={showFavorites}
        onSearchByName={handleSearchByName}
        availableTypes={availableTypes}
        selectedTypes={selectedTypes}
      />

      <div className="grid">
        {displayedPokemonList.map((pokemon) => (
          <PokemonItem
            key={pokemon.id}
            pokemonId={String(pokemon.id)}
            onClick={handlePokemonClick}
          />
        ))}
      </div>

      {displayedPokemonList.length === 0 && !loading && (showFavorites || filterType) && (
        <p>Nenhum Pokémon encontrado com os filtros aplicados.</p>
      )}

      {selectedPokemonId && (
        <PokemonDetailsModal
          pokemonId={selectedPokemonId}
          onClose={handleCloseModal}
        />
      )}

    </>
  );
}

export default Body;