const app = require("./app");
const { createServer } = require("http");
const { initSocketServer } = require("./sockets/socketServer");
const { testConnection /*, sequelize */ } = require("./config/db");

const port = process.env.PORT || 3000;

async function start() {
  try {
    await testConnection();
   
    const httpServer = createServer(app);
    const io = initSocketServer(httpServer);

    app.set("io", io);

    httpServer.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();