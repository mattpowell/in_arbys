var nStatic = require("node-static"),
    path = require("path"),
    Seq = require("seq"),
    fs = require("fs"),
    http = require("http"),
    sys = require("sys"),
    fileServer = new nStatic.Server(path.normalize("" + __dirname + "/public")),
    arbys_head = path.normalize("./wrap/head.html"),
    arbys_foot = path.normalize("./wrap/foot.html"),
    arbys_main = path.normalize("./arbys.html");

Seq()
.par(function() {
  // load head
  fs.readFile(arbys_head, this);
})
.par(function() {
  // load foot
  fs.readFile(arbys_foot, this);
})
.par(function() {
  // load body
  fs.readFile(arbys_main, this);
})
.seq(function(head, foot, body) {
  // start server on port 3000
  // if not a static file in our repo, then hand out arbys page
  http.createServer(function(request, response) {
    fileServer.serve(request, response, function(err, result) {
      if ((err != null ? err.status : void 0) === 404) {
        // not a static file
        return response.end([head, body, foot].join("\n"));
      } else if (err != null) {
        sys.error("Error serving " + request.url + " - " + request.message);
        response.writeHead(err.status, err.headers);
        return response.end;
      }
    });
  }).listen(3000);
  sys.log("Server listening on port 3000");
});