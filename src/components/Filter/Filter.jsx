import React from 'react';
import './Filter.css';

function Filter({ onFilterByType, onFilterFavorites, showFavorites, onSearchByName, availableTypes, selectedTypes }) {
  return (
    <div className="pokemon-filter-header">
      <h2>Filtrar Pokémon</h2>

      <div className="filter-group">
        <label htmlFor="search-name">Buscar por Nome:</label>
        <input
          type="text"
          id="search-name"
          placeholder="Nome do Pokémon"
          onChange={(e) => onSearchByName(e.target.value)}
        />
      </div>

      <div className="filter-group types-filter">
        <label>Filtrar por Tipo:</label>
        <div className="checkbox-group">
          {availableTypes.map(type => (
            <div key={type} className="checkbox-item">
              <input
                type="checkbox"
                id={`type-${type}`}
                value={type}
                checked={selectedTypes.includes(type)}
                onChange={(e) => onFilterByType(e.target.value, e.target.checked)}
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
        />
      </div>
    </div>
  );
}

export default Filter;