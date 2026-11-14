# Code Bloom — meu jardim de C#

Repositório: https://github.com/alicegray-ux/code-bloom

Um aplicativo de estudo em português brasileiro com lições curtas, Mimi (uma gatinha), revisões espaçadas e um jardim que floresce com o aprendizado. Sem anúncios, compras, servidor .NET ou APIs pagas.

## Executar

Instale **Node.js 24 LTS** e, nesta pasta, execute:

```sh
npm ci
npm run dev
```

Abra o endereço indicado pelo Vite. Para a versão de produção:

```sh
npm test
npm run build
```

`dist/` contém o site estático e `dist/code-bloom-projeto.zip` contém o código e este README. O script de empacotamento requer Python 3, disponível no GitHub Actions; se não houver Python na sua máquina, remova `&& node scripts/package-source.mjs` do comando build (somente o download do código deixará de ser gerado).

## O que esta versão entrega

- 3 unidades completas, 9 lições e 45 desafios; mundos 4 a 12 claramente indicados como **Em breve**.
- Alternativas A/B/C, saída de programa, lacunas, código curto, ordenar linhas, depurar e explicar com autoavaliação. Desafios finais combinam conceitos.
- Conceito e exemplo antes dos exercícios; dica antes de revelar solução; revisões em 10 minutos após dificuldade e em 1, 3, 7, 14 e 30 dias após acertos independentes consecutivos.
- XP de participação (5 por tentativa), domínio separado (3 acertos independentes no prazo das revisões e pelo menos 2 consecutivos; repetir antes do prazo rende XP sem acelerar domínio), histórico, caderno e recompensas visuais por lições.
- Meta inicial de 20 minutos, presets 10/15/20/30/45/60 e meta personalizada 1–240. Conta somente nas lições/conceitos e no caderno, com aba visível, sem pausa manual e com interação nos últimos 60 segundos. Ocultar a aba pausa cronômetro e música; retomar a trilha exige ação. O relógio limita saltos a 2 segundos para não contabilizar suspensão do computador. Dias usam o fuso local do dispositivo.
- Salvamento automático em IndexedDB, preferências simples também em localStorage, rascunhos, último salvamento, backup JSON com validação e confirmação antes de substituir. Uma única aba editora quando Web Locks está disponível.
- Trilha instrumental original por Web Audio, sem autoplay; pausa, volume e mudo. Áudio local opcional não é enviado nem persistido. Spotify usa somente embed oficial, com controles independentes, podendo oferecer prévias ou pedir login.
- Visual responsivo, cores próprias, personalização da Mimi, ambiente, animações opcionais e respeito a `prefers-reduced-motion`.

## Limites honestos

**O aplicativo não executa C#.** Não há compilador ou servidor remoto. As questões objetivas têm gabarito e explicação. Trechos de código passam por regras estruturais pequenas e explícitas em `src/core.ts`, que aceitam algumas formas alternativas (por exemplo `System.Console`, espaços e `var` quando apropriado), mas não todas as soluções C# possíveis. A interface identifica isso como **validação guiada**, apresenta seus limites e oferece referência. Não use esse mecanismo para avaliar programas arbitrários. Para uma solução não reconhecida, compare a referência e adapte para uma das formas reconhecidas. As respostas abertas usam critérios marcados pela própria estudante, identificados como **autoavaliação**, sem IA.

Ao concluir fases, o jardim exibe flores; completar unidades abre mais ambientes/recompensas. As unidades futuras não contêm lições ainda. Não existe promessa de catálogo avançado já implementado.

## Organização

| Arquivo | Responsabilidade |
| --- | --- |
| `src/content.ts` | Conteúdo em PT-BR, unidades, lições, dicas, critérios e exemplos |
| `src/core.ts` | Avaliação guiada, domínio, revisões, tempo, validação de backup e migração |
| `src/storage.ts` | IndexedDB, abertura/migração do banco e transações de gravação |
| `src/audio.ts` | Composição instrumental original em Web Audio |
| `src/art.tsx` | Mimi e jardim em SVG original, sem assets pagos |
| `src/main.tsx` | Telas React, sessão de estudo, salvamento e controles |
| `src/style.css` | Design responsivo, paleta e movimento |
| `src/core.test.ts` | Testes de correção, alternativas, backup, revisão e tempo |

## Editar exercícios e ampliar a trilha

1. Adicione lições em `units` no `src/content.ts`. Preserve IDs existentes: eles identificam respostas, revisões e progresso.
2. Cada lição inclui título, conceito acessível, exemplo e questões. Ensine antes de cobrar.
3. `choice`/`output`: forneça 3 opções, uma delas igual a `answer`. `blank`: resposta curta. `order`: linhas em `options` e sequência de referência em `answer` separada por `|`; o exercício segue essa ordem de referência.
4. `code`/`debug`: use uma `rule` explícita no `check` de `core.ts`; não use `eval` nem prometa execução. Inclua testes positivos e negativos para cada regra. Forneça `hint` e `explanation` com solução comentada.
5. `explain`: inclua `answer` de referência e `criteria` observáveis. A estudante marca sua autoavaliação.
6. Remova de `upcoming` somente os mundos realmente implementados. Para ampliar além de 5 questões por lição, atualize os limites da validação e os denominadores do domínio na interface antes de publicar.
7. Rode `npm test` e `npm run build`. Verifique uma sessão pelo navegador.

## Alterar elementos visuais e som

As cores de destaque, meta e movimento são configuráveis no aplicativo. Ajuste a paleta base, espaçamentos e fontes em `src/style.css`. A fonte é Manrope/DM Sans do Google Fonts, com fallback local sans-serif se estiver indisponível. Não há dependência de fontes externas para executar exercícios. Desenhos da gatinha e do jardim ficam em `src/art.tsx`. Para alterar a melodia, edite a sequência MIDI e o andamento em `src/audio.ts`; respeite o início por ação da pessoa. Nenhuma música comercial é incluída ou baixada.

## Publicar gratuitamente no GitHub Pages

1. Crie um repositório chamado, por exemplo, `code-bloom`, e envie todos os arquivos desta pasta, incluindo `.github/workflows/pages.yml`. Não envie `node_modules`, `dist`, backups pessoais, tokens ou senhas.
2. No GitHub, abra **Settings → Pages → Source → GitHub Actions**.
3. Envie para a branch `main` ou rode **Actions → Publicar Code Bloom → Run workflow**.
4. O workflow instala, testa, compila e publica `dist`. O endereço é mostrado pelo próprio GitHub ao concluir a publicação.
5. `vite.config.ts` obtém automaticamente o nome do repositório por `GITHUB_REPOSITORY` para configurar `base`. Para repositório de usuário (`usuario.github.io`), mude `base` para `/`. Localmente e nesta hospedagem, usa `./`.

A navegação usa fragmentos (`#map`, `#garden`, etc.), sem caminhos do servidor; recarregar funciona em hospedagem estática. O repositório guarda **somente o projeto**, nunca é banco de dados e não sincroniza o progresso entre dispositivos. O arquivo disponibilizado não inclui credenciais nem configuração de outra hospedagem.

## Dados, recuperação e privacidade

O banco `code-bloom`, versão 2, contém o object store `progress`, registro `main`. As respostas, revisões, XP, fases, tempo diário, rascunhos, posição e preferências estão em um snapshot versionado. As gravações esperam a conclusão da transação; erros aparecem no indicador. O salvamento tenta a cada 1,2 segundo e quando a aba é ocultada. Fechar o processo abruptamente antes de concluir uma gravação pode perder os últimos segundos: use o indicador de último salvamento e backups regulares. Se o banco não puder abrir ou os dados forem inválidos, não sobrescrevemos o registro existente; a sessão pode continuar em memória e ser exportada. Não existe coleta de nome, email nem telemetria pelo aplicativo.

O backup exportado contém `app`, `exportedAt` e `progress`. A importação limita o tamanho a 10 MB, valida tipos, IDs, limites, datas, pré-requisitos e versão antes de abrir a confirmação. Recomenda-se exportar os dados atuais antes de substituí-los. O mesmo arquivo funciona em outro navegador/dispositivo depois de importar. Trate backups como arquivos pessoais: incluem suas respostas. O fallback de preferências localStorage não substitui o backup IndexedDB.

Migrações são puras e ficam em `validate`: v1 → v2 acrescenta caderno/rascunhos e valores padrão, preservando o histórico v1. Não remova stores ou apague o banco em futuras atualizações. Versões futuras desconhecidas são rejeitadas. Faça uma cópia exportada antes de atualizar e acrescente testes com snapshots antigos.

## Verificação

`npm test` cobre as 45 questões (todas as referências objetivas e critérios abertos), aceitação de alternativas guiadas e rejeição de erros, roundtrip e rejeição de backup, migração v1, pré-requisitos, intervalos de revisão, domínio, pausas do relógio, sequência local e links Spotify.

Verificação manual recomendada em cada atualização: concluir lição, fechar/reabrir aba e conferir XP/posição, retomar rascunho, exportar/importar em outro perfil, confirmar/cancelar substituição, testar pausa manual/ocultação/inatividade, iniciar/pausar/silenciar trilha, selecionar áudio local e usar largura de 360–390 px. A reprodução do Spotify depende do serviço e da conta da pessoa.

Na entrega inicial, a verificação de navegador incluiu conclusão/desbloqueio de lições, erro/dica/correção, restauração após recarregar, exportação/importação real do backup, meta restaurada, pausa manual, áudio sintetizado e arquivo WAV local, além da interação em um viewport de 390 px. A lógica de aba oculta e de inatividade também é coberta pelos testes unitários. Não houve teste em aparelho físico nem garantia de reprodução integral do Spotify.

## Responsividade no celular

A interface tem layout próprio para telas estreitas, menu lateral recolhível, editor com fonte de 16 px no celular e botões principais com alvos de toque de pelo menos 44 px. Foram verificados os fluxos de lição, menu e editor em viewports de 360 e 390 px, incluindo a ausência de rolagem horizontal na página e na área da lição. O teste foi feito no navegador; aparelhos físicos podem ter diferenças de teclado e área disponível.
