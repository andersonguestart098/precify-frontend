# Ajustes de UX — Obras, Composições e Produtos

## Pedidos incorporados

| Área | Correção |
| --- | --- |
| Produtos | Título alterado para “Encontre o material pela especificação.”, com tamanho fluido no mobile. |
| Obras | Título, dados e total da obra passam a ocupar linhas próprias em telas estreitas. O valor não disputa espaço com o favorito e o controle de expansão. |
| Obras | Dentro de cada obra, as ações aparecem em uma faixa horizontal na ordem: **Adicionar produtos**, **Vincular composição**, **Explorar produtos**. A faixa pode ser rolada lateralmente no celular. |
| Obras | **Gerenciar composições** abre a página de composições filtrada pela obra; **Vincular composição** abre a edição da obra com o seletor de composições existente. O acesso a **Gerenciar mão de obra** permanece no cartão da obra. |
| Composições | **Adicionar produtos** abre uma busca dentro da composição. Cada resultado mostra o produto, fornecedor e cotação quando disponíveis; tocar em “+” inclui uma unidade e atualiza imediatamente os itens e o total. Quantidade pode ser ajustada na própria lista após a inclusão. |
| Composições | O estado vazio usa “produto” e deixa de levar para o catálogo. **Explorar produtos**, na faixa de ações da obra, continua abrindo a tela de Produtos. |
| Composições | O filtro e os atalhos se reorganizam em várias linhas no celular. Nome, vínculo, contagem e total usam espaço próprio nos cabeçalhos. O seletor de obras limita a largura das etiquetas e preserva tipo, local e observações ao salvar vínculos. |
| Minha área | Removido o atalho em cápsula de **Obras**; o acesso continua no menu principal. As demais cápsulas mantêm o mesmo enquadramento. |
| Sincronização | O modal de adicionar produto a partir do catálogo agora atualiza o cache de composições, para que o item apareça ao retornar à tela. |

O ajuste anterior do botão fixo de **Salvar alterações** da mão de obra permanece na mesma branch, com fundo verde claro e estados de salvamento visíveis.

## Fluxos para conferir

1. Na obra, abrir **Adicionar produtos**: a composição vinculada abre com busca. Escolher um produto deve incluir o item sem sair da página.
2. Na obra, abrir **Vincular composição**, salvar o vínculo e usar **Gerenciar composições** para ver somente as composições daquela obra.
3. Em Composições, abrir uma composição vazia e usar **Adicionar produtos**; após incluir, conferir a lista, o total e a navegação de volta a partir de Produtos.
4. Em uma largura de **390 CSS px** (referência iPhone 16e), conferir títulos, totais, favorito, expansão e os controles de cada item sem rolagem horizontal da página.

## Verificação técnica

- `npm run build`
- `npx eslint src/pages/CompositionsPage.tsx src/pages/PlanningPage.tsx src/pages/SearchPage.tsx src/pages/MyAreaPage.tsx src/components/AddToCompositionDialog.tsx`
- `npx vitest run src/pages/CompositionsPage.test.tsx --config vitest.config.ts`

O teste automatizado cobre a busca e a inclusão dentro da composição da obra. A verificação visual no navegador local ainda depende de um navegador disponível no ambiente de execução.
