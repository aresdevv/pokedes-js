const pokedex = document.querySelector("#pokedex");
const modal = document.getElementById("modal");
const contenidoModal = document.getElementById("contenidoModal");
const cerrarModal = document.getElementById("cerrarModal");
const botonesGeneracion = document.getElementById("botonesGeneracion");

const loader = document.getElementById("loader");
const url = "https://pokeapi.co/api/v2/pokemon?limit=30";

const inputGeneracion = document.getElementById("inputGeneracion");
const buscarGeneracion = document.getElementById("buscarGeneracion");

botonesGeneracion.addEventListener("click", async (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const gen = e.target.dataset.gen;
  await fetchAndDisplayGeneration(gen);
});

buscarGeneracion.addEventListener("click", async () => {
  const gen = inputGeneracion.value;
  if (!gen || isNaN(gen) || parseInt(gen) < 1) {
    alert("Por favor, introduce un número de generación válido.");
    return;
  }
  await fetchAndDisplayGeneration(parseInt(gen));
});

async function fetchAndDisplayGeneration(gen) {
  try {
    const respuesta = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
    if (!respuesta.ok) {
      alert(`No se encontró la generación ${gen}. Por favor, intenta con un número válido.`);
      console.error(`Error fetching generation ${gen}:`, respuesta.statusText);
      return;
    }
    const datos = await respuesta.json();

    const nombres = datos.pokemon_species.map((p) => p.name);

    // Limpiar pokedex
    pokedex.innerHTML = "";

    // Buscar URL de cada Pokémon (la PokéAPI no la da directamente en este caso)
    // Por eso se debe hacer un fetch por nombre
    mostrarPokemones(
      nombres.map((name) => ({
        name,
        url: `https://pokeapi.co/api/v2/pokemon/${name}`,
      })),
    );
  } catch (error) {
    console.error("Error al obtener datos de la generación:", error);
    alert("Ocurrió un error al cargar la generación. Inténtalo de nuevo más tarde.");
  }
}

cerrarModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

async function obtenerPokemones() {
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    console.log(datos.results);
    mostrarPokemones(datos.results);
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
  }
}

async function mostrarPokemones(lista) {
  loader.classList.remove("hidden"); // Mostrar el spinner
  pokedex.innerHTML = ""; // Limpiar tarjetas anteriores
  const tarjetas = await Promise.all(
    lista.map(async (pokemon) => {
      try {
        const respuesta = await fetch(pokemon.url);

        if (!respuesta.ok) {
          console.warn(`No se encontró el Pokémon en la URL: ${pokemon.url}`);
          return null;
        }

        const datos = await respuesta.json();

        const tarjeta = document.createElement("div");
        tarjeta.classList.add(
          "card",
          "bg-zinc-800",
          "p-4",
          "rounded-xl",
          "text-white",
          "cursor-pointer",
        );

        tarjeta.innerHTML = `
        <img src="${datos.sprites.front_default}" class="mx-auto" />
        <h2 class="text-center mt-2 capitalize">${datos.name}</h2>
      `;

        tarjeta.addEventListener("click", async () => {
          loader.classList.remove("hidden");

          const especieResp = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${datos.id}`,
          );
          const especieDatos = await especieResp.json();

          const descripcion =
            especieDatos.flavor_text_entries.find(
              (entry) => entry.language.name === "es",
            )?.flavor_text || "Sin descripción disponible.";

          contenidoModal.innerHTML = `
          <img src="${datos.sprites.other["official-artwork"].front_default}" class="mx-auto mb-4 w-32" />
          <h2 class="text-2xl capitalize text-yellow-300 text-center mb-2">${datos.name}</h2>
          <p class="italic text-sm text-zinc-300 mb-2">"${descripcion}"</p>
          <p><strong>ID:</strong> ${datos.id}</p>
          <p><strong>Altura:</strong> ${datos.height / 10} m</p>
          <p><strong>Peso:</strong> ${datos.weight / 10} kg</p>
          <p><strong>Tipos:</strong> ${datos.types.map((t) => t.type.name).join(", ")}</p>
          <p><strong>Habilidades:</strong> ${datos.abilities.map((a) => a.ability.name).join(", ")}</p>
        `;

          loader.classList.add("hidden");
          modal.classList.remove("hidden");
        });

        return tarjeta;
      } catch (error) {
        console.error(`Error al obtener datos de ${pokemon.name}:`, error);
        return null;
      }
    }),
  );

  tarjetas.filter(Boolean).forEach((tarjeta) => pokedex.appendChild(tarjeta));
  loader.classList.add("hidden"); // Ocultar el spinner al finalizar
}

// obtenerPokemones();
