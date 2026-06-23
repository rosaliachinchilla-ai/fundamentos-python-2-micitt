async function loadLabs() {
  const container = document.getElementById("labsContainer");

  try {
    const response = await fetch("data/labs.json");
    const labs = await response.json();

    container.innerHTML = labs.map(lab => `
      <article class="card">
        <p class="tag">${lab.module}</p>
        <h3>${lab.title}</h3>
        <p>${lab.topic}</p>
        <p><strong>Fecha:</strong> ${lab.classDate}</p>
        <p><strong>Estado:</strong> ${lab.status}</p>
        <a class="button" href="${lab.path}">Abrir laboratorio</a>
      </article>
    `).join("");
  } catch (error) {
    container.innerHTML = `<p>No se pudieron cargar los laboratorios.</p>`;
    console.error(error);
  }
}

loadLabs();