J'ai
1- LISTE DES RESSOURCES
curl -X 'GET' \
  'http://localhost:8000/api/v1/admin/resources/list?page=1&perPage=20' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 432|w4s3Zj2oizu7mKTyceLjJDF59A1csH2JAOz2qKWfc1b66301' \
  -H 'X-CSRF-TOKEN: '
---
{
  "data": [
    {
      "id": "8dda8510-e743-4f77-83e9-b32a60a09f01",
      "slug": "gabarit-bache-banderole-pose",
      "title": "Gabarit bâche et banderole + guide de pose",
      "category": "Gabarit",
      "price": 3000,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Prêt à personnaliser",
      "short": "Gabarits grand format avec œillets, marges de sécurité et conseils de pose.",
      "format": "Canva · PDF · AI",
      "meta": "4 formats",
      "viewsCount": 9,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:48+00:00",
      "updatedAt": "2026-11-14T03:11:17+00:00"
    },
    {
      "id": "d451491f-2815-4e15-8483-de04f8c9cfb6",
      "slug": "modele-portfolio-designer",
      "title": "Modèle de portfolio et CV pour designers",
      "category": "Gabarit",
      "price": 2500,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Pour les apprenants",
      "short": "Un portfolio PDF et un CV créatif pour présenter vos projets et décrocher des missions.",
      "format": "Canva · PDF",
      "meta": "2 modèles",
      "viewsCount": 13,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:48+00:00",
      "updatedAt": "2026-11-14T09:41:53+00:00"
    },
    {
      "id": "5dca0818-1837-4ada-b5b9-e4427fdbdf51",
      "slug": "kit-pme-devis-facture-fcfa",
      "title": "Kit PME : devis, facture et en-tête (FCFA)",
      "category": "Gabarit",
      "price": 4500,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Prêt à l'emploi",
      "short": "Modèles de devis et de facture en FCFA, papier à en-tête et carte de visite, sur Word et Excel.",
      "format": "Word · Excel · Canva",
      "meta": "5 modèles",
      "viewsCount": 0,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:47+00:00",
      "updatedAt": "2026-11-14T00:02:47+00:00"
    },
    {
      "id": "6a7c187a-8e47-4818-b74c-b32030678bf7",
      "slug": "pack-reseaux-sociaux-canva",
      "title": "Pack réseaux sociaux (Canva)",
      "category": "Gabarit",
      "price": 4000,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Prêt à personnaliser",
      "short": "Posts Instagram et Facebook, statuts WhatsApp et couvertures pour une communication régulière.",
      "format": "Canva",
      "meta": "24 modèles",
      "viewsCount": 2,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:47+00:00",
      "updatedAt": "2026-11-14T09:43:53+00:00"
    },
    {
      "id": "c3f78526-8079-49da-b768-f10052c54ee4",
      "slug": "kit-evenement-canva",
      "title": "Kit événement complet (Canva)",
      "category": "Gabarit",
      "price": 6000,
      "originalPrice": 9000,
      "discountPercentage": 33,
      "status": "Pack complet",
      "short": "Badge, affiche, programme, bâche et kakémono assortis pour conférences, mariages et cérémonies.",
      "format": "Canva · PDF",
      "meta": "6 modèles",
      "viewsCount": 4,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:47+00:00",
      "updatedAt": "2026-11-14T07:32:51+00:00"
    },
    {
      "id": "576c49f9-8f44-44e7-81d9-52f63cfaff73",
      "slug": "guide-fichier-pret-a-imprimer",
      "title": "Préparer un fichier prêt à imprimer",
      "category": "Guide",
      "price": 0,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Indispensable",
      "short": "Fond perdu, CMJN, résolution, polices, export PDF : tout pour éviter un fichier refusé.",
      "format": "PDF",
      "meta": "14 pages",
      "viewsCount": 2,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:46+00:00",
      "updatedAt": "2026-11-14T03:11:18+00:00"
    },
    {
      "id": "776bf1d1-85bf-4575-93c4-934a2daf1c5a",
      "slug": "fiche-formats-et-dimensions-standards",
      "title": "Fiche des formats et dimensions standards",
      "category": "Outil",
      "price": 0,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Aide-mémoire",
      "short": "A4, A5, A6, bâches, roll-up, badges : les tailles à connaître et la lisibilité selon la distance.",
      "format": "PDF",
      "meta": "2 pages",
      "viewsCount": 2,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:46+00:00",
      "updatedAt": "2026-11-14T02:56:24+00:00"
    },
    {
      "id": "de69d01d-3f2d-41f7-be4a-d06125fe8cb4",
      "slug": "quel-support-pour-quel-besoin",
      "title": "Quel support pour quel besoin et quel budget ?",
      "category": "Guide",
      "price": 0,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Lecture 10 min",
      "short": "Flyer, bâche, roll-up, vinyle, badge : choisir le bon support selon votre objectif.",
      "format": "PDF",
      "meta": "8 pages",
      "viewsCount": 3,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:46+00:00",
      "updatedAt": "2026-11-14T03:11:17+00:00"
    },
    {
      "id": "818cdfe3-4b1d-4e7b-95ce-5105db094a03",
      "slug": "reussir-son-brief-design",
      "title": "Réussir son brief design",
      "category": "Guide",
      "price": 0,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Checklist à remplir",
      "short": "Les bonnes questions pour obtenir une proposition créative vraiment utile.",
      "format": "PDF",
      "meta": "6 pages",
      "viewsCount": 0,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:45+00:00",
      "updatedAt": "2026-11-14T00:02:45+00:00"
    },
    {
      "id": "880e403a-ef05-4e0c-9292-e1c44f3cf8b5",
      "slug": "checklist-site-web-performant",
      "title": "Checklist site web performant",
      "category": "Outil",
      "price": 0,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Nouveauté 2026",
      "short": "20 points à contrôler avant de mettre votre site en ligne.",
      "format": "PDF",
      "meta": "20 contrôles",
      "viewsCount": 0,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:45+00:00",
      "updatedAt": "2026-11-14T00:02:45+00:00"
    },
    {
      "id": "e424038e-d37f-4588-b5e9-deebd50752d1",
      "slug": "gabarit-flyer-a5",
      "title": "Gabarit flyer A5 recto-verso",
      "category": "Gabarit",
      "price": 3500,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Prêt à personnaliser",
      "short": "Deux compositions professionnelles avec marges et fond perdu inclus.",
      "format": "PDF · INDD",
      "meta": "2 compositions",
      "viewsCount": 2,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:45+00:00",
      "updatedAt": "2026-11-14T01:27:28+00:00"
    },
    {
      "id": "181d7f0c-c5f4-4bd9-96be-437a782f4333",
      "slug": "kit-kakemono-85x200",
      "title": "Kit kakémono 85 × 200 cm",
      "category": "Gabarit",
      "price": 3000,
      "originalPrice": 5000,
      "discountPercentage": 40,
      "status": "Prêt à personnaliser",
      "short": "Un modèle professionnel à personnaliser pour vos stands et événements.",
      "format": "PSD · AI",
      "meta": "3 mises en page",
      "viewsCount": 0,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:44+00:00",
      "updatedAt": "2026-11-14T00:02:44+00:00"
    },
    {
      "id": "31bc5e9d-9f49-40e1-b377-89bf7ca62475",
      "slug": "gabarit-carte-visite-85x55",
      "title": "Gabarit carte de visite 85 × 55 mm",
      "category": "Gabarit",
      "price": 0,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Prêt à imprimer",
      "short": "Un fichier propre aux bonnes dimensions, avec fond perdu et marges de sécurité.",
      "format": "PDF · AI",
      "meta": "Recto & verso",
      "viewsCount": 0,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:44+00:00",
      "updatedAt": "2026-11-14T00:02:44+00:00"
    },
    {
      "id": "6227fb05-41ca-4310-873d-c0a23481ec92",
      "slug": "choisir-couleurs-de-marque",
      "title": "Choisir ses couleurs de marque",
      "category": "Guide",
      "price": 2500,
      "originalPrice": null,
      "discountPercentage": 0,
      "status": "Lecture 15 min",
      "short": "Une méthode simple pour construire une palette cohérente et mémorable.",
      "format": "PDF",
      "meta": "12 pages",
      "viewsCount": 0,
      "downloadsCount": 0,
      "isActive": true,
      "createdAt": "2026-11-14T00:02:44+00:00",
      "updatedAt": "2026-11-14T00:02:44+00:00"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/admin/resources/list?page=1",
    "last": "http://localhost:8000/api/v1/admin/resources/list?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "page": null,
        "active": false
      },
      {
        "url": "http://localhost:8000/api/v1/admin/resources/list?page=1",
        "label": "1",
        "page": 1,
        "active": true
      },
      {
        "url": null,
        "label": "pagination.next",
        "page": null,
        "active": false
      }
    ],
    "path": "http://localhost:8000/api/v1/admin/resources/list",
    "per_page": 20,
    "to": 14,
    "total": 14
  }
}
***
2- DETAILS
curl -X 'GET' \
  'http://localhost:8000/api/v1/admin/resources/c3f78526-8079-49da-b768-f10052c54ee4' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 432|w4s3Zj2oizu7mKTyceLjJDF59A1csH2JAOz2qKWfc1b66301' \
  -H 'X-CSRF-TOKEN: '
---
{
  "data": {
    "id": "c3f78526-8079-49da-b768-f10052c54ee4",
    "slug": "kit-evenement-canva",
    "title": "Kit événement complet (Canva)",
    "category": "Gabarit",
    "price": 6000,
    "originalPrice": 9000,
    "discountPercentage": 33,
    "status": "Pack complet",
    "short": "Badge, affiche, programme, bâche et kakémono assortis pour conférences, mariages et cérémonies.",
    "format": "Canva · PDF",
    "meta": "6 modèles",
    "viewsCount": 4,
    "downloadsCount": 0,
    "description": "Un ensemble cohérent de supports pour habiller un événement sans partir de zéro. Tous les modèles partagent la même identité et se modifient directement dans Canva, sans logiciel payant.",
    "includes": [
      "Badge d'accréditation nominatif",
      "Affiche A3 et visuel réseaux sociaux",
      "Programme de l'événement (A5 plié)",
      "Bâche 3 × 1 m prête à produire",
      "Kakémono 85 × 200 cm",
      "Guide d'adaptation à votre identité"
    ],
    "outcomes": [
      "Habiller un événement avec une identité unifiée",
      "Modifier vos textes et couleurs en quelques minutes",
      "Envoyer des fichiers prêts pour l'atelier"
    ],
    "audience": "Organisateurs d'événements, églises, ONG, entreprises et particuliers préparant une cérémonie.",
    "requirements": [
      "Un compte Canva gratuit",
      "Un navigateur ou l'application Canva"
    ],
    "license": "Utilisation commerciale autorisée sur vos événements. Revente ou partage des modèles interdit.",
    "downloadUrl": "http://localhost:8000/api/v1/public/resources/kit-evenement-canva/download",
    "downloadFileName": "kit-evenement-canva.pdf",
    "isActive": true,
    "createdAt": "2026-11-14T00:02:47+00:00",
    "updatedAt": "2026-11-14T07:32:51+00:00"
  }
}
***
3- AJOUTER UNE RESSOURCE
curl -X 'POST' \
  'http://localhost:8000/api/v1/admin/resources/create' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 432|w4s3Zj2oizu7mKTyceLjJDF59A1csH2JAOz2qKWfc1b66301' \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-CSRF-TOKEN: ' \
  -F 'license=licence oblig' \
  -F 'outcomes=outcom 1,utcome 2' \
  -F 'audience=audience' \
  -F 'meta=des metas' \
  -F 'price=2500' \
  -F 'includes=include 1,include 2' \
  -F 'slug=' \
  -F 'requirements=requiremenet 1,requi 2,requi 3' \
  -F 'isActive=true' \
  -F 'status=STATUS' \
  -F 'format=CE FORMAT' \
  -F 'originalPrice=8000' \
  -F 'title=LE Titre permet de génerer le slug automatiqement; (200 max)' \
  -F 'short=COURTE DESCRIPTION' \
  -F 'file=@concepts-pictos.png;type=image/png' \
  -F 'description=DESCRIPTIO TRES LONGUE' \
  -F 'category=Gabarit'
---
{
  "data": {
    "id": "32df6aab-664c-4f93-ad5e-3aaca71d8a73",
    "slug": "le-titre-permet-de-generer-le-slug-automatiqement-200-max",
    "title": "LE Titre permet de génerer le slug automatiqement; (200 max)",
    "category": "Gabarit",
    "price": 2500,
    "originalPrice": 8000,
    "discountPercentage": 69,
    "status": "STATUS",
    "short": "COURTE DESCRIPTION",
    "format": "CE FORMAT",
    "meta": "des metas",
    "viewsCount": null,
    "downloadsCount": null,
    "isActive": true,
    "createdAt": "2026-11-14T10:57:29+00:00",
    "updatedAt": "2026-11-14T10:57:29+00:00"
  }
}
---
LE CODE POUR LES CHAMPS OBLIGATOIRE, LES MAX de caratère, etc...
<?php

namespace App\Http\Controllers\Api\Admin\Resources;

use App\Enums\ResourceCategory;
use App\Http\Controllers\Controller;
use App\Http\Resources\DigitalResourceResource;
use App\Models\Resource as DigitalResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;
use Throwable;

class CreateController extends Controller
{
  #[OA\Post(
    path: '/admin/resources/create',
    summary: 'Créer une ressource téléchargeable',
    tags: ['NEWADMIN - RESSOURCES'],
    security: [['sanctum' => []]],
    requestBody: new OA\RequestBody(
      required: true,
      content: new OA\MediaType(
        mediaType: 'multipart/form-data',
        schema: new OA\Schema(
          required: ['title', 'category', 'price', 'short', 'description', 'format', 'meta', 'includes', 'outcomes', 'audience', 'requirements', 'license', 'file'],
          properties: [
            new OA\Property(property: 'slug', type: 'string', description: 'Optionnel, généré depuis le titre si omis'),
            new OA\Property(property: 'title', type: 'string', maxLength: 255),
            new OA\Property(property: 'category', type: 'string', enum: ['Gabarit', 'Guide', 'Outil']),
            new OA\Property(property: 'price', type: 'integer', minimum: 0),
            new OA\Property(property: 'originalPrice', type: 'integer', nullable: true, minimum: 0),
            new OA\Property(property: 'status', type: 'string', nullable: true, maxLength: 100),
            new OA\Property(property: 'short', type: 'string', maxLength: 1000),
            new OA\Property(property: 'description', type: 'string', maxLength: 20000),
            new OA\Property(property: 'format', type: 'string', maxLength: 255),
            new OA\Property(property: 'meta', type: 'string', maxLength: 255),
            new OA\Property(property: 'includes', type: 'array', minItems: 1, items: new OA\Items(type: 'string', maxLength: 1000)),
            new OA\Property(property: 'outcomes', type: 'array', minItems: 1, items: new OA\Items(type: 'string', maxLength: 1000)),
            new OA\Property(property: 'audience', type: 'string', maxLength: 5000),
            new OA\Property(property: 'requirements', type: 'array', items: new OA\Items(type: 'string', maxLength: 1000)),
            new OA\Property(property: 'license', type: 'string', maxLength: 10000),
            new OA\Property(property: 'isActive', type: 'boolean'),
            new OA\Property(property: 'file', type: 'string', format: 'binary'),
          ]
        )
      )
    ),
    responses: [
      new OA\Response(response: 201, description: 'Ressource créée'),
      new OA\Response(response: 422, description: 'Erreur de validation'),
      new OA\Response(response: 500, description: 'Erreur lors de la création'),
    ]
  )]
  public function __invoke(Request $request)
  {
    // Transformation automatique si les tableaux sont envoyés en string séparés par des virgules
    foreach (['includes', 'outcomes', 'requirements'] as $field) {
      if ($request->has($field) && is_string($request->input($field))) {
        $request->merge([
          $field => array_map('trim', explode(',', $request->input($field)))
        ]);
      }
    }

    if ($request->has('isActive')) {
      $request->merge(['isActive' => filter_var($request->input('isActive'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)]);
    }

    $validator = Validator::make($request->all(), [
      'slug' => ['nullable', 'string', 'max:200', 'unique:resources,slug'],
      'title' => ['required', 'string', 'max:255'],
      'category' => ['required', Rule::enum(ResourceCategory::class)],
      'price' => ['required', 'integer', 'min:0'],
      'originalPrice' => ['nullable', 'integer', 'min:0', 'gte:price'],
      'status' => ['nullable', 'string', 'max:100'],
      'short' => ['required', 'string', 'max:1000'],
      'description' => ['required', 'string', 'max:20000'],
      'format' => ['required', 'string', 'max:255'],
      'meta' => ['required', 'string', 'max:255'],
      'includes' => ['required', 'array', 'min:1'],
      'includes.*' => ['required', 'string', 'max:1000'],
      'outcomes' => ['required', 'array', 'min:1'],
      'outcomes.*' => ['required', 'string', 'max:1000'],
      'audience' => ['required', 'string', 'max:5000'],
      'requirements' => ['required', 'array'],
      'requirements.*' => ['required', 'string', 'max:1000'],
      'license' => ['required', 'string', 'max:10000'],
      'isActive' => ['sometimes', 'boolean'],
      'file' => ['required', 'file', 'max:15360', 'mimes:pdf,ai,psd,indd,zip,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg'],
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Les données fournies sont invalides.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $data = $validator->validated();

    $file = $request->file('file');
    $filePath = 'resources/' . Str::uuid() . '/' . Str::uuid() . '.' . strtolower($file->getClientOriginalExtension());
    $disk = Storage::disk('r2');

    try {
      $stored = $disk->putFileAs(dirname($filePath), $file, basename($filePath), ['visibility' => 'private']);

      if (!$stored) {
        throw new \RuntimeException('Le fichier n’a pas pu être envoyé vers Cloudflare R2.');
      }

      $resource = DB::transaction(function () use ($data, $file, $filePath) {
        return DigitalResource::create([
          'slug' => $data['slug'] ?? null,
          'title' => $data['title'],
          'category' => $data['category'],
          'price' => $data['price'],
          'original_price' => $data['originalPrice'] ?? null,
          'status' => $data['status'] ?? null,
          'short' => $data['short'],
          'description' => $data['description'],
          'format' => $data['format'],
          'meta' => $data['meta'],
          'includes' => $data['includes'],
          'outcomes' => $data['outcomes'],
          'audience' => $data['audience'],
          'requirements' => $data['requirements'],
          'license' => $data['license'],
          'file_path' => $filePath,
          'original_file_name' => $file->getClientOriginalName(),
          'is_active' => $data['isActive'] ?? true,
        ]);
      });

      return (new DigitalResourceResource($resource))->response()->setStatusCode(201);
    } catch (Throwable $exception) {
      try {
        if ($disk->exists($filePath)) {
          $disk->delete($filePath);
        }
      } catch (Throwable $cleanupException) {
        report($cleanupException);
      }

      report($exception);

      return response()->json(['message' => 'Une erreur est survenue lors de la création de la ressource.'], 500);
    }
  }
}

***
4- MODIFIER UNE RESSOURCE
curl -X 'PUT' \
  'http://localhost:8000/api/v1/admin/resources/32df6aab-664c-4f93-ad5e-3aaca71d8a73' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 432|w4s3Zj2oizu7mKTyceLjJDF59A1csH2JAOz2qKWfc1b66301' \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-CSRF-TOKEN: ' \
  -F 'license=' \
  -F 'outcomes=string' \
  -F 'audience=string' \
  -F 'meta=' \
  -F 'price=0' \
  -F 'includes=string,string2,string3' \
  -F 'requirements=' \
  -F 'isActive=true' \
  -F 'status=' \
  -F 'format=string' \
  -F 'originalPrice=0' \
  -F 'title=nouveau titre' \
  -F 'short=' \
  -F 'file=@ETAT-BACKEND.md;type=text/markdown' \
  -F 'description=' \
  -F 'category=Guide'
---
{
  "data": {
    "id": "32df6aab-664c-4f93-ad5e-3aaca71d8a73",
    "slug": "le-titre-permet-de-generer-le-slug-automatiqement-200-max",
    "title": "nouveau titre",
    "category": "Guide",
    "price": 0,
    "originalPrice": 0,
    "discountPercentage": 0,
    "status": "STATUS",
    "short": "COURTE DESCRIPTION",
    "format": "string",
    "meta": "des metas",
    "viewsCount": 2,
    "downloadsCount": 0,
    "description": "DESCRIPTIO TRES LONGUE",
    "includes": [
      "string",
      "string2",
      "string3"
    ],
    "outcomes": [
      "string"
    ],
    "audience": "string",
    "requirements": [
      "requiremenet 1",
      "requi 2",
      "requi 3"
    ],
    "license": "licence oblig",
    "downloadUrl": "http://localhost:8000/api/v1/public/resources/le-titre-permet-de-generer-le-slug-automatiqement-200-max/download",
    "downloadFileName": "ETAT-BACKEND.md",
    "isActive": true,
    "createdAt": "2026-11-14T10:57:29+00:00",
    "updatedAt": "2026-11-14T11:27:49+00:00"
  }
}
---
LE CODE
<?php

namespace App\Http\Controllers\Api\Admin\Resources;

use App\Enums\ResourceCategory;
use App\Http\Controllers\Controller;
use App\Http\Resources\DigitalResourceResource;
use App\Models\Resource as DigitalResource;
use App\Support\RequestSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;
use Throwable;

class UpdateController extends Controller
{
  #[OA\Put(
    path: '/admin/resources/{id}',
    summary: 'Modifier une ressource téléchargeable',
    tags: ['NEWADMIN - RESSOURCES'],
    security: [['sanctum' => []]],
    parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
    requestBody: new OA\RequestBody(
      content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(properties: [
        new OA\Property(property: 'slug', type: 'string', description: 'Optionnel - à fournir uniquement pour modifier le slug'),
        new OA\Property(property: 'title', type: 'string', maxLength: 255),
        new OA\Property(property: 'category', type: 'string', enum: ['Gabarit', 'Guide', 'Outil']),
        new OA\Property(property: 'price', type: 'integer', minimum: 0),
        new OA\Property(property: 'originalPrice', type: 'integer', nullable: true, minimum: 0),
        new OA\Property(property: 'status', type: 'string', nullable: true, maxLength: 100),
        new OA\Property(property: 'short', type: 'string', maxLength: 1000),
        new OA\Property(property: 'description', type: 'string', maxLength: 20000),
        new OA\Property(property: 'format', type: 'string', maxLength: 255),
        new OA\Property(property: 'meta', type: 'string', maxLength: 255),
        new OA\Property(property: 'includes', type: 'array', minItems: 1, items: new OA\Items(type: 'string', maxLength: 1000)),
        new OA\Property(property: 'outcomes', type: 'array', minItems: 1, items: new OA\Items(type: 'string', maxLength: 1000)),
        new OA\Property(property: 'audience', type: 'string', maxLength: 5000),
        new OA\Property(property: 'requirements', type: 'array', items: new OA\Items(type: 'string', maxLength: 1000)),
        new OA\Property(property: 'license', type: 'string', maxLength: 10000),
        new OA\Property(property: 'isActive', type: 'boolean'),
        new OA\Property(property: 'file', type: 'string', format: 'binary'),
      ]))
    ),
    responses: [
      new OA\Response(response: 200, description: 'Ressource modifiée'),
      new OA\Response(response: 404, description: 'Ressource introuvable'),
      new OA\Response(response: 422, description: 'Erreur de validation'),
      new OA\Response(response: 500, description: 'Erreur lors de la modification'),
    ]
  )]
  public function __invoke(Request $request, string $id)
  {
    $resource = DigitalResource::findOrFail($id);
    $data = RequestSanitizer::filled($request);

    // Traitement spécifique des champs tableaux
    foreach (['includes', 'outcomes', 'requirements'] as $field) {
      if ($request->has($field)) {
        $value = $request->input($field);
        if (is_string($value)) {
          $decoded = json_decode($value, true);
          if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $data[$field] = $decoded;
          } else {
            // Ignore les valeurs vides si la chaîne est vide
            $data[$field] = array_filter(array_map('trim', explode(',', $value)));
          }
        } elseif (is_array($value)) {
          $data[$field] = $value;
        }
      }
    }

    // Conversion automatique des prix de string (multipart) en int
    foreach (['price', 'originalPrice'] as $priceField) {
      if (isset($data[$priceField]) && $data[$priceField] !== '') {
        $data[$priceField] = (int) $data[$priceField];
      }
    }

    // Traitement du booléen isActive
    if (isset($data['isActive'])) {
      $data['isActive'] = filter_var($data['isActive'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    }

    $validator = Validator::make($data, [
      'slug' => ['sometimes', 'string', 'max:200', Rule::unique('resources', 'slug')->ignore($resource->id)],
      'title' => ['sometimes', 'string', 'max:255'],
      'category' => ['sometimes', Rule::enum(ResourceCategory::class)],
      'price' => ['sometimes', 'integer', 'min:0'],
      'originalPrice' => ['sometimes', 'nullable', 'integer', 'min:0'],
      'status' => ['sometimes', 'nullable', 'string', 'max:100'],
      'short' => ['sometimes', 'string', 'max:1000'],
      'description' => ['sometimes', 'string', 'max:20000'],
      'format' => ['sometimes', 'string', 'max:255'],
      'meta' => ['sometimes', 'string', 'max:255'],
      'includes' => ['sometimes', 'array', 'min:1'],
      'includes.*' => ['string', 'max:1000'],
      'outcomes' => ['sometimes', 'array', 'min:1'],
      'outcomes.*' => ['string', 'max:1000'],
      'audience' => ['sometimes', 'string', 'max:5000'],
      'requirements' => ['sometimes', 'array'],
      'requirements.*' => ['string', 'max:1000'],
      'license' => ['sometimes', 'string', 'max:10000'],
      'isActive' => ['sometimes', 'boolean'],
      'file' => ['sometimes', 'file', 'max:15360', 'mimes:pdf,ai,psd,indd,zip,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg,md,txt'],
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Les données fournies sont invalides.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $validated = $validator->validated();

    $fieldMap = [
      'slug' => 'slug',
      'title' => 'title',
      'category' => 'category',
      'price' => 'price',
      'originalPrice' => 'original_price',
      'status' => 'status',
      'short' => 'short',
      'description' => 'description',
      'format' => 'format',
      'meta' => 'meta',
      'includes' => 'includes',
      'outcomes' => 'outcomes',
      'audience' => 'audience',
      'requirements' => 'requirements',
      'license' => 'license',
      'isActive' => 'is_active',
    ];

    $changes = [];

    foreach ($fieldMap as $input => $column) {
      if (array_key_exists($input, $validated)) {
        $changes[$column] = $validated[$input];
      }
    }

    $disk = Storage::disk('r2');
    $newPath = null;
    $oldPath = null;

    try {

      // Upload du nouveau fichier
      if ($request->hasFile('file')) {
        $file = $request->file('file');
        $directory = 'resources/' . Str::uuid();
        $filename = Str::uuid() . '.' . strtolower($file->getClientOriginalExtension());

        $newPath = $disk->putFileAs($directory, $file, $filename, ['visibility' => 'private']);

        if (!$newPath) {
          throw new \RuntimeException('Impossible d’envoyer le nouveau fichier vers Cloudflare R2.');
        }

        $oldPath = $resource->file_path;

        $changes['file_path'] = $newPath;
        $changes['original_file_name'] = $file->getClientOriginalName();
      }

      // Mise à jour en base de données
      DB::transaction(function () use ($resource, $changes) {
        $resource->update($changes);
      });
    } catch (Throwable $exception) {

      // Nettoyage du nouveau fichier si la mise à jour échoue
      if ($newPath) {
        try {
          $disk->delete($newPath);
        } catch (Throwable $cleanupException) {
          report($cleanupException);
        }
      }

      report($exception);

      return response()->json([
        'message' => 'Une erreur est survenue lors de la modification de la ressource.',
      ], 500);
    }

    // Suppression de l'ancien fichier après réussite de la mise à jour
    if ($oldPath && $oldPath !== $newPath) {
      try {
        $disk->delete($oldPath);
      } catch (Throwable $exception) {
        report($exception);
      }
    }

    return new DigitalResourceResource($resource->refresh());
  }
}
***
5- CHANGER LA VISIBILITE
curl -X 'PATCH' \
  'http://localhost:8000/api/v1/admin/resources/32df6aab-664c-4f93-ad5e-3aaca71d8a73/visibility' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 432|w4s3Zj2oizu7mKTyceLjJDF59A1csH2JAOz2qKWfc1b66301' \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-CSRF-TOKEN: ' \
  -F 'isActive=false'
---
{
  "data": {
    "id": "32df6aab-664c-4f93-ad5e-3aaca71d8a73",
    "slug": "le-titre-permet-de-generer-le-slug-automatiqement-200-max",
    "title": "nouveau titre",
    "category": "Guide",
    "price": 0,
    "originalPrice": 0,
    "discountPercentage": 0,
    "status": "STATUS",
    "short": "COURTE DESCRIPTION",
    "format": "string",
    "meta": "des metas",
    "viewsCount": 2,
    "downloadsCount": 0,
    "description": "DESCRIPTIO TRES LONGUE",
    "includes": [
      "string",
      "string2",
      "string3"
    ],
    "outcomes": [
      "string"
    ],
    "audience": "string",
    "requirements": [
      "requiremenet 1",
      "requi 2",
      "requi 3"
    ],
    "license": "licence oblig",
    "downloadUrl": "http://localhost:8000/api/v1/public/resources/le-titre-permet-de-generer-le-slug-automatiqement-200-max/download",
    "downloadFileName": "ETAT-BACKEND.md",
    "isActive": false,
    "createdAt": "2026-11-14T10:57:29+00:00",
    "updatedAt": "2026-11-14T11:35:18+00:00"
  }
}
***
6- DELET
curl -X 'DELETE' \
  'http://localhost:8000/api/v1/admin/resources/32df6aab-664c-4f93-ad5e-3aaca71d8a73' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 432|w4s3Zj2oizu7mKTyceLjJDF59A1csH2JAOz2qKWfc1b66301' \
  -H 'X-CSRF-TOKEN: '
***
***

inspire toi de src\routes\_admin\articles\index.tsx, src\routes\_admin\articles\$id.tsx, pour m'ecire la page src\routes\_admin\ressources

inspire toi du bouton 
{isPublished && (
                <Button variant="outline" size="sm" onClick={handleDisable} disabled={disableMutation.isPending}>
                  <Ban className="h-4 w-4 mr-1" /> Désactiver
                </Button>
              )} de src\routes\_admin\jobs\offers\$id.tsx pour la visibilité.
              
              pour les fihciers, utilise src\components\site\FilePreviewModal.tsx et import { resolveStorageUrl } from "@/lib/api/file"; pour les aperçus
              *** comme dans src\components\pages\community\posts\detail\Attachment.tsx, src\components\pages\profile\ProfileEditDialog.tsx ou dans src\routes\_admin\jobs\applications\$id.tsx
              ***

              Code morcleer comme pour src\routes\_admin\articles