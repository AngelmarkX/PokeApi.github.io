$(document).ready(function() {
    var apiUrl = 'https://pokeapi.co/api/v2';
    var limit = 9;
    var offset = 0;
    var selectedType = null;
    var totalPokemon = 0;
  
    function getPokemonData() {
      var url;
      if (selectedType) {
        url = apiUrl + '/type/' + selectedType;
      } else {
        url = apiUrl + '/pokemon';
      }
  
      $.get(url, { limit: limit, offset: offset }, function(data) {
        totalPokemon = data.count;
        var pokemonDataArray = selectedType ? data.pokemon : data.results;
  
        var promises = [];
  
        pokemonDataArray.forEach(function(pokemon) {
          var pokemonUrl = selectedType ? pokemon.pokemon.url : pokemon.url;
          var promise = $.get(pokemonUrl);
          promises.push(promise);
        });
  
        Promise.all(promises).then(function(results) {
          var pokemonContainer = $('#pokemon-container');
          pokemonContainer.empty();
  
          results.forEach(function(pokemonData) {
            var pokemonNumber = pokemonData.id;
            var pokemonImageUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokemonNumber + '.png';
            var pokemonImage = $('<img>').addClass('pokemon-image img-fluid').attr('src', pokemonImageUrl);
  
            var pokemonCard = $('<div>').addClass('col-md-3 mb-3 my-5 pokemon-card').append(pokemonImage).append('<div class="pokemon-name">' + pokemonData.name + '</div>');
  
            var pokemonType = pokemonData.types[0].type.name;
            var typeColor = getTypeColor(pokemonType);
  
            pokemonCard.css('border', '2px solid ' + typeColor);
  
            pokemonContainer.append(pokemonCard);
          });
  
          updatePaginationButtons();
        });
      });
    }
  
    function updatePaginationButtons() {
      var prevButton = $('#prev-button');
      var nextButton = $('#next-button');
  
      prevButton.prop('disabled', offset === 0);
      nextButton.prop('disabled', offset + limit >= totalPokemon);
    }
  
    function getTypeColor(type) {
      var color;
      switch (type) {
        case 'grass':
          color = 'green';
          break;
        case 'water':
          color = 'blue';
          break;
        case 'fire':
          color = 'red';
          break;
        case 'electric':
          color = 'yellow';
          break;
        case 'poison':
          color = 'purple';
          break;
        case 'normal':
          color = 'lightgray';
          break;
        case 'flying':
          color = 'lightblue';
          break;
        case 'psychic':
          color = 'fuchsia';
          break;
        case 'fairy':
          color = 'lightpink';
          break;
        default:
          color = 'gray';
          break;
      }
  
      return color;
    }
  
    $('#Selector').change(function() {
      selectedType = $(this).val();
      offset = 0;
      getPokemonData();
    });
  
    $('#prev-button').click(function() {
      if (offset >= limit) {
        offset -= limit;
        getPokemonData();
      }
    });
  
    $('#next-button').click(function() {
      if (offset + limit < totalPokemon) {
        offset += limit;
        getPokemonData();
      }
    });
  
    getPokemonData();
  });
  