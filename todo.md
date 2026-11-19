J'ai
1- LISTE DES SIGNALEMNT ETHIQUES
curl -X 'GET' \
  'http://localhost:8000/api/v1/admin/reports/ethical/list?page=1&perPage=20' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 438|3JjWB2pPzomb5xDJ2sw1skUXzZFcFqQGeSCy5STteee0f9bd' \
  -H 'X-CSRF-TOKEN: '
  ---
  {
  "data": [
    {
      "id": "a8065217-1b14-4fda-a613-8bac14e0dcd8",
      "trackingCode": "SPC-ETH_20261118_225359-VN8R",
      "category": "Conflit d'intérêts",
      "concerned": "Steve",
      "occurrencePeriod": "sssssss",
      "description": "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
      "evidence": "ddddddddddd",
      "anonymous": true,
      "contact": null,
      "goodFaith": true,
      "status": "pending",
      "resolvedBy": null,
      "resolvedAt": null,
      "createdAt": "2026-11-18T22:53:59+00:00",
      "updatedAt": "2026-11-18T22:53:59+00:00"
    },
    {
      "id": "2e7dfabd-ba59-467c-b27c-44e3c32a69f1",
      "trackingCode": "SPC-ETH_20261118_224437-NWA3",
      "category": "Corruption active ou passive",
      "concerned": "qqsssss",
      "occurrencePeriod": "sssssss",
      "description": "dddddddddddddddddddddddddddddddddddddddddddddddd",
      "evidence": "https://www.youtube.com/watch?v=FIKpcA-A9Sk&t=93s",
      "anonymous": false,
      "contact": "steveasterafovo@gmail.com",
      "goodFaith": true,
      "status": "pending",
      "resolvedBy": null,
      "resolvedAt": null,
      "createdAt": "2026-11-18T22:44:37+00:00",
      "updatedAt": "2026-11-18T22:44:37+00:00"
    },
    {
      "id": "34e65f9b-2d85-4d42-9855-e3d54a5e248c",
      "trackingCode": "SPC-ETH_20261118_222307-9EGT",
      "category": "Corruption active ou passive",
      "concerned": "MIROBEX STRUCRURE",
      "occurrencePeriod": "26 mars 2026",
      "description": "stringstringstringstringstring stringstringstringstringstring stringstringstringstringstring",
      "evidence": "La preuve est claire",
      "anonymous": false,
      "contact": "steveasterafovo@gmail.com",
      "goodFaith": true,
      "status": "pending",
      "resolvedBy": null,
      "resolvedAt": null,
      "createdAt": "2026-11-18T22:23:07+00:00",
      "updatedAt": "2026-11-18T22:23:07+00:00"
    },
    {
      "id": "e908806d-b740-4753-962e-e0944a8a386e",
      "trackingCode": "SPC-ETH_20261118_222113-E5ZJ",
      "category": "Corruption active ou passive",
      "concerned": "MIROBEX STRUCRURE",
      "occurrencePeriod": "26 mars 2026",
      "description": "stringstringstringstringstring stringstringstringstringstring stringstringstringstringstring",
      "evidence": "La preuve est claire",
      "anonymous": true,
      "contact": null,
      "goodFaith": true,
      "status": "pending",
      "resolvedBy": null,
      "resolvedAt": null,
      "createdAt": "2026-11-18T22:21:13+00:00",
      "updatedAt": "2026-11-18T22:21:13+00:00"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/admin/reports/ethical/list?page=1",
    "last": "http://localhost:8000/api/v1/admin/reports/ethical/list?page=1",
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
        "url": "http://localhost:8000/api/v1/admin/reports/ethical/list?page=1",
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
    "path": "http://localhost:8000/api/v1/admin/reports/ethical/list",
    "per_page": 20,
    "to": 4,
    "total": 4
  }
}
***
2- DETAIL D'U SIGNALEMENT ETHIQUES
curl -X 'GET' \
  'http://localhost:8000/api/v1/admin/reports/ethical/a8065217-1b14-4fda-a613-8bac14e0dcd8' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 438|3JjWB2pPzomb5xDJ2sw1skUXzZFcFqQGeSCy5STteee0f9bd' \
  -H 'X-CSRF-TOKEN: '
  ---
  ANONYME
  {
  "data": {
    "id": "a8065217-1b14-4fda-a613-8bac14e0dcd8",
    "trackingCode": "SPC-ETH_20261118_225359-VN8R",
    "category": "Conflit d'intérêts",
    "concerned": "Steve",
    "occurrencePeriod": "sssssss",
    "description": "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    "evidence": "ddddddddddd",
    "anonymous": true,
    "contact": null,
    "goodFaith": true,
    "status": "pending",
    "resolvedBy": null,
    "resolvedAt": null,
    "createdAt": "2026-11-18T22:53:59+00:00",
    "updatedAt": "2026-11-18T22:53:59+00:00"
  }
}
---
NON ANONYME
{
  "data": {
    "id": "2e7dfabd-ba59-467c-b27c-44e3c32a69f1",
    "trackingCode": "SPC-ETH_20261118_224437-NWA3",
    "category": "Corruption active ou passive",
    "concerned": "qqsssss",
    "occurrencePeriod": "sssssss",
    "description": "dddddddddddddddddddddddddddddddddddddddddddddddd",
    "evidence": "https://www.youtube.com/watch?v=FIKpcA-A9Sk&t=93s",
    "anonymous": false,
    "contact": "steveasterafovo@gmail.com",
    "goodFaith": true,
    "status": "pending",
    "resolvedBy": null,
    "resolvedAt": null,
    "createdAt": "2026-11-18T22:44:37+00:00",
    "updatedAt": "2026-11-18T22:44:37+00:00"
  }
}
***
3- CHANGEMENT DE STATUT (TRAITEMENT)
curl -X 'PUT' \
  'http://localhost:8000/api/v1/admin/reports/ethical/2e7dfabd-ba59-467c-b27c-44e3c32a69f1/status' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer 438|3JjWB2pPzomb5xDJ2sw1skUXzZFcFqQGeSCy5STteee0f9bd' \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-CSRF-TOKEN: ' \
  -F 'status=in_review'
  ---
  {
  "data": {
    "id": "2e7dfabd-ba59-467c-b27c-44e3c32a69f1",
    "trackingCode": "SPC-ETH_20261118_224437-NWA3",
    "category": "Corruption active ou passive",
    "concerned": "qqsssss",
    "occurrencePeriod": "sssssss",
    "description": "dddddddddddddddddddddddddddddddddddddddddddddddd",
    "evidence": "https://www.youtube.com/watch?v=FIKpcA-A9Sk&t=93s",
    "anonymous": false,
    "contact": "steveasterafovo@gmail.com",
    "goodFaith": true,
    "status": "in_review",
    "resolvedBy": null,
    "resolvedAt": null,
    "createdAt": "2026-11-18T22:44:37+00:00",
    "updatedAt": "2026-11-19T10:42:20+00:00"
  }
}
---
ENUM
<?php

namespace App\Enums;

enum ReportStatus: string
{
  case Pending = 'pending';
  case InReview = 'in_review';
  case Resolved = 'resolved';
  case Dismissed = 'dismissed';
}

***
Inspire toi de src\routes\_admin\reports\site (index et id) puis ecris les pages src\routes\_admin\reports\ethical (index et id) puis ecris les pages 