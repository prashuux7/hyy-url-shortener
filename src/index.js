const page = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HYY URL Shortener</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#101827;color:white;font-family:Arial;padding:40px 15px}
.box{max-width:450px;margin:60px auto;background:#1e293b;padding:25px;border-radius:16px}
h1{color:#21c982}
input,button{width:100%;padding:14px;margin-top:12px;border:0;border-radius:8px}
button{background:#21c982;font-weight:bold;cursor:pointer}
#result{margin-top:20px;overflow-wrap:anywhere}
a{color:#21c982}
</style>
</head>
<body>
<div class="box">
<h1>HYY URL Shortener</h1>
<p>Make your long links short.</p>
<input id="url" placeholder="Paste your long URL">
<button onclick="shorten()">Shorten URL</button>
<div id="result"></div>
</div>
<script>
async function shorten(){
 const url=document.getElementById("url").value.trim();
 const result=document.getElementById("result");
 result.textContent="Creating...";
 try{
  const r=await fetch("/api/shorten",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({url})
  });
  const d=await r.json();
  result.innerHTML=d.shortUrl
   ? '<a href="'+d.shortUrl+'">'+d.shortUrl+'</a><button onclick="navigator.clipboard.writeText(\\''+d.shortUrl+'\\')">Copy Link</button>'
   : d.error;
 }catch(e){result.textContent="Something went wrong";}
}
</script>
</body>
</html>`;

function json(data,status=200){
 return new Response(JSON.stringify(data),{
  status,
  headers:{"Content-Type":"application/json"}
 });
}

export default {
 async fetch(request,env){
  const url=new URL(request.url);

  if(url.pathname==="/" && request.method==="GET"){
   return new Response(page,{headers:{"Content-Type":"text/html"}});
  }

  if(url.pathname==="/api/shorten" && request.method==="POST"){
   try{
    const body=await request.json();
    const original=new URL(body.url);

    if(!["http:","https:"].includes(original.protocol)){
     return json({error:"Only HTTP/HTTPS URLs allowed"},400);
    }

    const code=crypto.randomUUID().replace(/-/g,"").slice(0,7);

    await env.DB.prepare(
     "INSERT INTO links (code,original_url) VALUES (?,?)"
    ).bind(code,original.href).run();

    return json({shortUrl:url.origin+"/"+code});
   }catch{
    return json({error:"Please enter a valid URL"},400);
   }
  }

  if(request.method==="GET" && /^\/[a-zA-Z0-9]{7}$/.test(url.pathname)){
   const code=url.pathname.slice(1);
   const link=await env.DB.prepare(
    "SELECT original_url FROM links WHERE code=?"
   ).bind(code).first();

   if(!link)return new Response("Link not found",{status:404});

   await env.DB.prepare(
    "UPDATE links SET clicks=clicks+1 WHERE code=?"
   ).bind(code).run();

   return Response.redirect(link.original_url,302);
  }

  return new Response("Not Found",{status:404});
 }
};
