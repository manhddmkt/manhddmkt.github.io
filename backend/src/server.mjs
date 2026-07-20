import { createAppServer } from "./app.mjs";

const server = createAppServer();
const port = Number.parseInt(process.env.PORT || "8080", 10);

server.listen(port, "0.0.0.0", () => {
  console.log(`Ownex API proxy listening on port ${port}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
