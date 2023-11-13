const consumeApiWithAxios = async (url) => {
    try {
        const response = await axios.get(url);
        console.log(`La petición a la API se completó correctamente con status: ${response.status}`);
        return response.data.results; // Devolver response.data.results en lugar de response.results
    } catch (error) {
        console.error(`Falló la petición a la API con error: ${error.message}`);
        return []; // Devolver un array vacío en caso de error para evitar problemas más adelante
    }
}

async function procesarNombres(resp) {
    try {
        const respApi = await resp;
        const nombres = respApi.map(item => item.name); // Mapea los nombres desde el array de objetos
        return nombres; // Devuelve los nombres
    } catch (error) {
        console.error(`Error al procesar la respuesta: ${error.message}`);
        return [];
    }
}

async function obtenerNombresPaginados(offset, limit) {
    const url = `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`;
    const respuestaPeticion = consumeApiWithAxios(url);
    return await procesarNombres(respuestaPeticion);
}

async function perfilPokemon(nombre) {
    axios.get(`https://pokeapi.co/api/v2/pokemon/${nombre.toLowerCase()}`)
        .then((response) => {
            const nombrePokemon = document.getElementById('nombrePokemon');
            const imagenPokemon = document.getElementById('imagenPokemon')

            const pokemonData = response.data;

            nombrePokemon.textContent = `${pokemonData.name}`;
            nombrePokemon.textContent = nombrePokemon.textContent.toUpperCase();
            imagenPokemon.setAttribute('src', pokemonData.sprites.other["official-artwork"].front_default);
        })
        .catch((error) => {
            nombrePokemon.textContent = `No hay coincidencia con ${nombre}. Por favor, verifica el nombre del Pokemon.`;
            nombrePokemon.textContent = nombrePokemon.textContent.toUpperCase();
            imagenPokemon.setAttribute('src',''); //Quitar la imagen
        });
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
