// ==========================================
// POKEDEX - Aplicacion con PokeAPI
// ==========================================

// ===== CONFIGURACION =====
const CONFIG = {
  apiUrl: 'https://pokeapi.co/api/v2',
  pokemonPerPage: 12,
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
};

// ===== ESTADO GLOBAL =====
const state = {
  offset: 0,
  total: 0,
  type: ''
};

// ===== ELEMENTOS DEL DOM =====
const elements = {
  container: document.getElementById('pokemon-container'),
  typeSelector: document.getElementById('type-selector'),
  searchInput: document.getElementById('search-input'),
  searchBtn: document.getElementById('search-btn'),
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  pageInfo: document.getElementById('page-info'),
  modal: null,
  modalBody: document.getElementById('modal-body'),
  modalTitle: document.getElementById('modal-pokemon-name')
};

// ===== COLORES Y TRADUCCIONES =====
const typeData = {
  grass: { color: '#78c850', name: 'Planta' },
  water: { color: '#6890f0', name: 'Agua' },
  fire: { color: '#f08030', name: 'Fuego' },
  electric: { color: '#f8d030', name: 'Electrico' },
  poison: { color: '#a040a0', name: 'Veneno' },
  normal: { color: '#a8a878', name: 'Normal' },
  flying: { color: '#a890f0', name: 'Volador' },
  psychic: { color: '#f85888', name: 'Psiquico' },
  fairy: { color: '#ee99ac', name: 'Hada' },
  bug: { color: '#a8b820', name: 'Bicho' },
  rock: { color: '#b8a038', name: 'Roca' },
  ground: { color: '#e0c068', name: 'Tierra' },
  fighting: { color: '#c03028', name: 'Lucha' },
  ice: { color: '#98d8d8', name: 'Hielo' },
  dragon: { color: '#7038f8', name: 'Dragon' },
  ghost: { color: '#705898', name: 'Fantasma' },
  dark: { color: '#705848', name: 'Siniestro' },
  steel: { color: '#b8b8d0', name: 'Acero' }
};

const statColors = {
  hp: '#ff5959',
  attack: '#f5ac78',
  defense: '#fae078',
  'special-attack': '#9db7f5',
  'special-defense': '#a7db8d',
  speed: '#fa92b2'
};

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Formatea el numero del Pokemon con ceros
 */
function formatNumber(num) {
  return `#${num.toString().padStart(3, '0')}`;
}

/**
 * Obtiene la URL de la imagen oficial del Pokemon
 */
function getImageUrl(id) {
  return `${CONFIG.imageUrl}/${id}.png`;
}

/**
 * Hace una peticion fetch y devuelve JSON
 */
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error en la peticion');
  return response.json();
}

// ==========================================
// FUNCIONES DE UI
// ==========================================

/**
 * Muestra el indicador de carga
 */
function showLoading() {
  elements.container.innerHTML = `
    <div class="col-12">
      <div class="loading-wrapper">
        <img src="images/pokeball.png" alt="Cargando" class="pokeball-spinner">
        <span class="text-light">Cargando Pokemon...</span>
      </div>
    </div>
  `;
}

/**
 * Muestra un mensaje de error
 */
function showError(message) {
  elements.container.innerHTML = `
    <div class="col-12">
      <div class="error-message">
        <p>${message}</p>
      </div>
    </div>
  `;
}

/**
 * Actualiza los botones de paginacion
 */
function updatePagination() {
  const currentPage = Math.floor(state.offset / CONFIG.pokemonPerPage) + 1;
  const totalPages = Math.ceil(state.total / CONFIG.pokemonPerPage);
  
  elements.pageInfo.textContent = `Pagina ${currentPage} de ${totalPages}`;
  elements.prevBtn.disabled = state.offset === 0;
  elements.nextBtn.disabled = state.offset + CONFIG.pokemonPerPage >= state.total;
}

// ==========================================
// FUNCIONES DE POKEMON
// ==========================================

/**
 * Crea el HTML de una tarjeta de Pokemon
 */
function createPokemonCard(pokemon) {
  const mainType = pokemon.types[0].type.name;
  const typeColor = typeData[mainType]?.color || '#888';
  
  // Crear los badges de tipos
  const typeBadges = pokemon.types
    .map(t => `<span class="pokemon-type type-${t.type.name}">${t.type.name}</span>`)
    .join('');
  
  return `
    <div class="col-6 col-sm-4 col-md-3 col-lg-2">
      <div class="pokemon-card animate__animated animate__fadeInUp" 
           style="border-color: ${typeColor}"
           data-pokemon-id="${pokemon.id}">
        <span class="pokemon-number">${formatNumber(pokemon.id)}</span>
        <img class="pokemon-image" 
             src="${getImageUrl(pokemon.id)}" 
             alt="${pokemon.name}"
             loading="lazy">
        <p class="pokemon-name">${pokemon.name}</p>
        <div class="pokemon-types">${typeBadges}</div>
      </div>
    </div>
  `;
}

/**
 * Muestra el modal con detalles del Pokemon
 */
async function showPokemonDetails(pokemonId) {
  try {
    const pokemon = await fetchJson(`${CONFIG.apiUrl}/pokemon/${pokemonId}`);
    const mainType = pokemon.types[0].type.name;
    
    // Crear HTML de estadisticas
    const statsHtml = pokemon.stats.map(stat => {
      const percentage = Math.min((stat.base_stat / 150) * 100, 100);
      const color = statColors[stat.stat.name] || '#888';
      const statName = stat.stat.name.replace('-', ' ');
      
      return `
        <div class="mb-2">
          <div class="d-flex justify-content-between">
            <span class="stat-label">${statName}</span>
            <span class="stat-value">${stat.base_stat}</span>
          </div>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${percentage}%; background: ${color}"></div>
          </div>
        </div>
      `;
    }).join('');
    
    // Crear badges de tipos
    const typeBadges = pokemon.types
      .map(t => `<span class="pokemon-type type-${t.type.name} me-1">${t.type.name}</span>`)
      .join('');
    
    elements.modalTitle.textContent = pokemon.name;
    elements.modalBody.innerHTML = `
      <img src="${getImageUrl(pokemon.id)}" alt="${pokemon.name}" class="modal-pokemon-image mb-3">
      <p class="mb-2">${formatNumber(pokemon.id)}</p>
      <div class="mb-3">${typeBadges}</div>
      <div class="row text-center mb-3">
        <div class="col-6">
          <small class="text-muted">Altura</small>
          <p class="mb-0 fw-bold">${(pokemon.height / 10).toFixed(1)} m</p>
        </div>
        <div class="col-6">
          <small class="text-muted">Peso</small>
          <p class="mb-0 fw-bold">${(pokemon.weight / 10).toFixed(1)} kg</p>
        </div>
      </div>
      <h6 class="mb-3">Estadisticas</h6>
      ${statsHtml}
    `;
    
    elements.modal.show();
  } catch (error) {
    console.error('Error cargando detalles:', error);
  }
}

/**
 * Carga y muestra la lista de Pokemon
 */
async function loadPokemon() {
  showLoading();
  
  try {
    let pokemonList = [];
    
    // Cargar por tipo o todos
    if (state.type) {
      const data = await fetchJson(`${CONFIG.apiUrl}/type/${state.type}`);
      state.total = data.pokemon.length;
      
      const sliced = data.pokemon.slice(state.offset, state.offset + CONFIG.pokemonPerPage);
      pokemonList = sliced.map(p => p.pokemon);
    } else {
      const data = await fetchJson(`${CONFIG.apiUrl}/pokemon?limit=${CONFIG.pokemonPerPage}&offset=${state.offset}`);
      state.total = data.count;
      pokemonList = data.results;
    }
    
    // Obtener detalles de cada Pokemon
    const pokemonDetails = await Promise.all(
      pokemonList.map(p => fetchJson(p.url))
    );
    
    // Renderizar tarjetas
    elements.container.innerHTML = pokemonDetails.map(createPokemonCard).join('');
    
    // Agregar eventos de click a las tarjetas
    document.querySelectorAll('.pokemon-card').forEach(card => {
      card.addEventListener('click', () => {
        const pokemonId = card.dataset.pokemonId;
        showPokemonDetails(pokemonId);
      });
    });
    
    updatePagination();
    
  } catch (error) {
    console.error('Error cargando Pokemon:', error);
    showError('Error al cargar los Pokemon. Intenta de nuevo.');
  }
}

/**
 * Busca un Pokemon por nombre o numero
 */
async function searchPokemon() {
  const query = elements.searchInput.value.trim().toLowerCase();
  
  // Si esta vacio, resetear y cargar todos
  if (!query) {
    state.offset = 0;
    state.type = '';
    elements.typeSelector.value = '';
    loadPokemon();
    return;
  }
  
  showLoading();
  
  try {
    const pokemon = await fetchJson(`${CONFIG.apiUrl}/pokemon/${query}`);
    
    elements.container.innerHTML = createPokemonCard(pokemon);
    
    // Agregar evento de click
    document.querySelector('.pokemon-card').addEventListener('click', () => {
      showPokemonDetails(pokemon.id);
    });
    
    // Actualizar paginacion para busqueda
    elements.pageInfo.textContent = 'Resultado de busqueda';
    elements.prevBtn.disabled = true;
    elements.nextBtn.disabled = true;
    
  } catch (error) {
    showError('Pokemon no encontrado. Verifica el nombre o numero.');
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Cambio de tipo
elements.typeSelector.addEventListener('change', (e) => {
  state.type = e.target.value;
  state.offset = 0;
  elements.searchInput.value = '';
  loadPokemon();
});

// Boton de busqueda
elements.searchBtn.addEventListener('click', searchPokemon);

// Buscar con Enter
elements.searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchPokemon();
});

// Pagina anterior
elements.prevBtn.addEventListener('click', () => {
  if (state.offset >= CONFIG.pokemonPerPage) {
    state.offset -= CONFIG.pokemonPerPage;
    loadPokemon();
  }
});

// Pagina siguiente
elements.nextBtn.addEventListener('click', () => {
  if (state.offset + CONFIG.pokemonPerPage < state.total) {
    state.offset += CONFIG.pokemonPerPage;
    loadPokemon();
  }
});

// ==========================================
// INICIALIZACION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar modal de Bootstrap
  const bootstrap = window.bootstrap; // Declare the bootstrap variable
  elements.modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
  
  // Cargar Pokemon iniciales
  loadPokemon();
});
