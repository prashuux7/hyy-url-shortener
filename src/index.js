export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>HYY URL Shortener</title>
          <style>
            body {
              background:#101827;
              color:white;
              font-family:Arial;
              text-align:center;
              padding:40px 15px;
            }
            .box {
              max-width:450px;
              margin:auto;
              background:#1e293b;
              padding:25px;
              border-radius:15px;
            }
            input,button {
              box-sizing:border-box;
              width:100%;
              padding:14px;
              margin-top:12px;
              border:0;
              border-radius:8px;
            }
            button {
              background:#21c982;
              font-weight:bold;
            }
            #result { margin-top:20px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>HYY URL Shortener</h1>
            <p>Make your links shorter.</p>
            <input id="longUrl" placeholder="Paste your long URL">
            <button onclick="shorten()">Shorten URL</button>
            <div id="result"></div>
          </div>
          <script>
            async function shorten() {
              const longUrl = document.getElementById("longUrl").value;
              const result = document.getElementById("result");

              result.innerText = "Creating...";

              try {
                const response = await fetch("/api/shorten", {
                  method: "POST",
                  headers: {"Content-Type":"application/json"},
                  body: JSON.stringify({url:longUrl})
                });

                const data = await response.json();
                result.innerText = data.shortUrl || data.error;
              } catch {
                result.innerText = "Something went wrong.";
              }
            }
          </script>
        </body>
        </html>
      `, {
        headers: {"Content-Type":"text/html"}
      });
    }

    return new Response("HYY URL Shortener");
  }
};
