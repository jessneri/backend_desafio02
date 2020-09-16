const Koa = require("koa");
const bodyparser = require("koa-bodyparser");

const server = new Koa();
server.use(bodyparser());

const produto = {
    id: 12345,
    nome: "mouse",
    qtd: 2,
    valor: 1500,
    deletado: false
}

const listaDeProdutos = [{
    id: 12345,
    nome: "mouse",
    qtd: 2,
    valor: 1500,
    deletado: false
}];

// criar novo produto
const adicionarProdutos = (produto) => {
    const novoProduto = {
        id: produto.id ? produto.id : "Id não informado",
        nome: produto.nome ? produto.nome : "Nome não informado",
        qtd: produto.qtd ? produto.qtd : "Quantidade não informada",
        valor: produto.valor ? produto.valor : "Valor não informado",
        deletado: false
    }

    listaDeProdutos.push(novoProduto);
    return novoProduto;
}

//Obter todos os produtos
const obterListaDeProdutos = () => {
    const listaSemDeletados = [];

    listaDeProdutos.forEach(elemento => {
        if (elemento.deletado === false) {
            listaSemDeletados.push(elemento);
        }
    })
    return listaSemDeletados;
}

//obter informações de um produto
const obterProduto = (id) => {

    for (let i = 0; i < listaDeProdutos.length; i++) {
        if (id == listaDeProdutos[i].id) {
            return {
                info: listaDeProdutos[i],
                index: i
            };
        } else {

            return "Produto não existente!";
        }
    }
}

//atualizar um produto
const atualizarProduto = (id, propriedade) => {
    const produto = obterProduto(id);
    const produtoAtualizado = {
        id: produto.info.id,
        nome: produto.info.nome,
        qtd: propriedade,
        valor: produto.info.valor,
        deletado: produto.info.deletado
    }

    console.log(produtoAtualizado);
    if (produto) {
        listaDeProdutos.splice(produto.index, 1, produtoAtualizado);
        return produtoAtualizado;

    } else {
        return false;
    }

}

//deletar um produto
const deletarProduto = (id) => {
    const produto = obterProduto(id);
    console.log(produto)
    if (produto !== "Produto não existente!") {
        listaDeProdutos.splice(produto.info, 1);
        return true;
    } else {
        return false;
    }
}

server.use((ctx) => {
    /*ctx.status = 200;
    ctx.body = "Rodando!";*/
    const method = ctx.method;
    const path = ctx.url;
    if (path === "/products") {
        if (method === "POST") {
            ctx.status = 200;
            const produto = adicionarProdutos(ctx.request.body);
            ctx.body = produto;
        } else if (method === "GET") {
            ctx.body = obterListaDeProdutos();
        }
    } else if (path.includes("/products/")) {
        const pathQuebrado = path.split("/");
        if (pathQuebrado[1] === "products") {
            const id = pathQuebrado[2];
            if (method === "GET") {
                ctx.body = obterProduto(id)
            } else if (method === "DELETE") {
                const resposta = deletarProduto(id);
                console.log(resposta)
                if (resposta) {
                    ctx.body = "Produto deletado com sucesso!";
                } else {
                    ctx.body = "Produto já deletado.";
                }
            } else if (method === "PUT") {
                if (id) {
                    const body = ctx.request.body;
                    const propriedade = body.propriedade;
                    const resultado = atualizarProduto(id, propriedade);

                    if (resultado) {
                        ctx.body = resultado;
                    } else {
                        ctx.status = 403;
                        ctx.body = "Não foi possível atualizar o produto."
                    }
                }
            } else {
                ctx.status = 404;
                ctx.body = "Não encontrado";
            }
        }
    } else {
        ctx.status = 404;
        ctx.body = "Não encontrado";
    }
});


server.listen(8081, () => console.log("Rodando porta 8081!"));

module.exports = {
    adicionarProdutos: adicionarProdutos,
    obterListaDeProdutos: obterListaDeProdutos,
    obterProduto: obterProduto,
    atualizarProduto: atualizarProduto,
    deletarProduto: deletarProduto
};