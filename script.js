let nome;
let destinatario = "Todos";
let visibilidade = "message";

function abrirMenu() {
  const fundoMenu = document.querySelector(".fundoMenu");
  fundoMenu.classList.toggle('escondido');
  const menu = document.querySelector(".menu");
  menu.classList.toggle('escondido');
}

function salvarNome() {
  nome = prompt("Digite seu nome:");

  if (nome === "" || nome === null) {
    salvarNome();
  } else {
    registrarUsuario();
  }
}

salvarNome();

function registrarUsuario() {
  const dados = { name: nome };

  axios.post("https://mock-api.driven.com.br/api/v6/uol/participants/3ad669c7-4663-4d85-a022-2f1317193b0e", dados)
    .then(function () {
      entrarNoChat();
    })
    .catch(function () {
      salvarNome();
    });
}

function entrarNoChat() {
  carregarMensagens();
  carregarUsuarios();
  manterConexao();

  setInterval(carregarMensagens, 3000);
  setInterval(carregarUsuarios, 10000);
}

function manterConexao() {
  setInterval(function () {
    axios.post("https://mock-api.driven.com.br/api/v6/uol/status/3ad669c7-4663-4d85-a022-2f1317193b0e", { name: nome });
  }, 5000);
}

function carregarMensagens() {
  axios.get("https://mock-api.driven.com.br/api/v6/uol/messages/3ad669c7-4663-4d85-a022-2f1317193b0e").then(function (response) {
    const listaMensagens = document.querySelector(".chat .mensagem");
    listaMensagens.innerHTML = "";

    for (var i = 0; i < response.data.length; i++) {
      var msg = response.data[i];
      var classeMensagem = "";

      if (msg.type === "private_message") {
        classeMensagem = "reservada";
      } else {
        classeMensagem = "publica";
      }

      if (msg.type === "private_message" && msg.to !== nome && msg.from !== nome) {
        continue;
      }

      var horarioMensagem = msg.time;

      listaMensagens.innerHTML += `
        <li class="${classeMensagem}">
          <span class="hora">(${horarioMensagem})</span>
          <strong>${msg.from}</strong> para <strong>${msg.to}</strong>: ${msg.text}
        </li>
      `;
    }

    let ultimaMensagem = listaMensagens.lastElementChild;
    if (ultimaMensagem) {
      ultimaMensagem.scrollIntoView();
    }
  });
}

function carregarUsuarios() {
  axios.get("https://mock-api.driven.com.br/api/v6/uol/participants/3ad669c7-4663-4d85-a022-2f1317193b0e").then(function (response) {
    const listaUsuarios = document.querySelector(".menu .contatos");

    listaUsuarios.innerHTML = `
      <li class="contato" onclick="selecionarContato(this, 'Todos')">
        <div>
          <ion-icon name="people-sharp"></ion-icon>
          <strong>Todos</strong>
          <span class="check"></span>
        </div>
      </li>
    `;

    for (var i = 0; i < response.data.length; i++) {
      var user = response.data[i];
      var checkClass = "";

      if (destinatario === user.name) {
        checkClass = "selecionado";
      }

      listaUsuarios.innerHTML += `
        <li class="contato" onclick="selecionarContato(this, '${user.name}')">
          <div>
            <ion-icon name="person-circle"></ion-icon>
            <strong>${user.name}</strong>
            <span class="check ${checkClass}">
              <ion-icon name="checkmark-outline"></ion-icon>
            </span>
          </div>
        </li>
      `;
    }
  });
}

function enviarMensagem() {
  const input = document.querySelector(".entradaMensagem .mensagem");
  const texto = input.value;

  if (texto === "" || texto === null) {
    return;
  }

  const mensagem = {
    from: nome,
    to: destinatario,
    text: texto,
    type: visibilidade,
  };

  axios.post("https://mock-api.driven.com.br/api/v6/uol/messages/3ad669c7-4663-4d85-a022-2f1317193b0e", mensagem)
    .then(function () {
      input.value = ""; 
      carregarMensagens();
    })
    .catch(function () {
      alert("Erro ao enviar mensagem!");
    });
}

function trocarVisibilidade(tipo) {
  if (tipo === "publico") {
    visibilidade = "message";
  } else {
    visibilidade = "private_message";
  }

  atualizarVisibilidade();
  atualizarDestinatario();
}

function atualizarVisibilidade() {
  let visibilidadePublico = document.querySelector(".visibilidade-publico .check");
  let visibilidadeReservado = document.querySelector(".visibilidade-reservado .check");

  if (visibilidade === "message") {
    visibilidadePublico.classList.add("selecionado");
    visibilidadeReservado.classList.remove("selecionado");
  } else {
    visibilidadePublico.classList.remove("selecionado");
    visibilidadeReservado.classList.add("selecionado");
  }
}

function selecionarContato(elemento, contato) {
  destinatario = contato;
  carregarUsuarios();
  atualizarDestinatario();
}

function atualizarDestinatario() {
  let destinatarioSelecionado = document.querySelector(".destinatario-selecionado");
  let tipoVisibilidade;

  if (visibilidade === "message") {
    tipoVisibilidade = "Público";
  } else {
    tipoVisibilidade = "Reservado";
  }

  destinatarioSelecionado.textContent = "Enviando para: " + destinatario + " (" + tipoVisibilidade + ")";
}

document.querySelector("#botaoEnviar").addEventListener("click", enviarMensagem);
document.querySelector(".entradaMensagem .mensagem").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    enviarMensagem();
  }
});

document.querySelector(".visibilidade-publico").addEventListener("click", function () {
  trocarVisibilidade("publico");
});

document.querySelector(".visibilidade-reservado").addEventListener("click", function () {
  trocarVisibilidade("reservado");
});