export default {
  async fetch(request) {
    const url = new URL(request.url);

    /* ================= BACKEND ================= */
    if (url.pathname === "/api/get-video" && request.method === "POST") {
      const { urls } = await request.json();
      const results = [];

      for (const link of urls) {
        try {
          const res = await fetch("https://online.fliflik.com/get-video-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: link }),
          });

          const json = await res.json();
          results.push(json.data ?? null);
        } catch {
          results.push(null);
        }
      }

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    /* ================= FRONTEND ================= */
    return new Response(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Video Downloader</title>
<style>
body{
  background:#020617;
  color:#e5e7eb;
  font-family:system-ui;
  padding:20px;
}
h2{margin-bottom:5px}
textarea{
  width:100%;
  height:120px;
  background:#020617;
  color:#fff;
  border:1px solid #334155;
  padding:10px;
  border-radius:6px;
}
.actions{
  display:flex;
  gap:10px;
  margin-top:10px;
  flex-wrap:wrap;
}
button{
  padding:10px 16px;
  border:none;
  border-radius:6px;
  cursor:pointer;
  font-weight:600;
}
.primary{background:#2563eb;color:white}
.success{background:#16a34a;color:white}
.warn{background:#475569;color:white}
.grid{
  margin-top:20px;
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
  gap:16px;
}
.card{
  background:#020617;
  border:1px solid #334155;
  padding:10px;
  border-radius:8px;
  display:flex;
  flex-direction:column;
  gap:8px;
}
video{width:100%;border-radius:6px}
a{
  background:#22c55e;
  color:#000;
  text-align:center;
  padding:8px;
  border-radius:6px;
  text-decoration:none;
  font-weight:600;
}
.error{color:#f87171;font-size:13px}
.counter{
  margin-top:10px;
  color:#94a3b8;
}
</style>
</head>
<body>

<h2>Video Downloader</h2>
<div class="counter" id="counter">0 video siap</div>

<textarea id="links" placeholder="Tempel banyak link di sini (1 link per baris)"></textarea>

<div class="actions">
  <button class="primary" onclick="proses()">Proses Link</button>
  <button class="success" onclick="downloadAll()">Download Semua</button>
  <button class="warn" onclick="clearAll()">Clear</button>
</div>

<div id="out" class="grid"></div>

<script>
let allVideos = [];

async function proses(){
  const textarea = document.getElementById("links");
  const urls = textarea.value.split("\\n").map(v=>v.trim()).filter(Boolean);
  if(urls.length === 0) return;

  textarea.value = "";
  const res = await fetch("/api/get-video",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({urls})
  });

  const data = await res.json();

  data.forEach(d=>{
    let videoUrl=null;
    if(typeof d==="string") videoUrl=d;
    else if(d?.url) videoUrl=d.url;
    else if(d?.video?.[0]?.url) videoUrl=d.video[0].url;

    const card=document.createElement("div");
    card.className="card";

    if(!videoUrl){
      card.innerHTML='<div class="error">Gagal ambil video</div>';
    }else{
      allVideos.push(videoUrl);
      card.innerHTML=\`
        <video controls src="\${videoUrl}"></video>
        <a href="\${videoUrl}" download>Download</a>
      \`;
    }
    document.getElementById("out").appendChild(card);
  });

  updateCounter();
}

function downloadAll(){
  if(allVideos.length===0){
    alert("Belum ada video");
    return;
  }
  allVideos.forEach(url=>{
    const a=document.createElement("a");
    a.href=url;
    a.download="";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

function clearAll(){
  document.getElementById("out").innerHTML="";
  allVideos=[];
  updateCounter();
}

function updateCounter(){
  document.getElementById("counter").innerText =
    allVideos.length + " video siap";
}
</script>

</body>
</html>`, {
      headers: { "Content-Type": "text/html" },
    });
  },
};
