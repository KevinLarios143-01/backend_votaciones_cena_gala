# API Endpoints - Sistema de Votaciones

## Base URL
```
http://localhost:3000/api
```

## Autenticación
Todos los endpoints (excepto login) requieren token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 🔐 AUTENTICACIÓN

### Login
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "superadmin@votaciones.com",
  "password": "superadmin123"
}
```
**Response:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "superadmin@votaciones.com",
    "name": "Super Administrador",
    "role": "SUPERADMIN"
  }
}
```

---

## 👥 ADMINISTRACIÓN DE USUARIOS

### Listar Usuarios
```http
GET /api/admin/users
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "imageUrl": "https://example.com/photo.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Obtener Usuario Específico
```http
GET /api/admin/users/:userId
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "imageUrl": "https://example.com/photo.jpg",
    "role": "PARTICIPANT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Actualizar Usuario Completo
```http
PUT /api/admin/users/:userId
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Juan Pérez Actualizado",
  "email": "juan.nuevo@example.com",
  "imageUrl": "https://example.com/nueva-foto.jpg"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": "user_id",
    "name": "Juan Pérez Actualizado",
    "email": "juan.nuevo@example.com",
    "imageUrl": "https://example.com/nueva-foto.jpg",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Actualizar Solo Foto de Usuario
```http
PUT /api/admin/users/:userId/photo
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
  "imageUrl": "https://example.com/nueva-foto.jpg"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Foto actualizada exitosamente",
  "data": {
    "id": "user_id",
    "name": "Juan Pérez",
    "imageUrl": "https://example.com/nueva-foto.jpg"
  }
}
```

---

## 📂 CATEGORÍAS

### Listar Categorías
```http
GET /api/categories
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "category_id",
      "name": "El más Puntual – el que siempre llega primero a cada actividad.",
      "description": null,
      "status": "NOMINATION",
      "participants": [
        {
          "id": "participant_id",
          "name": "Juan Pérez",
          "imageUrl": "https://example.com/photo.jpg",
          "user": {
            "id": "user_id",
            "name": "Juan Pérez",
            "imageUrl": "https://example.com/photo.jpg"
          }
        }
      ]
    }
  ]
}
```

### Obtener Finalistas de Categoría
```http
GET /api/categories/:categoryId/finalists
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "finalist_id",
      "nominationCount": 5,
      "participant": {
        "id": "participant_id",
        "name": "Juan Pérez",
        "imageUrl": "https://example.com/photo.jpg",
        "user": {
          "id": "user_id",
          "name": "Juan Pérez",
          "imageUrl": "https://example.com/photo.jpg"
        }
      },
      "_count": {
        "votes": 3
      }
    }
  ]
}
```

---

## 🗳️ NOMINACIONES

### Crear Nominación
```http
POST /api/nominations
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
  "categoryId": "category_id",
  "participantId": "participant_id"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "nomination_id",
    "userId": "user_id",
    "categoryId": "category_id",
    "participantId": "participant_id",
    "participant": {
      "id": "participant_id",
      "name": "Juan Pérez",
      "imageUrl": "https://example.com/photo.jpg",
      "user": {
        "id": "user_id",
        "name": "Juan Pérez",
        "imageUrl": "https://example.com/photo.jpg"
      }
    }
  },
  "message": "Nominación creada exitosamente"
}
```

### Verificar Nominaciones del Usuario
```http
GET /api/nominations/user-nomination/:categoryId
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "nominationCount": 2,
    "nominations": [
      {
        "id": "nomination_id",
        "participant": {
          "id": "participant_id",
          "name": "Juan Pérez",
          "imageUrl": "https://example.com/photo.jpg",
          "user": {
            "id": "user_id",
            "name": "Juan Pérez",
            "imageUrl": "https://example.com/photo.jpg"
          }
        }
      }
    ],
    "canNominate": true
  }
}
```

---

## 🗳️ VOTACIONES

### Crear Voto
```http
POST /api/votes
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
  "categoryId": "category_id",
  "finalistId": "finalist_id"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vote_id",
    "userId": "user_id",
    "categoryId": "category_id",
    "finalistId": "finalist_id",
    "finalist": {
      "participant": {
        "id": "participant_id",
        "name": "Juan Pérez",
        "imageUrl": "https://example.com/photo.jpg",
        "user": {
          "id": "user_id",
          "name": "Juan Pérez",
          "imageUrl": "https://example.com/photo.jpg"
        }
      }
    }
  },
  "message": "Voto registrado exitosamente"
}
```

### Verificar Voto del Usuario
```http
GET /api/votes/user-vote/:categoryId
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "hasVoted": true,
    "vote": {
      "id": "vote_id",
      "finalist": {
        "participant": {
          "id": "participant_id",
          "name": "Juan Pérez",
          "imageUrl": "https://example.com/photo.jpg",
          "user": {
            "id": "user_id",
            "name": "Juan Pérez",
            "imageUrl": "https://example.com/photo.jpg"
          }
        }
      }
    }
  }
}
```

### Obtener Resultados de Votación
```http
GET /api/votes/results/:categoryId
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
[
  {
    "id": "finalist_id",
    "nominationCount": 5,
    "participant": {
      "id": "participant_id",
      "name": "Juan Pérez",
      "imageUrl": "https://example.com/photo.jpg",
      "user": {
        "id": "user_id",
        "name": "Juan Pérez",
        "imageUrl": "https://example.com/photo.jpg"
      }
    },
    "_count": {
      "votes": 8
    }
  }
]
```

---

## 👤 PARTICIPANTES

### Obtener Participantes por Categoría
```http
GET /api/participants/category/:categoryId
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
[
  {
    "id": "participant_id",
    "name": "Juan Pérez",
    "description": "Juan Pérez - Participante",
    "imageUrl": "https://example.com/photo.jpg",
    "user": {
      "id": "user_id",
      "name": "Juan Pérez",
      "imageUrl": "https://example.com/photo.jpg"
    },
    "_count": {
      "nominations": 3
    }
  }
]
```

---

## ⚙️ ADMINISTRACIÓN DEL SISTEMA

### Reiniciar Sistema
```http
POST /api/admin/reset-system
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Sistema reiniciado exitosamente",
  "data": {
    "categoriesReset": 12,
    "participantsCreated": 36
  }
}
```

### Eliminar Todos los Usuarios Participantes
```http
POST /api/admin/delete-all-users
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Todos los usuarios participantes eliminados exitosamente",
  "data": {
    "usersDeleted": 15
  }
}
```

---

## 📊 ESTADÍSTICAS

### Obtener Estadísticas Generales
```http
GET /api/votes/stats
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "totalCategories": 12,
    "totalNominations": 150,
    "totalVotes": 75,
    "categoriesWithStats": [
      {
        "id": "category_id",
        "name": "El más Puntual",
        "status": "VOTING_FINAL",
        "_count": {
          "nominations": 15,
          "votes": 8,
          "participants": 25
        }
      }
    ]
  }
}
```

---

## 🔧 UTILIDADES

### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "message": "Sistema de Votaciones API"
}
```

### Test Database
```http
GET /api/test-db
```
**Response:**
```json
{
  "status": "OK",
  "message": "Database connected",
  "userCount": 25
}
```

---

## 📝 NOTAS IMPORTANTES

1. **Autenticación**: Todos los endpoints requieren token JWT excepto `/api/auth/login`
2. **Roles**: 
   - `SUPERADMIN`: Acceso completo
   - `ADMIN`: Gestión del tenant
   - `PARTICIPANT`: Solo votación y nominación
3. **Tenant Isolation**: Los datos están aislados por tenant
4. **Image URLs**: Se devuelven tanto en `participant.imageUrl` como en `user.imageUrl`
5. **Estados de Categoría**:
   - `NOMINATION`: Fase de nominaciones
   - `SELECTION_FINALISTS`: Selección de finalistas
   - `VOTING_FINAL`: Votación final
   - `FINISHED`: Categoría finalizada

## 🚀 Ejemplo de Flujo Completo

1. **Login** → Obtener token
2. **Listar usuarios** → Ver participantes
3. **Actualizar foto** → Cambiar imagen de usuario
4. **Listar categorías** → Ver categorías disponibles
5. **Nominar** → Crear nominaciones
6. **Ver resultados** → Consultar ganadores