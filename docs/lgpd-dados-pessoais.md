# Inventário de dados pessoais (LGPD)

Lista **todos** os dados pessoais que o sistema coleta. Um dado que não está aqui não pode ser coletado. Para adicionar um campo: preencha a linha, obtenha a aprovação do responsável pelo projeto e só depois implemente.

> Este inventário é um apoio técnico e não substitui a orientação jurídica nem a Política de Privacidade. Os prazos marcados como "a definir" precisam ser decididos pela escola.

## Lista de espera (Fase 1)

Tabela planejada: `waitlist_entries`. Hoje o formulário existe só no frontend e **ainda não envia nem guarda dados**.

| Campo | Titular | Finalidade | Base legal | Retenção |
|---|---|---|---|---|
| Nome do responsável | Responsável | Contato sobre a vaga | Consentimento | A definir |
| E-mail | Responsável | Contato sobre a vaga | Consentimento | A definir |
| Telefone/WhatsApp | Responsável | Contato sobre a vaga | Consentimento | A definir |
| Nome da criança | Criança | Identificar o interesse | Consentimento do responsável (Art. 14) | A definir |
| Data de nascimento | Criança | Indicar a turma adequada | Consentimento do responsável (Art. 14) | A definir |
| Turma de interesse | Criança | Organizar as vagas | Consentimento do responsável (Art. 14) | A definir |
| Mensagem (opcional) | Ambos | Informações livres da família | Consentimento | A definir |
| Data do consentimento e versão da política | Responsável | Comprovar o consentimento | Obrigação legal | Enquanto o registro existir |

**Atenção, mensagem livre:** o texto de exemplo atual do campo ("cuidados especiais...") pode levar as famílias a informar dados de saúde, que são dados sensíveis (Art. 11). Recomenda-se trocar o exemplo e avisar no formulário que não devem ser enviadas informações de saúde por ali.

## Usuários (Fase 2)

| Campo | Titular | Finalidade | Base legal | Retenção |
|---|---|---|---|---|
| Nome | Usuário | Identificação | Execução de contrato | Enquanto a conta existir |
| E-mail | Usuário | Login e comunicação | Execução de contrato | Enquanto a conta existir |
| Senha (hash) | Usuário | Autenticação | Execução de contrato | Enquanto a conta existir |
| Perfil (`role`) | Usuário | Controle de acesso | Execução de contrato | Enquanto a conta existir |

## Fases seguintes

Alunos, matrículas, documentos, presença e pagamentos (Fases 2 a 4) serão adicionados aqui **antes** da implementação de cada um.

## Pendências antes de publicar a Fase 1

- [ ] Política de Privacidade publicada (o link do formulário hoje aponta para uma âncora vazia).
- [ ] Prazos de retenção definidos pela escola.
- [ ] Canal para os titulares pedirem acesso, correção e exclusão (ex.: um e-mail dedicado).
- [ ] Encarregado de dados (DPO) definido ou dispensa avaliada.
