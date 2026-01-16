# Proyecto de Encuestas Escolares (Mean Stack)

Este proyecto es una aplicación web para la creación y gestión de encuestas escolares, desarrollada con Angular 16 (Frontend) y Node.js/Express/MongoDB (Backend).

## 📋 Requisitos Previos

Para arrancar este proyecto en otro ordenador (como en casa), necesitas tener instalado:

1.  **Node.js**: [Descargar aquí](https://nodejs.org/).
2.  **Git**: Para descargar el código.

## 🚀 Cómo arrancar el proyecto "En Casa"

Sigue estos pasos uno a uno:

### 1. Clonar el repositorio
Abre una terminal y ejecuta:
```bash
git clone https://github.com/gonzalogilabert/ProyectoPI.git
cd ProyectoPI
```

### 2. Configurar el Backend (Servidor)
El archivo con las claves secretas (`.env`) no se sube a Internet por seguridad. Tienes que crearlo tú.

1.  Entra en la carpeta backend: `cd backend`
2.  Instala las librerías: `npm install`
3.  Crea un archivo nuevo llamado `.env` y pega esto dentro:
    ```env
    MONGODB_URI=mongodb+srv://proyecto:mongodb@cluster0.kn7jeb8.mongodb.net/survey_app?appName=Cluster0
    PORT=3000
    ```
4.  Arranca el servidor: `node server.js`
    *(Debería decir "Connected to MongoDB")*

### 3. Configurar el Frontend (Angular)
1.  Abre **otra terminal** nueva en la carpeta del proyecto.
2.  Entra en la carpeta frontend: `cd frontend`
3.  Instala las librerías: `npm install`
4.  Arranca la aplicación: `npm start`

¡Listo! Abre tu navegador en `http://localhost:4200` y deberías ver la aplicación funcionando.

## 🛠 Tecnologías Utilizadas
- **Frontend**: Angular 16, Bootstrap 5.
- **Backend**: Node.js, Express.
- **Base de Datos**: MongoDB Atlas (Nube).
