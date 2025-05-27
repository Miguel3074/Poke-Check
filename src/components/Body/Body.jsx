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
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [fetchedFavorites, setFetchedFavorites] = useState([]);

  const [availableTypes, setAvailableTypes] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const loadIncrement = 60;
  const initialFetchDone = useRef(false);
  const isFetching = useRef(false);

  const { favorites } = useFavorites();

  const fetchAndSetPokemon = useCallback(async (newOffset = 0, isNewFilter = false) => {
    if (isFetching.current && !isNewFilter) return;
    if (loading && !isNewFilter) return;
    if (allPokemonLoaded && !isNewFilter && newOffset > 0 && !filterType) return;

    isFetching.current = true;
    setLoading(true);
    setInitialLoad(false);

    if (isNewFilter) {
      setPokemonList([]);
    }

    try {
      let listData;
      if (filterType) {
        const typeData = await getPokemonByType(filterType);
        listData = {
          results: typeData && typeData.results ? typeData.results : [],
          next: null,
        };
      } else {
        listData = await getPokemonList(loadIncrement, newOffset);
      }

      if (listData && listData.results && listData.results.length > 0) {
        const detailedPokemonsPromises = listData.results.map(item => {
          const url = filterType ? item.pokemon.url : item.url;
          if (!url) {
            return Promise.resolve(null);
          }
          const idFromUrl = url.split('/').filter(Boolean).pop();
          return getPokemon(idFromUrl);
        });

        const detailedPokemons = (await Promise.all(detailedPokemonsPromises)).filter(p => p !== null);

        setPokemonList(prevList => {
          if (isNewFilter || newOffset === 0) {
            return detailedPokemons.filter(newPokemon => newPokemon && newPokemon.id);
          }
          const newUniquePokemons = detailedPokemons.filter(
            newPokemon => newPokemon && newPokemon.id && !prevList.some(existingPokemon => existingPokemon.id === newPokemon.id)
          );
          return [...prevList, ...newUniquePokemons];
        });

        if (filterType) {
          setAllPokemonLoaded(true);
          setOffset(listData.results.length);
        } else {
          if (listData.results.length > 0) {
            setOffset(currentOffset => currentOffset + listData.results.length);
          }
          setAllPokemonLoaded(!listData.next);
        }

      } else {
        if (isNewFilter || newOffset === 0) setPokemonList([]);
        setAllPokemonLoaded(true);
      }
    } catch (err) {
      if (isNewFilter || newOffset === 0) setPokemonList([]);
      setAllPokemonLoaded(true);
    } finally {
      setLoading(false);
      isFetching.current = false;
      if (!initialFetchDone.current && (isNewFilter || newOffset === 0)) {
        initialFetchDone.current = true;
      }
    }
  }, [filterType, loadIncrement, loading, allPokemonLoaded]);

  useEffect(() => {
    initialFetchDone.current = false;
    setOffset(0);
    setAllPokemonLoaded(false);
    setInitialLoad(true);
    if (!searchName && !filterType && !showFavorites) {
      fetchAndSetPokemon(0, true);
    } else if (filterType) {
      fetchAndSetPokemon(0, true);
    }
    setSearchResults([]);
  }, [filterType, searchName, showFavorites]);

  useEffect(() => {
    getPokemonTypes()
      .then(typesArray => {
        if (typesArray && Array.isArray(typesArray)) {
          setAvailableTypes(typesArray.map(type => type.name));
        } else {
          setAvailableTypes([]);
        }
      })
      .catch(err => {
        setAvailableTypes([]);
      });
  }, []);

  const handleScroll = useCallback(() => {
    if (
      !filterType &&
      !loading &&
      !allPokemonLoaded &&
      !isFetching.current &&
      !searchName &&
      !showFavorites &&
      (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200)
    ) {
      fetchAndSetPokemon(offset);
    }
  }, [loading, allPokemonLoaded, offset, filterType, fetchAndSetPokemon, searchName, showFavorites]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const handlePokemonClick = (id) => {
    setSelectedPokemonId(id);
  };

  const handleCloseModal = () => {
    setSelectedPokemonId(null);
  };

  const handleFilterByType = (type) => {
    setFilterType(prevType => (prevType === type ? '' : type));
    setShowFavorites(false);
    setSearchName('');
  };

  const handleFilterFavorites = (isChecked) => {
    setShowFavorites(isChecked);
    setFilterType('');
    setSearchName('');
  };

  const handleSearchByName = useCallback(async (name) => {
    setSearchName(name.toLowerCase());
    setIsSearching(true);
    setShowFavorites(false);
    setFilterType('');
    setSearchResults([]);

    if (name) {
      try {
        const pokemon = await getPokemon(name.toLowerCase());
        if (pokemon && pokemon.id) {
          setSearchResults([pokemon]);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [getPokemon]);

  useEffect(() => {
    if (showFavorites) {
      setLoadingFavorites(true);
      const fetchFavoritesDetails = async () => {
        const details = await Promise.all(
          favorites.map(async (favId) => {
            const alreadyLoaded = pokemonList.find(p => String(p.id) === favId);
            if (alreadyLoaded) {
              return alreadyLoaded;
            }
            try {
              return await getPokemon(favId);
            } catch (error) {
              console.error(`Erro ao buscar detalhes do favorito ${favId}:`, error);
              return null;
            }
          })
        );
        setFetchedFavorites(details.filter(d => d !== null));
        setLoadingFavorites(false);
      };
      fetchFavoritesDetails();
    } else {
      setFetchedFavorites([]);
    }
  }, [showFavorites, favorites, getPokemon, pokemonList]);

  const filteredAndSearchedPokemon = useMemo(() => {
    if (isSearching) {
      return [];
    }

    let listToDisplay = pokemonList;

    if (searchName) {
      listToDisplay = searchResults;
    } else if (showFavorites) {
      const allRelevantPokemon = [...fetchedFavorites, ...pokemonList];
      listToDisplay = allRelevantPokemon.filter(pokemon => pokemon && favorites.includes(String(pokemon.id)));
      listToDisplay = Array.from(new Map(listToDisplay.map(item => [item?.id, item])).values()).filter(Boolean);
    } else if (filterType) {
      listToDisplay = listToDisplay.filter(pokemon =>
        pokemon && pokemon.types.some(typeInfo => typeInfo.type.name === filterType)
      );
    }

    return listToDisplay;
  }, [pokemonList, showFavorites, searchName, searchResults, isSearching, favorites, filterType, fetchedFavorites]);

  const pokemonToShow = useMemo(() => {
    if (showFavorites && loadingFavorites) {
      return [];
    }
    if (!initialLoad && filteredAndSearchedPokemon.length === 0 && (showFavorites || searchName || filterType)) {
      return [];
    }
    return filteredAndSearchedPokemon;
  }, [filteredAndSearchedPokemon, initialLoad, showFavorites, searchName, filterType, loadingFavorites]);

  return (
    <>
      <Filter
        onFilterByType={handleFilterByType}
        onFilterFavorites={handleFilterFavorites}
        showFavorites={showFavorites}
        onSearchByName={handleSearchByName}
        availableTypes={availableTypes}
        currentFilterType={filterType}
        currentSearchName={searchName}
      />

      <div className="grid">
        {pokemonToShow.map((pokemon) => {
          if (!pokemon || !pokemon.id) {
            return null;
          }
          return (
            <PokemonItem
              key={pokemon.id}
              pokemonId={String(pokemon.id)}
              onClick={() => handlePokemonClick(pokemon.id)}
            />
          );
        })}
      </div>

      {loading && !searchName && !showFavorites && <p className="status-message">Carregando Pokémon...</p>}
      {isSearching && <p className="status-message">Buscando Pokémon...</p>}
      {loadingFavorites && <p className="status-message">Carregando Favoritos...</p>}
      {!loading && !isSearching && !loadingFavorites && pokemonToShow.length === 0 && (showFavorites || filterType || searchName) && !initialLoad && (
        <p className="status-message">Nenhum Pokémon encontrado com os filtros aplicados.</p>
      )}
      {!loading && pokemonList.length === 0 && !filterType && !searchName && !showFavorites && allPokemonLoaded && !initialLoad && (
        <p className="status-message">Nenhum Pokémon para mostrar.</p>
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