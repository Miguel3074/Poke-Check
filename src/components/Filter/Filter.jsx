import React from 'react';
import './Filter.css';

function Filter({
  onFilterByType,
  onFilterFavorites,
  showFavorites,
  onSearchByName,
  availableTypes,
  currentFilterType,
  currentSearchName
}) {
  return (
    <div className="pokemon-filter-header">
      <div className="filter-group types-filter">
        <label>Filtrar por Tipo:</label>
        <div className="checkbox-group">
          {availableTypes.map(type => (
            <div key={type}
              className={`checkbox-item type-${type.toLowerCase()} ${type === currentFilterType ? 'active-type-highlight' : ''}`}>
              <input
                type="checkbox"
                id={`type-${type}`}
                value={type}
                checked={type === currentFilterType}
                onChange={() => onFilterByType(type)}
              />
              <label htmlFor={`type-${type}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="favorites-filter">Mostrar Favoritos:</label>
        <input
          type="checkbox"
          id="favorites-filter"
          checked={showFavorites}
          onChange={(e) => onFilterFavorites(e.target.checked)}
          className={showFavorites ? 'active-favorite-checkbox' : ''}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="search-name">Buscar por Nome:</label>
        <input
          type="text"
          id="search-name"
          placeholder="Nome do Pokémon"
          value={currentSearchName}
          onChange={(e) => onSearchByName(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Filter;