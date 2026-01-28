export default {
  async fetch(request) {
    const url = new URL(request.url);

    // =========================
    // BACKEND PROXY (KURIR)
    // =========================
    if (url.pathname === "/api/get-video" && request.method === "POST") {
      try {
        const { urls } = await request.json();

        if (!Array.isArray(urls)) {
          return new Response(JSON.stringify({ error: "Invalid input" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const results = [];

        // eksekusi BERGANTIAN
        for (const link of urls) {
          const res = await fetch(
            "https://online.fliflik.com/get-video-link",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ url: link }),
            }
          );

          const json = await res.json();
          results.push(json.data || null);
        }

        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // =========================
    // FRONTEND
    // =========================
    return new Response(
      `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>Video Downloader</title>
<style>
body {
  background:#0f172a;
  color:#e5e7eb;
  font-family:Arial,sans-serif;
  padding:20px;
}
textarea {
  width:100%;
  height:120px;
  background:#020617;
  color:#fff;
  border:1px solid #334155;
  padding:10px;
}
button {
  margin-top:10px;
  padding:10px 16px;
  background:#2563eb;
  color:white;
  border:none;
  cursor:pointer;
}
.grid {
  margin-top:20px;
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
  gap:16px;
}
.card {
  background:#020617;
  padding:10px;
  border:1px solid #334155;
}
video {
  width:100%;
}
a {
  display:block;
  margin-top:8px;
  background:#16a34a;
  color:white;
  text-align:center;
  padding:8px;
  text-decoration:none;
}
</style>
</head>
<body>

<h2>Video Downloader</h2>
<p>Masukkan link (1 link per baris)</p>

<textarea id="links"></textarea>
<br />
<button onclick="submitLinks()">Proses</button>

<div class="grid" id="result"></div>

<script>
async function submitLinks() {
  const textarea = document.getElementById("links");
  const links = textarea.value
    .split("\\n")
    .map(l => l.trim())
    .filter(l => l);

  if (links.length === 0) {
    alert("Masukkan minimal 1 link");
    return;
  }

  document.getElementById("result").innerHTML = "Loading...";

  const res = await fetch("/api/get-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls: links })
  });

  const data = await res.json();
  const container = document.getElementById("result");
  container.innerHTML = "";

  data.forEach(item => {
    if (!item || !item.url) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = \`
      <video controls src="\${item.url}"></video>
      <a href="\${item.url}" download>Download</a>
    \`;

    container.appendChild(card);
  });
}
</script>

</body>
</html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  },
};
