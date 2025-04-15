const { exec } = require("node:child_process");

function checkPostgres() {
  exec(
    "docker exec database_clone-tabnews pg_isready --host localhost",
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
