const { exec } = require("node:child_process");

function checkPostgres() {
  exec(
    "docker exec clone-tabnews-database pg_isready --host localhost",
    handlerReturn,
  );

  function handlerReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      checkPostgres();
      return;
    }

    console.log("🟢 Postgres está pronto e aceitando conexões");
  }
}

console.log("🔴 Aguardando Postgres aceitar conexões");
checkPostgres();
