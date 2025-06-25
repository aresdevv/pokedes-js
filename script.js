const pokedex = document.querySelector("#pokedex");
const modal = document.getElementById("modal");
const contenidoModal = document.getElementById("contenidoModal");
const cerrarModal = document.getElementById("cerrarModal");
const botonesGeneracion = document.getElementById("botonesGeneracion");

const loader = document.getElementById("loader");
const url = "https://pokeapi.co/api/v2/pokemon?limit=30";

botonesGeneracion.addEventListener("click", async (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const gen = e.target.dataset.gen;
  const respuesta = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
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
});

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

  // Esperar 800ms antes de empezar (simula carga mínima)
  await new Promise((resolve) => setTimeout(resolve, 800));

  lista.forEach(async (pokemon) => {
    const respuesta = await fetch(pokemon.url);
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
      loader.classList.remove("hidden"); // Mostrar el spinner
      await new Promise((resolve) => setTimeout(resolve, 200));
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

      loader.classList.add("hidden"); // Ocultar spinner
      modal.classList.remove("hidden");
    });

    pokedex.appendChild(tarjeta);
  });

  loader.classList.add("hidden"); // Ocultar spinner
}

// obtenerPokemones();
