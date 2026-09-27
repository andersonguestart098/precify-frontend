# Ajustes de UX — Obras, Composições e Produtos

## Pedidos incorporados

| Área | Correção |
| --- | --- |
| Produtos | Título alterado para “Encontre o material pela especificação.”, com tamanho fluido no mobile. |
| Obras | Título, dados e total da obra passam a ocupar linhas próprias em telas estreitas. O valor não disputa espaço com o favorito e o controle de expansão. |
| Obras | Dentro de cada obra há uma única ação em destaque: **Vincular composição**. O botão ocupa a largura disponível e abre diretamente o seletor de composições da obra, sem os campos gerais de edição. O modal pode crescer no celular e mostra todas as cápsulas selecionadas. No iPhone, o teclado aguarda o toque no campo e os inputs têm fonte de 16 px para evitar o zoom automático do Safari. A gestão dos produtos continua em **Gerenciar composições** e na aba Produtos. |
| Obras | O resumo de **Composições** segue o padrão de **Mão de obra**: cabeçalho, acesso a **Gerenciar composições**, contagens, **Total MAT** e cartões compactos das composições vinculadas, com valor e número de produtos. As cápsulas e linhas têm a mesma altura compacta da seção de mão de obra. Os cartões começam logo abaixo dos indicadores, sem um título repetido ou subtítulo genérico. Até seis composições aparecem inicialmente; **Ver todas** revela o restante. A área evita o zoom por toque duplo no iPhone. |
| Navegação | A tela inicial espera somente os dados necessários à página aberta; as demais áreas aquecem em segundo plano. Em Produtos, a pesquisa e a troca de página começam sem a espera artificial de 250 ms, mantendo a atualização discreta dos resultados já em cache. |
| Telas móveis | O avatar, os títulos, os atalhos e o carrossel de segmentos se ajustam também à altura disponível. Em Obras, os indicadores ocupam duas colunas e o total uma linha inteira no celular; os espaçamentos acima da lista foram reduzidos. Os cartões de Produtos ficam mais baixos em telas curtas, mantendo o conteúdo e as ações legíveis. |
| Teclado no iPhone | O **+** das obras vinculadas abre uma lista rolável das obras cadastradas ainda disponíveis, sem campo de busca e sem teclado. Os demais campos editáveis recebem proteção móvel contra o zoom automático do Safari, sem bloquear o zoom manual. |
| Composições | **Adicionar produtos** abre uma busca dentro da composição. Cada resultado mostra o produto, fornecedor e cotação quando disponíveis; tocar em “+” inclui uma unidade e atualiza imediatamente os itens e o total. Quantidade pode ser ajustada na própria lista após a inclusão. |
| Composições | O estado vazio usa “produto” e deixa de levar para o catálogo. **Explorar produtos**, na faixa de ações da obra, continua abrindo a tela de Produtos. |
| Composições | A página adota a hierarquia da Mão de obra: cabeçalho simples, resumo discreto, filtro por obra e cartões compactos. Ao expandir, a ação **Adicionar produtos** vem primeiro; o vínculo com obras fica recolhido até ser solicitado. O seletor preserva tipo, local e observações ao salvar vínculos. |
| Composições | Ao vir da obra para adicionar produtos, a rolagem espera a composição expandir. No celular, o teclado só abre quando a pessoa toca no campo de busca. |
| Composições | Dentro de cada composição, os produtos aparecem logo após o nome em cartões arredondados: imagem e nome com espaço de leitura, quantidade editável ao lado do valor na faixa inferior e remoção. A ação **Adicionar produtos à composição** vem abaixo da lista; sua busca não repete título nem botão “Fechar” e oferece uma área de rolagem com cerca de quatro resultados no celular. O próprio botão recolhe a busca. |
| Composições | As obras vinculadas permanecem visíveis em cápsulas arredondadas e removíveis, com tamanho e espaçamento confortáveis no celular. Apenas um **+** circular verde claro fica ao lado delas, sem um segundo botão com texto; ao tocar, aparece a busca para vincular outras obras. A nova obra entra na mesma sequência de cápsulas, e a busca continua disponível para adicionar mais uma sem sair da composição. |
| Minha área | Removido o atalho em cápsula de **Obras**; o acesso continua no menu principal. As demais cápsulas mantêm o mesmo enquadramento. |
| Sincronização | O modal de adicionar produto a partir do catálogo agora atualiza o cache de composições, para que o item apareça ao retornar à tela. |

O ajuste anterior do botão fixo de **Salvar alterações** da mão de obra permanece na mesma branch, com fundo verde claro e estados de salvamento visíveis.

## Fluxos para conferir

1. Na obra, abrir **Vincular composição**, escolher uma composição no seletor e salvar a obra.
2. Usar **Gerenciar composições** para ver as composições daquela obra e adicionar produtos pela busca interna.
3. Em Composições, conferir os produtos primeiro; usar **Adicionar produtos à composição** e rolar quatro resultados com o dedo. Após incluir, conferir a lista e o total.
4. Tocar em **+** ao lado das obras vinculadas, escolher uma obra cadastrada na lista, conferir a nova cápsula e desvincular por ela.
5. Em uma largura de **390 CSS px** (referência iPhone 16e), conferir títulos, totais, favorito, expansão e os controles de cada item sem rolagem horizontal da página.

## Verificação técnica

- `npm run build`
- `npx eslint src/pages/CompositionsPage.tsx src/pages/PlanningPage.tsx src/pages/SearchPage.tsx src/pages/MyAreaPage.tsx src/components/AddToCompositionDialog.tsx`
- `npx vitest run src/pages/CompositionsPage.test.tsx --config vitest.config.ts`
- `npx vitest run src/pages/PlanningPage.test.tsx --config vitest.config.ts`

Os testes automatizados cobrem a inclusão de produtos, o vínculo de composições e a preservação dos dados da obra ao salvar. A verificação visual no navegador local ainda depende de um navegador disponível no ambiente de execução.
