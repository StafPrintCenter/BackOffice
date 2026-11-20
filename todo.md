On peut désormais aussi ajouter des sondages dans la publication des communautés
1- CREATIONS
curl -X 'POST' \
  'http://localhost:8000/api/v1/community/posts/create' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 447|ZTEoRLTOVj9IKW6xROK66Jq3hy8RjAfueH9dYZY087a7150d' \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-CSRF-TOKEN: ' \
  -F 'title=On change de formateur ?' \
  -F 'body=Plusiuers sollicite un nouveau formateur' \
  -F 'categoryId=01a18cbb-6238-73c2-bb6f-32201b4e803f' \
  -F 'trainingId=7f0700a2-c768-4cd8-a672-889c4c969233' \
  -F 'type=poll' \
  -F 'options=Oui,Non,On verra,Je ne vote pas' \
  -F 'tags=changment, formateur, performance' \
  -F 'attachments='
---
{
  "data": {
    "id": "01a1faeb-7331-7331-a0c7-13ade35b63e4",
    "title": "On change de formateur ?",
    "type": "poll",
    "excerpt": "Plusiuers sollicite un nouveau formateur",
    "tags": [
      "changment",
      "formateur",
      "performance"
    ],
    "scope": "training",
    "category": {
      "id": "01a18cbb-6238-73c2-bb6f-32201b4e803f",
      "name": "Questions & entraide",
      "slug": "questions-entraide",
      "color": "#2563EB"
    },
    "training": {
      "id": "7f0700a2-c768-4cd8-a672-889c4c969233",
      "title": "Initiation à la cybersécurité : protéger ses données et son activité"
    },
    "author": {
      "id": "cda0c4d3-70af-4585-9fb5-19d5c2357e18",
      "name": "Steve Aster AFOVO",
      "photo": null,
      "role": "admin"
    },
    "isMine": true,
    "status": "published",
    "isPinned": false,
    "isLocked": false,
    "bestAnswerId": null,
    "commentsCount": 0,
    "reactionsTotal": 0,
    "reactions": {},
    "myReaction": null,
    "viewsCount": 0,
    "attachmentsCount": 0,
    "createdAt": "2026-11-20T21:44:56+00:00",
    "editedAt": null,
    "permissions": {
      "canEdit": true,
      "canDelete": true,
      "canModerate": true,
      "canHide": true,
      "canLock": true,
      "canComment": true,
      "canReact": true,
      "canReport": false
    },
    "hiddenReason": null,
    "hiddenAt": null,
    "body": "Plusiuers sollicite un nouveau formateur",
    "attachments": [],
    "poll": {
      "options": [
        {
          "id": "01a1faeb-7415-70f6-bba4-bdc1b3ea69b8",
          "label": "Oui",
          "votesCount": 0
        },
        {
          "id": "01a1faeb-7483-711f-ae63-db6c37969f7d",
          "label": "Non",
          "votesCount": 0
        },
        {
          "id": "01a1faeb-7541-72ce-b718-322dd123f484",
          "label": "On verra",
          "votesCount": 0
        },
        {
          "id": "01a1faeb-75ad-7222-9715-10a622433bef",
          "label": "Je ne vote pas",
          "votesCount": 0
        }
      ],
      "myVote": null
    }
  }
}
---
LE CODE
<?php

namespace App\Http\Controllers\Api\Common\Community\Posts;

use App\Enums\CommunityPostType;
use App\Enums\NotificationAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityPostResource;
use App\Models\CommunityPost;
use App\Support\CommunityAccess;
use App\Support\CommunityActor;
use App\Support\CommunityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class CreateController extends Controller
{
  #[OA\Post(
    path: '/community/posts/create',
    summary: 'Publier (admin, formateur, apprenant). Sans trainingId : communauté générale',
    description: "Un apprenant ne publie que dans les formations où il est inscrit, un formateur dans celles où il est assigné, un admin partout. Les annonces et sondages sont réservés aux admins et formateurs. Un sondage nécessite 2 à 10 options.",
    tags: ['COMMUN - COMMUNAUTE PUBLICATION'],
    security: [['sanctum' => []]],
    requestBody: new OA\RequestBody(
      required: true,
      content: new OA\MediaType(
        mediaType: 'multipart/form-data',
        schema: new OA\Schema(
          required: ['title', 'body', 'categoryId'],
          properties: [
            new OA\Property(property: 'title', type: 'string'),
            new OA\Property(property: 'body', type: 'string'),
            new OA\Property(property: 'categoryId', type: 'string'),
            new OA\Property(property: 'trainingId', type: 'string', description: 'Vide = communauté générale'),
            new OA\Property(property: 'type', type: 'string', enum: ['discussion', 'question', 'resource', 'announcement', 'poll'], default: 'discussion'),
            new OA\Property(property: 'options', type: 'array', collectionFormat: 'multi', description: 'Options requises pour un sondage (2 à 10).', items: new OA\Items(type: 'string', maxLength: 100)),
            new OA\Property(property: 'tags', type: 'string', description: '5 max, séparés par des virgules ou tableau JSON'),
            new OA\Property(
              property: 'attachments',
              type: 'array',
              collectionFormat: 'multi',
              description: 'Pièces jointes facultatives : 2 fichiers maximum, 1 Mo chacun.',
              items: new OA\Items(type: 'string', format: 'binary')
            ),
          ]
        )
      )
    ),
    responses: [
      new OA\Response(response: 201, description: 'Publication créée'),
      new OA\Response(response: 403, description: 'Non membre de la formation / type non autorisé'),
      new OA\Response(response: 422, description: 'Erreur de validation'),
    ]
  )]
  public function __invoke(Request $request)
  {
    $me = $request->user();

    $normalizedOptions = $this->normalizeOptions($request->input('options'));

    $request->merge([
      'tags' => CommunityService::normalizeTags($request->input('tags')),
      'options' => $normalizedOptions,
    ]);

    $validator = Validator::make($request->all(), [
      'title' => ['required', 'string', 'min:3', 'max:80'],
      'body' => ['required', 'string', 'min:20', 'max:1000'],
      'categoryId' => ['required', 'uuid', Rule::exists('community_categories', 'id')->where('is_active', true)],
      'trainingId' => ['nullable', 'uuid', 'exists:trainings,id'],
      'type' => ['nullable', Rule::enum(CommunityPostType::class)],
      'options' => ['prohibited_unless:type,poll', 'required_if:type,poll', 'array', 'min:2', 'max:10'],
      'options.*' => ['required', 'string', 'min:1', 'max:100', 'distinct:ignore_case'],
      'tags' => ['nullable', 'array', 'max:' . CommunityService::MAX_TAGS],
      'attachments' => ['nullable', 'array', 'max:2'],
      'attachments.*' => ['file', 'max:1024', 'mimes:jpg,jpeg,png,webp,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,zip'],
    ]);

    if ($validator->fails()) {
      return response()->json(['message' => 'Les données fournies sont invalides.', 'errors' => $validator->errors()], 422);
    }

    $data = $validator->validated();
    $type = $data['type'] ?? 'discussion';
    $trainingId = $data['trainingId'] ?? null;

    if (in_array($type, ['announcement', 'poll'], true) && CommunityActor::role($me) === 'student') {
      return response()->json(['message' => 'Les annonces et sondages sont réservés aux formateurs et aux admins.'], 403);
    }

    if ($trainingId && ! CommunityAccess::isMember($me, $trainingId)) {
      return response()->json(['message' => "Vous n'êtes pas membre de cette formation."], 403);
    }

    $files = [];
    foreach ($request->file('attachments', []) as $file) {
      $path = $file->store('community', 'public');
      $files[] = [
        'name' => $file->getClientOriginalName(),
        'path' => $path,
        'url' => Storage::disk('public')->url($path),
        'mime' => $file->getClientMimeType(),
        'size' => $file->getSize(),
      ];
    }

    $post = DB::transaction(function () use ($me, $trainingId, $data, $type, $files) {
      $post = CommunityPost::create([
        'author_type' => $me->getMorphClass(),
        'author_id' => $me->id,
        'training_id' => $trainingId,
        'category_id' => $data['categoryId'],
        'title' => $data['title'],
        'body' => $data['body'],
        'type' => $type,
        'tags' => $data['tags'] ?? null,
        'attachments' => $files ?: null,
        'status' => 'published',
      ]);

      if ($type === 'poll') {
        $post->pollOptions()->createMany(array_map(
          fn(string $label, int $position) => ['label' => $label, 'position' => $position],
          $data['options'],
          array_keys($data['options'])
        ));
      }

      return $post;
    });

    $post->load(['author', 'training:id,title', 'category:id,name,slug,color']);

    if ($type === 'announcement' && $trainingId) {
      foreach (CommunityService::trainingMembers($trainingId, $me) as $member) {
        CommunityService::notify(
          $member,
          'community_post.created',
          'Nouvelle annonce',
          "{$me->name} a publié une annonce : « {$post->title} ».",
          ['postId' => $post->id, 'trainingId' => $trainingId],
          CommunityService::url($post),
          NotificationAction::Created
        );
      }
    }

    CommunityService::hydratePolls(collect([$post]), $me);

    return CommunityPostResource::detailed($post)->response()->setStatusCode(201);
  }

  private function normalizeOptions(mixed $rawOptions): ?array
  {
    $options = method_exists(CommunityService::class, 'normalizePollOptions')
      ? CommunityService::normalizePollOptions($rawOptions)
      : $rawOptions;

    if (is_null($options) || $options === '') {
      return null;
    }

    if (is_string($options)) {
      $decoded = json_decode($options, true);
      if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        $options = $decoded;
      } else {
        $options = explode(',', $options);
      }
    }

    if (! is_array($options)) {
      return null;
    }

    $cleaned = array_values(array_filter(
      array_map(fn($item) => is_string($item) ? trim($item) : $item, $options),
      fn($item) => $item !== null && $item !== ''
    ));

    return $cleaned;
  }
}
***
nouveau enum (poll)
<?php

namespace App\Enums;

enum CommunityPostType: string
{
  case Discussion = 'discussion';
  case Question = 'question';
  case Resource = 'resource';
  case Announcement = 'announcement';
  case Poll = 'poll';
}
***
2- MODIFICATION DE PUBLICATION
<?php

namespace App\Http\Controllers\Api\Common\Community\Posts;

use App\Enums\CommunityPostType;
use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityPostResource;
use App\Models\CommunityPost;
use App\Support\CommunityAccess;
use App\Support\CommunityActor;
use App\Support\CommunityService;
use App\Support\RequestSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class UpdateController extends Controller
{
  #[OA\Put(
    path: '/community/posts/{id}',
    summary: "Modifier sa publication (auteur uniquement ; la formation et les pièces jointes ne changent pas)",
    tags: ['COMMUN - COMMUNAUTE PUBLICATION'],
    security: [['sanctum' => []]],
    parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
    requestBody: new OA\RequestBody(
      required: true,
      content: new OA\MediaType(
        mediaType: 'multipart/form-data',
        schema: new OA\Schema(properties: [
          new OA\Property(property: 'title', type: 'string'),
          new OA\Property(property: 'body', type: 'string'),
          new OA\Property(property: 'categoryId', type: 'string'),
          new OA\Property(property: 'type', type: 'string', enum: ['discussion', 'question', 'resource', 'announcement', 'poll']),
          new OA\Property(property: 'tags', type: 'string'),
          new OA\Property(property: 'options', type: 'array', description: 'Options du sondage (2 à 10), modifiables uniquement avant le premier vote.', items: new OA\Items(type: 'string', maxLength: 100)),
        ])
      )
    ),
    responses: [
      new OA\Response(response: 200, description: 'Publication modifiée'),
      new OA\Response(response: 403, description: 'Pas l\'auteur'),
      new OA\Response(response: 409, description: 'Publication masquée'),
      new OA\Response(response: 422, description: 'Erreur de validation'),
    ]
  )]
  public function __invoke(Request $request, string $id)
  {
    $me = $request->user();
    $post = CommunityPost::findOrFail($id);

    if (! CommunityAccess::isAuthor($me, $post)) {
      return response()->json(['message' => "Seul l'auteur peut modifier cette publication."], 403);
    }

    if ($post->status?->value === 'hidden') {
      return response()->json(['message' => 'Cette publication est masquée par la modération.'], 409);
    }

    $data = RequestSanitizer::filled($request);

    if (array_key_exists('tags', $data)) {
      $data['tags'] = CommunityService::normalizeTags($data['tags']);
    }
    if (array_key_exists('options', $data)) {
      $data['options'] = CommunityService::normalizePollOptions($data['options']);
    }

    $newType = $data['type'] ?? $post->type?->value;
    $validator = Validator::make($data, [
      'title' => ['sometimes', 'string', 'min:3', 'max:80'],
      'body' => ['sometimes', 'string', 'min:20', 'max:1000'],
      'categoryId' => ['sometimes', 'uuid', Rule::exists('community_categories', 'id')->where('is_active', true)],
      'type' => ['sometimes', Rule::enum(CommunityPostType::class)],
      'tags' => ['sometimes', 'nullable', 'array', 'max:' . CommunityService::MAX_TAGS],
      'options' => [
        Rule::prohibitedIf($newType !== 'poll'),
        $newType === 'poll' && $post->type?->value !== 'poll' ? 'required' : 'sometimes',
        'array',
        'min:2',
        'max:10',
      ],
      'options.*' => ['required', 'string', 'min:1', 'max:100', 'distinct:ignore_case'],
    ]);

    if ($validator->fails()) {
      return response()->json(['message' => 'Les données fournies sont invalides.', 'errors' => $validator->errors()], 422);
    }

    $valid = $validator->validated();

    if (in_array($valid['type'] ?? null, ['announcement', 'poll'], true) && CommunityActor::role($me) === 'student') {
      return response()->json(['message' => 'Les annonces et sondages sont réservés aux formateurs et aux admins.'], 403);
    }

    $updated = DB::transaction(function () use ($post, $valid, $newType) {
      CommunityPost::whereKey($post->id)->lockForUpdate()->firstOrFail();

      if ($post->pollVotes()->exists() && (($newType !== 'poll') || array_key_exists('options', $valid))) {
        return false;
      }

      $post->fill([
        'title' => $valid['title'] ?? $post->title,
        'body' => $valid['body'] ?? $post->body,
        'category_id' => $valid['categoryId'] ?? $post->category_id,
        'type' => $valid['type'] ?? $post->type,
        'tags' => array_key_exists('tags', $valid) ? $valid['tags'] : $post->tags,
      ]);

      if ($post->isDirty()) {
        $post->edited_at = now();
        $post->save();
      }

      if (array_key_exists('options', $valid)) {
        $post->pollOptions()->delete();
        $post->pollOptions()->createMany(array_map(
          fn(string $label, int $position) => ['label' => $label, 'position' => $position],
          $valid['options'],
          array_keys($valid['options'])
        ));
      } elseif ($newType !== 'poll') {
        $post->pollOptions()->delete();
      }

      return true;
    });

    if (! $updated) {
      return response()->json(['message' => "Les options et le type d'un sondage ne peuvent plus être modifiés après le premier vote."], 409);
    }

    $post->load(['author', 'training:id,title', 'category:id,name,slug,color'])
      ->loadCount([
        'comments as comments_count' => fn($q) => $q->where('status', 'published'),
        'reactions as reactions_count',
      ]);

    CommunityService::hydrateReactions(collect([$post]), $me);
    CommunityService::hydratePolls(collect([$post]), $me);

    return CommunityPostResource::detailed($post);
  }
}
***
3- LISTE DES PUBLICATIONS
curl -X 'GET' \
  'http://localhost:8000/api/v1/community/posts/list?page=1&perPage=12' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 447|ZTEoRLTOVj9IKW6xROK66Jq3hy8RjAfueH9dYZY087a7150d' \
  -H 'X-CSRF-TOKEN: '
---
{
  "data": [
    {
      "id": "01a1faeb-7331-7331-a0c7-13ade35b63e4",
      "title": "On change de formateur ?",
      "type": "poll",
      "excerpt": "Plusiuers sollicite un nouveau formateur",
      "tags": [
        "changment",
        "formateur",
        "performance"
      ],
      "scope": "training",
      "category": {
        "id": "01a18cbb-6238-73c2-bb6f-32201b4e803f",
        "name": "Questions & entraide",
        "slug": "questions-entraide",
        "color": "#2563EB"
      },
      "training": {
        "id": "7f0700a2-c768-4cd8-a672-889c4c969233",
        "title": "Initiation à la cybersécurité : protéger ses données et son activité"
      },
      "author": {
        "id": "cda0c4d3-70af-4585-9fb5-19d5c2357e18",
        "name": "Steve Aster AFOVO",
        "photo": null,
        "role": "admin"
      },
      "isMine": true,
      "status": "published",
      "isPinned": false,
      "isLocked": false,
      "bestAnswerId": null,
      "commentsCount": 0,
      "reactionsTotal": 0,
      "reactions": {},
      "myReaction": null,
      "viewsCount": 0,
      "attachmentsCount": 0,
      "createdAt": "2026-11-20T21:44:56+00:00",
      "editedAt": null,
      "permissions": {
        "canEdit": true,
        "canDelete": true,
        "canModerate": true,
        "canHide": true,
        "canLock": true,
        "canComment": true,
        "canReact": true,
        "canReport": false
      },
      "hiddenReason": null,
      "hiddenAt": null,
      "poll": {
        "optionsCount": 4,
        "totalVotes": 0
      }
    }
  ],
  "meta": {
    "currentPage": 1,
    "lastPage": 1,
    "perPage": 12,
    "total": 1
  }
}
***
4- DETAIL D'UNE PUBLICATION
curl -X 'GET' \
  'http://localhost:8000/api/v1/community/posts/01a1faeb-7331-7331-a0c7-13ade35b63e4' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 447|ZTEoRLTOVj9IKW6xROK66Jq3hy8RjAfueH9dYZY087a7150d' \
  -H 'X-CSRF-TOKEN: '
---
{
  "data": {
    "id": "01a1faeb-7331-7331-a0c7-13ade35b63e4",
    "title": "On change de formateur ?",
    "type": "poll",
    "excerpt": "Plusiuers sollicite un nouveau formateur",
    "tags": [
      "changment",
      "formateur",
      "performance"
    ],
    "scope": "training",
    "category": {
      "id": "01a18cbb-6238-73c2-bb6f-32201b4e803f",
      "name": "Questions & entraide",
      "slug": "questions-entraide",
      "color": "#2563EB"
    },
    "training": {
      "id": "7f0700a2-c768-4cd8-a672-889c4c969233",
      "title": "Initiation à la cybersécurité : protéger ses données et son activité"
    },
    "author": {
      "id": "cda0c4d3-70af-4585-9fb5-19d5c2357e18",
      "name": "Steve Aster AFOVO",
      "photo": null,
      "role": "admin"
    },
    "isMine": true,
    "status": "published",
    "isPinned": false,
    "isLocked": false,
    "bestAnswerId": null,
    "commentsCount": 0,
    "reactionsTotal": 0,
    "reactions": {},
    "myReaction": null,
    "viewsCount": 0,
    "attachmentsCount": 0,
    "createdAt": "2026-11-20T21:44:56+00:00",
    "editedAt": null,
    "permissions": {
      "canEdit": true,
      "canDelete": true,
      "canModerate": true,
      "canHide": true,
      "canLock": true,
      "canComment": true,
      "canReact": true,
      "canReport": false
    },
    "hiddenReason": null,
    "hiddenAt": null,
    "body": "Plusiuers sollicite un nouveau formateur",
    "attachments": [],
    "poll": {
      "optionsCount": 4,
      "totalVotes": 0,
      "options": [
        {
          "id": "01a1faeb-7415-70f6-bba4-bdc1b3ea69b8",
          "label": "Oui",
          "votesCount": 0
        },
        {
          "id": "01a1faeb-7483-711f-ae63-db6c37969f7d",
          "label": "Non",
          "votesCount": 0
        },
        {
          "id": "01a1faeb-7541-72ce-b718-322dd123f484",
          "label": "On verra",
          "votesCount": 0
        },
        {
          "id": "01a1faeb-75ad-7222-9715-10a622433bef",
          "label": "Je ne vote pas",
          "votesCount": 0
        }
      ],
      "myVote": null
    }
  }
}
***
5- VOTER 
curl -X 'POST' \
  'http://localhost:8000/api/v1/community/posts/01a1faeb-7331-7331-a0c7-13ade35b63e4/vote' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 447|ZTEoRLTOVj9IKW6xROK66Jq3hy8RjAfueH9dYZY087a7150d' \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-CSRF-TOKEN: ' \
  -F 'optionId=01a1faeb-7415-70f6-bba4-bdc1b3ea69b8'
---
{
  "data": {
    "id": "01a1faeb-7331-7331-a0c7-13ade35b63e4",
    "title": "On change de formateur ?",
    "type": "poll",
    "excerpt": "Plusiuers sollicite un nouveau formateur",
    "tags": [
      "changment",
      "formateur",
      "performance"
    ],
    "scope": "training",
    "category": {
      "id": "01a18cbb-6238-73c2-bb6f-32201b4e803f",
      "name": "Questions & entraide",
      "slug": "questions-entraide",
      "color": "#2563EB"
    },
    "training": {
      "id": "7f0700a2-c768-4cd8-a672-889c4c969233",
      "title": "Initiation à la cybersécurité : protéger ses données et son activité"
    },
    "author": {
      "id": "cda0c4d3-70af-4585-9fb5-19d5c2357e18",
      "name": "Steve Aster AFOVO",
      "photo": null,
      "role": "admin"
    },
    "isMine": true,
    "status": "published",
    "isPinned": false,
    "isLocked": false,
    "bestAnswerId": null,
    "commentsCount": 0,
    "reactionsTotal": 0,
    "reactions": {},
    "myReaction": null,
    "viewsCount": 0,
    "attachmentsCount": 0,
    "createdAt": "2026-11-20T21:44:56+00:00",
    "editedAt": null,
    "permissions": {
      "canEdit": true,
      "canDelete": true,
      "canModerate": true,
      "canHide": true,
      "canLock": true,
      "canComment": true,
      "canReact": true,
      "canReport": false
    },
    "hiddenReason": null,
    "hiddenAt": null,
    "body": "Plusiuers sollicite un nouveau formateur",
    "attachments": [],
    "poll": {
      "optionsCount": 4,
      "totalVotes": 1,
      "options": [
        {
          "id": "01a1faeb-7415-70f6-bba4-bdc1b3ea69b8",
          "label": "Oui",
          "votesCount": 1
        },
        {
          "id": "01a1faeb-7483-711f-ae63-db6c37969f7d",
          "label": "Non",
          "votesCount": 0
        },
        {
          "id": "01a1faeb-7541-72ce-b718-322dd123f484",
          "label": "On verra",
          "votesCount": 0
        },
        {
          "id": "01a1faeb-75ad-7222-9715-10a622433bef",
          "label": "Je ne vote pas",
          "votesCount": 0
        }
      ],
      "myVote": "01a1faeb-7415-70f6-bba4-bdc1b3ea69b8"
    }
  }
}
---
LE CODE
<?php

namespace App\Http\Controllers\Api\Common\Community\Posts;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityPostResource;
use App\Models\CommunityPollVote;
use App\Models\CommunityPost;
use App\Support\CommunityAccess;
use App\Support\CommunityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class VoteController extends Controller
{
  #[OA\Post(
    path: '/community/posts/{id}/vote',
    summary: "Voter une seule fois à un sondage",
    description: 'Un vote ne peut pas être modifié. Les membres autorisés à voir la publication peuvent voter.',
    tags: ['COMMUN - COMMUNAUTE PUBLICATION'],
    security: [['sanctum' => []]],
    parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
    requestBody: new OA\RequestBody(
      required: true,
      content: new OA\MediaType(
        mediaType: 'multipart/form-data',
        schema: new OA\Schema(required: ['optionId'], properties: [
          new OA\Property(property: 'optionId', type: 'string', format: 'uuid'),
        ])
      )
    ),
    responses: [
      new OA\Response(response: 200, description: 'Vote enregistré'),
      new OA\Response(response: 403, description: 'Accès refusé'),
      new OA\Response(response: 409, description: 'Vote déjà enregistré / publication fermée'),
      new OA\Response(response: 422, description: 'Sondage ou option invalide'),
    ]
  )]
  public function __invoke(Request $request, string $id)
  {
    $me = $request->user();
    $post = CommunityPost::with(['author', 'training:id,title', 'category:id,name,slug,color'])->findOrFail($id);

    if (! CommunityAccess::canViewPost($me, $post)) {
      return response()->json(['message' => "Vous n'avez pas accès à cette publication."], 403);
    }

    if ($post->type?->value !== 'poll') {
      return response()->json(['message' => 'Cette publication n’est pas un sondage.'], 422);
    }

    if ($post->status?->value !== 'published') {
      return response()->json(['message' => 'Ce sondage n’accepte plus de votes.'], 409);
    }

    $validator = Validator::make($request->all(), [
      'optionId' => ['required', 'uuid', 'exists:community_poll_options,id'],
    ]);

    if ($validator->fails()) {
      return response()->json(['message' => 'Les données fournies sont invalides.', 'errors' => $validator->errors()], 422);
    }

    $option = $post->pollOptions()->whereKey($validator->validated()['optionId'])->first();
    if (! $option) {
      return response()->json(['message' => 'Cette option n’appartient pas à ce sondage.'], 422);
    }

    $result = DB::transaction(function () use ($post, $me, $option) {
      $lockedPost = CommunityPost::whereKey($post->id)->lockForUpdate()->firstOrFail();

      if ($lockedPost->type?->value !== 'poll' || $lockedPost->status?->value !== 'published') {
        return 'closed';
      }

      if (! $lockedPost->pollOptions()->whereKey($option->id)->exists()) {
        return 'option_changed';
      }

      $alreadyVoted = CommunityPollVote::where('post_id', $post->id)
        ->where('voter_type', $me->getMorphClass())
        ->where('voter_id', $me->id)
        ->exists();

      if ($alreadyVoted) {
        return 'already_voted';
      }

      CommunityPollVote::create([
        'post_id' => $post->id,
        'option_id' => $option->id,
        'voter_type' => $me->getMorphClass(),
        'voter_id' => $me->id,
      ]);

      return 'recorded';
    });

    if ($result === 'already_voted') {
      return response()->json(['message' => 'Vous avez déjà voté à ce sondage. Votre vote est définitif.'], 409);
    }
    if ($result === 'closed') {
      return response()->json(['message' => 'Ce sondage n’accepte plus de votes.'], 409);
    }
    if ($result === 'option_changed') {
      return response()->json(['message' => 'Cette option n’appartient plus à ce sondage.'], 422);
    }

    $post->loadCount([
      'comments as comments_count' => fn($query) => $query->where('status', 'published'),
      'reactions as reactions_count',
    ]);
    CommunityService::hydrateReactions(collect([$post]), $me);
    CommunityService::hydratePolls(collect([$post]), $me);

    return new CommunityPostResource($post);
  }
}
***


TACHE (à effectuer sur src\routes\_admin\community\posts\index.tsx et src\routes\_admin\community\posts\$id.tsx)
1+2- Ajuste la création et la modification de publication pour prendre en compte le type sondage
3- Dans la carde de des liste publique des publications, si sondage, on utilise les stages "poll": {  "optionsCount": 4,     "totalVotes": 0    }
4+5- Dans les détails, on va ajouter les states de sondage et les options si sondage. Puis avec la possibilité de voter


