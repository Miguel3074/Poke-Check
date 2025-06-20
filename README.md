﻿# Projeto Pokédex Interativo

Este é um projeto de Pokédex desenvolvido em React que permite aos usuários visualizar uma lista de Pokémon, filtrar por tipo, nome, ver detalhes de cada Pokémon, marcar como favorito e explorar suas cadeias evolutivas.

## Funcionalidades

* **Listagem de Pokémon:** Exibe uma lista paginada de Pokémon com scroll infinito.
* **Detalhes do Pokémon:** Modal com informações detalhadas, incluindo:
    * ID, Altura, Peso
    * Tipos (com cores específicas)
    * Habilidades
    * Estatísticas Base
    * Cadeia de Evolução (com sprites)
* **Filtros:**
    * Filtrar Pokémon por tipo (seleção única).
    * Buscar Pokémon por nome.
* **Favoritos:** Marcar/desmarcar Pokémon como favoritos (a persistência desta funcionalidade depende da implementação de `useFavorites`).
* **Design Responsivo:** Interface adaptável a diferentes tamanhos de tela.

## Tecnologias Utilizadas

* **React:** Biblioteca JavaScript para construção da interface de usuário.
* **JavaScript (ES6+):** Linguagem de programação principal.
* **CSS3:** Para estilização dos componentes e layout.
* **PokeAPI (pokeapi.co):** API RESTful utilizada para obter os dados dos Pokémon.
* **Font Awesome:** Para ícones (ex: coração de favorito).

## Estrutura do Projeto (Principais Componentes)

* `App.js`: Componente raiz da aplicação.
* `Body.jsx`: Componente principal que gerencia a listagem, filtros e carregamento de Pokémon.
* `PokemonItem.jsx`: Componente para exibir cada Pokémon individualmente na lista.
* `PokemonDetailsModal.jsx`: Modal para exibir os detalhes completos de um Pokémon, incluindo sua cadeia evolutiva.
* `Filter.jsx`: Componente que contém os controles de filtro (por tipo, nome, favoritos).
* `services/api.js`: Módulo contendo as funções para interagir com a PokeAPI.
* `services/favorites.js`: (Suposto) Hook ou módulo para gerenciar a lógica de Pokémon favoritos.

## Instruções para Rodar o Projeto Localmente

Para executar este projeto em sua máquina local, siga os passos abaixo:

### Pré-requisitos
* Node.js (versão 14.x ou superior recomendada)
* npm (geralmente vem com o Node.js) ou Yarn

### Clone o Repositório
git clone <https://github.com/Miguel3074/Poke-Check>
cd <poke-check>
### Instale as Dependências
Se estiver usando npm:
npm install

Ou se estiver usando Yarn:

yarn install

### Inicie o Servidor de Desenvolvimento
Se estiver usando npm:
npm start

Ou se estiver usando Yarn:
yarn start

Isso geralmente abrirá o projeto no seu navegador padrão no endereço `http://localhost:5173/`.

## Observações Técnicas Relevantes

* **Gerenciamento de Estado:** O estado principal da aplicação (lista de Pokémon, filtros ativos, Pokémon selecionado) é gerenciado no componente `Body.jsx` usando os hooks `useState` e `useRef`. O `useMemo` é utilizado para otimizar a lista de exibição.
* **Busca de Dados:** As chamadas à PokeAPI são feitas de forma assíncrona usando `async/await` e `fetch`. A lógica de busca é encapsulada em `services/api.js`.
* **Cadeia de Evolução:** A exibição da cadeia evolutiva requer múltiplas chamadas à API:
    1.  Detalhes do Pokémon -> URL da Espécie.
    2.  Dados da Espécie -> URL da Cadeia de Evolução.
    3.  Dados da Cadeia de Evolução.
    4.  Detalhes de cada Pokémon na cadeia para obter sprites e nomes corretos.
        Esta lógica está implementada no `PokemonDetailsModal.jsx`.
* **Estilização:** A estilização é feita com arquivos CSS dedicados para cada componente principal (`Body.css`, `PokemonDetailsModal.css`, `Filter.css`, etc.). As cores dos tipos são aplicadas dinamicamente via classes CSS.
* **Tratamento de Erros:** Foram implementados tratamentos básicos de erro para falhas na busca de dados, exibindo mensagens para o usuário.
* **Paginação e Scroll Infinito:** A lista principal de Pokémon implementa um scroll infinito para carregar mais Pokémon conforme o usuário rola a página, exceto quando um filtro de tipo está ativo (onde todos os Pokémon daquele tipo são carregados de uma vez).
* **Otimizações:**
    * `useCallback` é usado para memoizar funções passadas como props ou usadas em `useEffect` para evitar recriações desnecessárias.
    * `React.Fragment` é usado quando necessário para evitar a adição de nós DOM extras.

## Link para o Deploy
https://Miguel3074.github.io/Poke-Check/
* **Projeto Deployado:** 
