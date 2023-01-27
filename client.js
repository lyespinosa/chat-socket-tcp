const { Socket } = require("net");


const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const LEAVE = "/leave";

const error = (message) => {
  console.error(message);
  process.exit(1);
};

const connect = (host, port) => {
  console.log(`Conectando a --> ${host}:${port}`);

  const socket = new Socket();
  socket.connect({ host, port });
  socket.setEncoding("utf-8");

  socket.on("connect", () => {
    console.log("Te has conectado");

    readline.question("Escribe tu username: ", (username) => {
      
      socket.write(username);
      console.log(`Escribe algun mensaje, pon ${LEAVE} para salir`);
    });

    readline.on("line", (message) => {
      socket.write(message);
      if (message === LEAVE) {
        socket.end();
      }
    });

    socket.on("data", (data) => {
      console.log(data);
    });
  });

  socket.on("error", (err) => error(err.message));

  socket.on("close", () => {
    console.log("Desconectado");
    process.exit(0);
  });
};

const main = () => {
  if (process.argv.length !== 4) {
    error(`Error, debes escribir 'node nombreDelArchivo host port'`);
  }

  let [, , host, port] = process.argv;
  if (isNaN(port)) {
    error(`${port} es un puerto invalido`);
  }
  port = Number(port);

  connect(host, port);
};

if (module === require.main) {
  main();
}
