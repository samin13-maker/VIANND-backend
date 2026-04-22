# 🧠 VIANND Backend

## Descripción
Desarrollada con Node.js, Express y TypeScript para gestionar autenticación, alimentos, comidas, recordatorios y reportes.

---

## Requisitos
- Node.js (v18 o superior)
- npm
- PostgreSQL

---

## Variables de entorno
Crear un archivo `.env` en la raíz:

PORT=3000  
DATABASE_URL=postgres://postgres:password@localhost:5432/viannd  
JWT_SECRET=supersecretkey  

---

## Instalación
npm install

---

## Ejecución

Clona el repositorio:
git clone https://github.com/samin13-maker/VIANND-backend

npm run dev

Servidor disponible en:
http://localhost:3000

---

## Pruebas con Postman
1. Importar la colección `.json`
2. Configurar:
   - baseUrl = http://localhost:3000
   - token = (obtenido en login)

---

## Endpoints principales

### Auth
POST /auth/send-code  
POST /auth/register  
POST /auth/login  

### Foods
GET /foods/category/list  
GET /foods/search  

### Meals
POST /meals  
GET /meals/user  
GET /meals/user/date  
DELETE /meals/:id  

### Reminders
POST /reminders  
PATCH /reminders/:id/toggle  
DELETE /reminders/:id  
GET /reminders/user  

### Reports
GET /reports/weeks  
GET /reports/weekly  

### Users
GET /users  
PATCH /users  


## Autor
Kelli Anahí Felipe Jacinto - 243762
Yasmin Afrodita Castellanos Peres - 243727
