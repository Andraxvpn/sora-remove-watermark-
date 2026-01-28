export default {
  async fetch(request) {
    const url = new URL(request.url);

    // ================= BACKEND =================
    if (url.pathname === "/api/get-video" && request.method === "POST") {
      const { urls } = await request.json();
      const results = [];

      for (const link of urls) {
        const res = await fetch("https://online.fliflik.com/get-video-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: link }),
        });

        const json = await res.json();
        results.push(json.data || null);
      }

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ================= FRONTEND =================
    return new Response(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Video Downloader</title>
<style>
body{background:#020617;color:#fff;font-family:sans-serif;padding:20px}
textarea{width:100%;height:120px;background:#020617;color:#fff;border:1px solid #334155;padding:10px}
button{margin-top:10px;padding:10px 16px;background:#2563eb;color:white;border:none}
.grid{margin-top:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.card{background:#020617;border:1px solid #334155;padding:10px}
video{width:100%}
a{display:block;margin-top:8px;background:#16a34a;color:white;text-align:center;padding:8px;text-decoration:none}
.error{color:#f87171}
</style>
</head>
<body>

<h2>Video Downloader</h2>
<textarea id="links" placeholder="1 link per baris"></textarea>
<br>
<button onclick="go()">Proses</button>

<div id="out" class="grid"></div>

<script>
async function go(){
  const out = document.getElementById("out");
  out.innerHTML = "Loading...";

  const urls = document.getElementById("links").value
    .split("\\n").map(v=>v.trim()).filter(Boolean);

  const res = await fetch("/api/get-video", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({urls})
  });

  const data = await res.json();
  out.innerHTML = "";

  data.forEach(d=>{
    let videoUrl = null;

    if (d?.url) videoUrl = d.url;
    else if (d?.video?.[0]?.url) videoUrl = d.video[0].url;

    const div = document.createElement("div");
    div.className = "card";

    if (!videoUrl){
      div.innerHTML = '<div class="error">Gagal mengambil video</div>';
    } else {
      div.innerHTML = \`
        <video controls src="\${videoUrl}"></video>
        <a href="\${videoUrl}" download>Download</a>
      \`;
    }

    out.appendChild(div);
  });
}
</script>

</body>
</html>`, {
      headers: { "Content-Type": "text/html" },
    });
  },
};
