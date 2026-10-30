---
name: novo-endpoint
description: Cria um endpoint da API Laravel completo (migration, model, enum, policy, form request, action, resource, controller, rota e testes). Use ao adicionar ou alterar uma rota em /api/v1, uma tabela ou uma regra de negócio no backend.
---

# Novo endpoint da API

Antes de começar, leia `.claude/rules/backend.md`, `.claude/rules/api.md` e `.claude/rules/seguranca.md`. O exemplo usa a lista de espera (Fase 1); troque os nomes pelo recurso real.

Rode os comandos dentro de `backend/`.

## 0. Pré-requisitos

- **Dados pessoais:** os campos estão em `docs/lgpd-dados-pessoais.md`? Se não estiverem, pare e peça autorização ao usuário.
- **`routes/api.php` existe?** Na primeira vez, ele não existe. Peça autorização e rode `php artisan install:api`: o comando cria o arquivo, registra as rotas no `bootstrap/app.php` e publica a configuração e a migration do Sanctum, que já é dependência. Depois confira o diff.
- **O endpoint é público ou privado?** Por padrão ele é privado.

## 1. Tabela e model

```bash
php artisan make:model WaitlistEntry -mf     # model + migration + factory
php artisan make:enum Enums/WaitlistStatus
```

```php
// migration
Schema::create('waitlist_entries', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('guardian_name', 120);
    $table->string('email', 254);
    $table->string('phone', 20);
    $table->string('child_name', 120);
    $table->date('child_birth_date');
    $table->string('status', 20)->default('pending');
    $table->timestamp('consented_at');
    $table->string('privacy_policy_version', 20);
    $table->timestamps();
});
```

```php
#[Fillable(['guardian_name', 'email', 'phone', 'child_name', 'child_birth_date', 'consented_at', 'privacy_policy_version'])]
class WaitlistEntry extends Model
{
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'child_birth_date' => 'date',
            'consented_at' => 'datetime',
            'status' => WaitlistStatus::class,
        ];
    }
}
```

`status` não está em `#[Fillable]`: quem define o status é a regra de negócio, nunca o cliente.

## 2. Policy (endpoints privados)

```bash
php artisan make:policy WaitlistEntryPolicy --model=WaitlistEntry
```

Implemente só os métodos usados e negue por padrão. Exemplo: `viewAny` retorna `$user->role === Role::Admin`.

## 3. FormRequest

```bash
php artisan make:request WaitlistEntry/StoreWaitlistEntryRequest
```

```php
public function authorize(): bool
{
    return true; // rota pública; o rate limit fica na rota
}

public function rules(): array
{
    return [
        'guardian_name' => ['required', 'string', 'max:120'],
        'email' => ['required', 'email', 'max:254'],
        'phone' => ['required', 'string', 'max:20'],
        'child_name' => ['required', 'string', 'max:120'],
        'child_birth_date' => ['required', 'date', 'before:today', 'after:-7 years'],
        'consent' => ['accepted'],
    ];
}
```

Em rotas privadas, `authorize()` usa a Policy: `return $this->user()->can('create', WaitlistEntry::class);`.

## 4. Action (regra de negócio)

`app/Actions/Waitlist/CreateWaitlistEntry.php`:

```php
class CreateWaitlistEntry
{
    public function handle(array $data): WaitlistEntry
    {
        return WaitlistEntry::create([
            ...Arr::except($data, ['consent']),
            'consented_at' => now(),
            'privacy_policy_version' => config('privacy.policy_version'),
        ]);
    }
}
```

`config('privacy.policy_version')` é um exemplo: crie a configuração ou adapte antes de usar.

## 5. Resource

```bash
php artisan make:resource WaitlistEntryResource
```

Liste os campos explicitamente. Uma resposta pública devolve o mínimo (ex.: `id`, `status`, `created_at`), nunca os dados da criança.

## 6. Controller

```bash
php artisan make:controller Api/V1/WaitlistEntryController
```

```php
public function store(StoreWaitlistEntryRequest $request, CreateWaitlistEntry $createWaitlistEntry): WaitlistEntryResource
{
    $entry = $createWaitlistEntry->handle($request->validated());

    return new WaitlistEntryResource($entry);
}
```

## 7. Rota (`routes/api.php`)

```php
Route::prefix('v1')->group(function () {
    // Públicas: sempre com rate limit
    Route::post('waitlist-entries', [WaitlistEntryController::class, 'store'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        // Privadas
    });
});
```

## 8. Testes

```bash
php artisan make:test Api/V1/WaitlistEntry/StoreWaitlistEntryTest
```

Cubra os casos obrigatórios de `.claude/rules/testes.md` e confira que a resposta não contém os dados da criança.

## 9. Finalize

- [ ] `php artisan test` e `vendor/bin/pint --test` passando
- [ ] Skill `revisao-seguranca` aplicada
- [ ] Tipos do frontend atualizados, se o endpoint já for consumido (skill `novo-servico`)
- [ ] `docs/lgpd-dados-pessoais.md` e `docs/arquitetura.md` atualizados, se for o caso
