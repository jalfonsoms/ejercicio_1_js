const consumeApiWithAxios = async (url) => {
    try {
        const response = await axios.get(url);
        console.log(`La petición a la API se completó correctamente con status: ${response.status}`);
        return response.data.results; // Devolver response.data.results en lugar de response.results
    } catch (error) {
        console.error(`Falló la petición a la API con error: ${error.message}`);
        return [];
    }
}

async function procesarNombres(resp) {
    try {
        const respApi = await resp;
        const nombres = respApi.map(results => results.name); // Mapea los nombres desde el array de objetos
        return nombres; // Devuelve los nombres
    } catch (error) {
        console.error(`Error al procesar la respuesta: ${error.message}`);
        return [];
    }
}
//Obtener la mayor base de datos de Pokemones
async function obtenerNombresPaginados(offset, limit) {
    const url = `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`;
    const respuestaPeticion = await consumeApiWithAxios(url);
    return await procesarNombres(respuestaPeticion);
}

async function descripcionPokemon(url) {
    try {
        const response = await axios.get(url);
        const descripcion = document.getElementById('descripcion');

        const species = response.data;

        // Filtrar las entradas de texto en español
        const entradaEnEspanol = species.flavor_text_entries.find(entry => entry.language.name === 'es');
        descripcion.textContent = entradaEnEspanol.flavor_text;
        descripcion.innerHTML = `<strong>DESCRIPCION</strong>: ${descripcion.textContent.toUpperCase()}`

        evolucionURL = species.evolution_chain.url;
        evolucionPokemon(evolucionURL);

    } catch (error) {
        descripcion.textContent = 'Se produjo un error al cargar la descripción.';
    }
}

async function evolucionPokemon(url) {
    try {
        const response = await axios.get(url);
        const evolucionChain = response.data;
        const evolucion = document.getElementById('evolucion');

        chain = evolucionChain.chain;

        evoluciona = obtenerEvolucion(chain);

        //const cadenaEvolucion = obtenerCadenaEvolucion(evolucionChain.chain);
        evolucion.innerHTML = `<strong>EVOLUCION:</strong> ${evoluciona}.`;
    } catch {
        evolucion.innerHTML = '<strong>EVOLUCION</strong>: NO PUEDE EVOLUCIONAR.';
    }
}

function obtenerEvolucion(chain) {
    evolucionar = document.querySelector('#evolucionar');

    let evolucion = chain.species.name;
    pokemonConsultado = searchInput.value;

    if (chain.evolves_to.length > 0) {  //Si hay evolucion, busca cual
        if (evolucion === pokemonConsultado) {
            evolucion = chain.evolves_to[0].species.name.toUpperCase();   //RECURSIVIDAD: evolves_to.evolves_to.evolves_to... .species.name
            return evolucion;
        }else {
            return obtenerEvolucion(chain.evolves_to[0]); //Retorna el nuevo valor de chain
        }
    } else {
        evolucion = 'NO PUEDE EVOLUCIONAR.';
    }
    return evolucion;
    ;
} 

async function perfilPokemon(nombre) {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nombre.toLowerCase()}`);
        const nombrePokemon = document.getElementById('nombrePokemon');
        const imagenPokemon = document.getElementById('imagenPokemon');
        const habilidades = document.getElementById('habilidades');

        const pokemonData = response.data;

        nombrePokemon.textContent = pokemonData.name.toUpperCase();
        imagenPokemon.setAttribute('src', pokemonData.sprites.other["official-artwork"].front_default);
        
        //Obtener Habilidades
        const habilidad = pokemonData.abilities.map(abilities => abilities.ability.name).join(', ');
        habilidades.innerHTML = `<strong>HABILIDADES</strong>: ${habilidad.toUpperCase()}.`;

        const speciesURL = pokemonData.species.url;
        descripcionPokemon(speciesURL);
    } catch (error) {
        nombrePokemon.innerHTML = `EL Pokemon <strong>${nombre}</strong> no existe. Verificar el nombre ingresado.`;
        nombrePokemon.innerHTML = nombrePokemon.innerHTML.toUpperCase();
        imagenPokemon.setAttribute('src','');
        habilidades.innerHTML = ''; // Limpia el contenido
    }
}


document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.getElementById("searchInput");
    const suggestionsList = document.getElementById("suggestionsList");
    const searchButton = document.querySelector(".search-button");

    searchInput.addEventListener("input", async function () {
        const inputValue = searchInput.value.toLowerCase();

        // Filtra las sugerencias según el valor de entrada
        const filteredSuggestions = await obtenerNombresPaginados(0, 1000); // Ajusta el límite según tus necesidades
        const filteredResults = filteredSuggestions.filter(item => item.toLowerCase().includes(inputValue));

        // Muestra las sugerencias filtradas
        displaySuggestions(filteredResults);
    });

    //Buscar al presionar ENTER
    searchInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            const inputValue = searchInput.value.toLowerCase();
            perfilPokemon(inputValue);
            suggestionsList.innerHTML = "";
        }
    });

    //Buscar al dar clic en botton (Lupa)
    searchButton.addEventListener("click", function () {
        const inputValue = searchInput.value.toLowerCase();
        perfilPokemon(inputValue);
    });

    document.addEventListener("click", function (e) {
        if (!suggestionsList.contains(e.target)) {
            suggestionsList.innerHTML = "";
        }
    });

    function displaySuggestions(suggestions) {
        suggestionsList.innerHTML = "";

        suggestions.forEach(function (suggestion) {
            const listItem = document.createElement("li");
            listItem.textContent = suggestion;
            listItem.addEventListener("click", function () {
                searchInput.value = suggestion;
                suggestionsList.innerHTML = "";
            });
            suggestionsList.appendChild(listItem);
        });
    }
});
