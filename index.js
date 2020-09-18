const Koa = require("koa");
const bodyparser = require("koa-bodyparser");

const server = new Koa();
server.use(bodyparser());

//formatação de sucesso
const formatarSucesso = (ctx, dados, status) => {
    ctx.status = status;
    ctx.body = {
        status: "sucesso",
        dados: dados,
    };
};

//formatação de erro
const formatarErro = (ctx, mensagem, status) => {
    ctx.status = status;
    ctx.body = {
        status: "erro",
        dados: {
            mensagem: mensagem,
        },
    };
};

const calcularTotalDoPedido = (produtosDoPedido) => {
    let total = 0;
    produtosDoPedido.forEach(prod => {
        total += (prod.qtd * prod.valor);
    });

    return total;
};

const produto = {
    id: 12345,
    nome: "mouse",
    qtd: 5,
    valor: 1500,
    deletado: false
}

const estoque = [];
estoque.push(produto)


// criar novo produto
const adicionarProdutos = (produto) => {
    const novoProduto = {
        id: produto.id ? produto.id : "Id não informado",
        nome: produto.nome ? produto.nome : "Nome não informado",
        qtd: produto.qtd ? produto.qtd : "Quantidade não informada",
        valor: produto.valor ? produto.valor : "Valor não informado",
        deletado: false
    }

    estoque.push(novoProduto);
    return novoProduto;
}

//Obter todos os produtos
const obterListaDeProdutos = () => {
    const listaSemDeletados = [];

    estoque.forEach(elemento => {
        if (elemento.deletado === false && elemento.qtd != 0) {
            listaSemDeletados.push(elemento);
        }
    })
    return listaSemDeletados;

}

//obter informações de um produto
const obterProduto = (id) => {

    for (let i = 0; i < estoque.length; i++) {
        if (id == estoque[i].id) {
            return {
                info: estoque[i],
                index: i
            };
        }
    }
    return false;
}


//atualizar um produto
const atualizarProduto = (id, nome, quantidade, novovalor) => {
    const produto = obterProduto(id);

    console.log(produto);
    if (produto !== false) {
        const produtoAtualizado = {
            id: produto.info.id,
            nome: nome,
            qtd: quantidade,
            valor: novovalor,
            deletado: produto.info.deletado
        }
        estoque.splice(produto.index, 1, produtoAtualizado);
        return produtoAtualizado;

    } else {
        return "Produto não existente!";
    }

}

//deletar um produto
const deletarProduto = (id) => {
    const produto = obterProduto(id);

    if (produto !== false) {
        estoque.splice(produto, 1);
        return true;
    } else {
        return "Produto não existente!";
    }
}


/**
 * abaixo ficam as funções para "pedidos"
 */

/*const pedido = {
    id: 1,
    produtos: [],
    estado: "Incompleto",
    idCliente: "123",
    deletado: false,
    valorTotal: 0
}*/

const listaDePedidos = [];
//listaDePedidos.push(pedido);


//Obter todos os pedidos
const obterListaDePedidos = () => {
    const listaSemDeletados = [];

    listaDePedidos.forEach(elemento => {
        if (elemento.deletado === false) {
            listaSemDeletados.push(elemento);
        }
    })
    return listaSemDeletados;
}


// criar novo pedido
const adicionarPedidos = (pedido, id, nome, quantidade, novovalor) => {

    if (!pedido.produtos) {
        return null;
    }

    let prodEstoqueArray = [];
    console.log(estoque);
    estoque.forEach((prodEstoque, i) => {
        pedido.produtos.forEach((prodPedido, i) => {
            //se id é igual ao estoque
            if (prodEstoque.id === prodPedido.id) {
                if (prodEstoque.qtd > 0 && prodEstoque.qtd >= prodPedido.qtd) {
                    prodEstoqueArray.push(prodEstoque);
                    prodEstoque.qtd = prodEstoque.qtd - prodPedido.qtd;

                }
            }
        });
        atualizarProduto(id, nome, quantidade, novovalor)
    });

    if (prodEstoqueArray.length === pedido.produtos.length) {
        const novoPedido = {
            id: pedido.id ? pedido.id : "Id não informado",
            produtos: pedido.produtos,
            estado: pedido.estado,
            idCliente: pedido.idCliente ? pedido.idCliente : "Cliente não informado",
            deletado: false,
            valorTotal: calcularTotalDoPedido(prodEstoqueArray)
        }



        listaDePedidos.push(novoPedido);
        return novoPedido;
    } else {
        return null;
    }


}



const caminhos = (ctx) => {
    const path = ctx.url;
    const method = ctx.method;
    const pathQuebrado = path.split("/");

    if (path === "/products") {
        if (method === "POST") {
            formatarSucesso(ctx, adicionarProdutos(ctx.request.body), 201);

        } else if (method === "GET") {
            formatarSucesso(ctx, obterListaDeProdutos(), 200)
        } else {
            formatarErro(ctx, "Método não permitido.", 405)
        }
    } else if (path.includes("/products/")) {
        if (pathQuebrado[1] === "products") {
            const id = pathQuebrado[2];
            if (method === "GET") {
                formatarSucesso(ctx, obterProduto(id), 200);

            } else if (method === "DELETE") {
                const resposta = deletarProduto(id);
                if (resposta === true) {
                    formatarSucesso(ctx, "Produto deletado com sucesso!", 200);

                } else {
                    formatarErro(ctx, "Produto já deletado.", 404)

                }
            } else if (method === "PUT") {
                if (id) {
                    const body = ctx.request.body;
                    const nome = body.nome;
                    const quantidade = body.quantidade;
                    const novovalor = body.novovalor;
                    const resultado = atualizarProduto(id, nome, quantidade, novovalor);

                    if (resultado) {
                        formatarSucesso(ctx, resultado, 200);
                    } else {
                        formatarErro(ctx, "Não foi possível atualizar o produto.", 403)

                    }
                }
            } else {
                formatarErro(ctx, "Conteúdo não encontrado.", 404)

            }
        }
    } else if (path === "/orders") {
        switch (method) {
            case "GET":
                ctx.body = obterListaDePedidos();
                break;
            case "POST":
                const adicionar = adicionarPedidos(ctx.request.body);
                if (adicionar) {
                    formatarSucesso(ctx, adicionar, 201);
                } else {
                    formatarErro(ctx, "Não foi possível criar o produto", 403);
                }
                break;
            case "PUT":
                break;
            case "DELETE":
                break;
            default:
                break;
        }

    } else if (path.includes("/orders/")) {
        const id = pathQuebrado[2];
        switch (method) {
            case "GET":
                break;
            case "POST":

                break;
            case "PUT":
                break;
            case "DELETE":
                break;
            default:
                break;
        }
    } else {
        formatarErro(ctx, "Requisição mal-formatada.", 400)
    }
}

server.use((ctx) => {
    caminhos(ctx);
});


server.listen(8081, () => console.log("Rodando porta 8081!"));