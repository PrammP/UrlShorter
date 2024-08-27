document.getElementById("sending").addEventListener("click", fetchData);

async function fetchData() {
  const urlInput = document.getElementById("url").value;

  if (!urlInput) {
    alert("Veuillez entrer une URL.");
    return;
  }

  try {
    const response = await fetch("/insert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: urlInput }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création du lien raccourci.");
    }

    const data = await response.json();
    displayResult(data);
  } catch (error) {
    console.error("Erreur:", error);
    document.getElementById("result").innerText =
      "Erreur lors de la création du lien raccourci.";
  }
}

function displayResult(data) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <p>URL originale: ${data.originalUrl}</p>
    <p>Lien raccourci: <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a></p>
  `;
}
