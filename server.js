const { Server } = require("net");
const { networkInterfaces } = require('os');

const host = "0.0.0.0";
const LEAVE = "/leave";

const ip = Object.values(networkInterfaces())
            .flat()
            .find((i) => i?.family === 'IPv4' && !i?.internal)?.address;

const users = new Map();

const sendMessage = (message, origin) => {
  for (const socket of users.keys()) {
    if (socket !== origin) {
      socket.write(message);
    }
  }
};

const error = (message) => {
  console.error(message);
  process.exit(1);
};

const listen = (port) => {
  const server = new Server();

  server.on("connection", (socket) => {
    const socketData = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`Nueva conexion desde ${socketData}`);
    socket.setEncoding("utf-8");

    socket.on("data", (message) => {
      users.values();
      if (!users.has(socket)) {
        console.log(`Username ${message} se ha conectado desde ${socketData}`);
        for(const username of users.values()){
          if(username == message){
            socket.write('Este username ya existe');
            users.delete(socket)
            socket.end()
          }
        }
        users.set(socket, message);
      } else if (message === LEAVE) {
        sendMessage(`*[${users.get(socket)}] ha salido del chat* `, socket)
        users.delete(socket);
        socket.end();
      } else {
        const fullMessage = `[${users.get(socket)}]: ${message}`;
        //console.log(`${socketData} -> ${fullMessage}`);
        sendMessage(fullMessage, socket);
      }
    });

    socket.on("error", (err) => console.error(err));

    socket.on("close", () => {
      console.log(`El usuario desde ${socketData} se ha desconectado`);
      
    });
  });

  server.listen({ port, host }, () => {
    console.log("Listening on port 8000");
    console.log(`Server Ip address ${ip}`)
  });

  server.on("error", (err) => error(err.message));
};

const main = () => {
  if (process.argv.length !== 3) {
    error(`Error: debes escribir 'node nombreDelArchivo port'`);
  }

  let port = process.argv[2];
  if (isNaN(port)) {
    error(`Invalid port ${port}`);
  }

  port = Number(port);

  listen(port);
};

if (require.main === module) {
  main();
}
