# Busca Produto - Frontend

Interface responsiva do piloto de busca técnica de produtos. O usuário define especificações obrigatórias e preferências, e os objetos são ordenados por compatibilidade com explicação dos acertos e diferenças.

O cadastro aceita a URL da imagem do produto e a URL do logo do fornecedor no Cloudinary. A família selecionada define dinamicamente quais especificações aparecem tanto no cadastro quanto na busca.

## Stack

- React + TypeScript + Vite
- Material UI
- PWA com `vite-plugin-pwa`
- Deploy previsto na Vercel

## Executar

```bash
npm install
cp .env.example .env
npm run dev
```

## Validar

```bash
npm run lint
npm run build
```

## Configuração

`VITE_API_URL` deve apontar para a API Spring Boot. A tela chama `POST /api/search`; produtos e pontuação vêm do backend e do MongoDB.

## Regra central

1. Filtros obrigatórios definem elegibilidade.
2. Preferências compõem a pontuação.
3. Texto livre complementa e desempata.
4. O resultado explica o percentual e as diferenças.

## Famílias demonstrativas

- `Iluminação`: temperatura, potência, instalação, proteção e IRC;
- `Forro`: material, largura, comprimento, espessura e resistência à umidade.

Os campos ficam centralizados em `src/data/familyConfig.ts` até a tabela definitiva ser fornecida.
