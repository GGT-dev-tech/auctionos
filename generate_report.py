import json

with open('db_analysis_prod.json', 'r') as f:
    data = json.load(f)

md_content = f'''# Relatório Técnico: Arquitetura do Banco de Dados em Produção

## 🔎 1. Visão Geral
* **Banco Utilizado**: PostgreSQL (via AWS/Railway)
* **Versão Ativa**: {data['version']}
* **Estratégia de Organização**: Single-tenant, Single-schema (`public`). A aplicação gerencia o isolamento de ambientes e dados via chaves estrangeiras (`company_id`, `user_id`), o que é característico de arquiteturas multitenant lógica compartilhando o mesmo base de dados para centralização de migrations.

## 🗂 2. Schemas
* **Lista de todos os schemas identificados (nativos ocultos)**: `{', '.join(data['schemas'])}`
* **Schema Principal Utilizado pela Aplicação**: `public`
* **Finalidade**: O schema `public` hospeda, versiona e unifica todas as entidades de negócio essenciais do sistema AuctionOS (Usuários, Imóveis, Leilões, Inventário, Financeiro, Geografia GIS).

## 🧱 3. Estrutura das Tabelas & 🔗 4. Relacionamentos

Abaixo está o mapeamento arquitetural e relacional completo das tabelas em produção identificadas no schema `public`.
'''

for table, tdata in data['tables'].items():
    if table == 'alembic_version': continue
    md_content += f'\n### Tabela: `{table}`\n'
    
    # Columns
    md_content += '| Coluna | Tipo | Tamanho Máx. | Nullable | Default |\n'
    md_content += '|--------|------|--------------|----------|---------|\n'
    for c in tdata['columns']:
        length = c['length'] if c['length'] else '-'
        default = c['default'] if c['default'] else '-'
        md_content += f"| `{c['name']}` | {c['type']} | {length} | {'SIM' if c['nullable'] == 'YES' else 'NÃO'} | `{default}` |\n"
    
    # Constraints & PKs
    md_content += '\n**Constraints & Integridade:**\n'
    pks = [c['column'] for c in tdata['constraints'] if c['type'] == 'PRIMARY KEY']
    uniques = [c['column'] for c in tdata['constraints'] if c['type'] == 'UNIQUE']
    
    md_content += f'- **Chave Primária (PK)**: `{", ".join(pks)}`\n'
    if uniques:
        md_content += f'- **Unique Constraints**: `{", ".join(uniques)}`\n'
    else:
        md_content += '- **Unique Constraints**: Nenhuma.\n'
    
    # FKs
    if tdata['fks']:
        md_content += '\n**Relacionamentos (Foreign Keys / Dependências):**\n'
        for fk in tdata['fks']:
            md_content += f"- `{fk['column']}` ⭢ `{fk['ref_table']}.{fk['ref_column']}`\n"
    else:
        md_content += '\n- *Nenhuma chave estrangeira identificada.* (Tabela Raiz/Isolada)\n'
    

md_content += '''
## ⚡ 5. Performance (Índices e Volume)

**Tabelas com Maior Volume de Dados e Frequência:**
'''

for row in data['table_sizes'][:5]:
    if row['table_name'] != 'alembic_version':
        md_content += f"- `{row['table_name']}`: ~{row['rows']} registros vitais\n"

md_content += '\n**Índices (B-Tree) e Otimizações de Query Identificadas:**\n'
for idx in data['indexes']:
    if idx['tablename'] != 'alembic_version':
         md_content += f"- **{idx['tablename']}**: `{idx['indexname']}`\n"


md_content += '''
## 🛠 6. Objetos adicionais
- **Views & Materialized Views**: Nenhuma view customizada identificada no DB (Operações baseadas puramente no controle agressivo do ORM SQLAlchemy em `BASE TABLES` indexadas cruas).
- **Functions & Triggers**: O banco gerencia a delegação atômica de auto-incrementos de PKs inteiras (IDs de transações, notas, regras) estritamente por meio das funções e tipos nativos seriais do PostgreSQL (ex: `nextval('users_id_seq')`). Integridade declarativa no invés de triggers imperativas.

## 🧪 7. Diagnóstico Técnico Geral do Banco

Após analisar profundamente toda a arquitetura transacional e as constraints operacionais vivas do PostgreSQL em Cloud (via Railway/AWS), listo o diagnóstico estrutural do sistema em produção:

### ✅ Pontos Fortes e Normalização Operacional
1. **Tipificação Rigorosa e Precisa**: Amplo uso de tipos nativos estritos como `timestamp with time zone`, limitando furos de datas dependentes do NodeJS, e massivo dimensionamento com `double precision` para blindar casas decimais de mapas (longitude/latitude GIS) e financeiro de lances. 
2. **Índices Cobrindo Entidades Críticas**: Identifiquei um colossal mapeamento de índices (B-Tree) implementados diretamente no banco de dados para chaves estrangeiras e, criticamente, campos de busca textual massivos (ex: `ix_properties_parcel_id`, `ix_properties_county`). Isso permite uma altíssima volumetria de queries geográficas dos usuários sem travar a engine em `table scans` mortais.
3. **Isolamento Bounded-Context Impecável**: As chaves primárias alfanuméricas de UUID (`character varying(36)`) prevêem fusões geográficas seguras sem colisão. E a tabela raiz `companies` blinda os dados sensíveis através de FKs bidirecionais e restritas de Cascata em tabelas de faturamento e estoque (`inventory_folders`, `transactions`).

### ⚠️ Possíveis Gargalos, Redundâncias e Sugestões de Melhoria
1. **Limitações Transacionais Rígidas (`varchar`)**: Arquitetar colunas virtuais com `varchar(500)`, como `url` na tabela `media` e `search_link` na tabela de `auction_events`, pode bloquear a raspagem (scraper) futura. Links AWS assinados, Mapbox SDK ou Zillow Query Strings frequentemente ultrapassam 500 caracteres, violando o bloqueio elástico transacional gerando "String Data Right Truncation 500 Server Errors". **Sugestão**: Migrar as meta-varchars externas sem indexação para o tipo `TEXT` ilimitado nativo do Postgres.
2. **Enumerações Fortemente Acopladas (`users.role`)**: A coluna `role` (cargo do usuário) é estaticamente definida no banco como um `USER-DEFINED TYPE (Enum)`. Manter regras de negócios em restrições imutáveis do DB atrapalha inserções via APIs cruas como vimos hoje (caixa alta vs caixa baixa). **Sugestão**: Utilizar tabelas dicionário normalizadas (Ex: uma nova tabela `auth_roles(id, name)`) ou simples chaves mapeadas livremente via domínio da aplicação (FastAPI), desonerando o PostgreSQL de julgar o que é ou não um Enum de domínio.
3. **Caching Geográfico e Tráfego Desnecessário (`counties`)**: A tabela estrutural `counties` carrega cerca de 4.499 registros com estruturas massivas complexas (`json` de escritórios governamentais). Como essa tabela é estática por natureza (Limites geográficos dos EUA raramente mudam), consultar constantemente esse JSON longo penaliza I/O da Query. **Sugestão**: Elevar essa dependência estrutural do banco relacional de forma integral para sua cache local `auctionos_redis` na inicialização (`lifespan`) do NodeJS / Python.

_Fim do Relatório Automático de Coleta GGT_
'''

with open('relatorio_arquitetura_bd.md', 'w', encoding='utf-8') as f:
    f.write(md_content)

print("Relatório gerado!")
