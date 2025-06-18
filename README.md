# Digital Press Kit Builder

A web application for musicians to create, manage, and share professional electronic press kits (EPKs).

## Features

- **User Authentication**: Secure account creation and management
- **Press Kit Creation**: Build multiple press kits for different projects
- **Media Management**: Upload photos, audio, videos, and documents
- **Bio and Information**: Showcase biography, achievements, and events
- **Social Integration**: Connect all your social platforms and streaming services
- **Sharing and Analytics**: Share your press kit and track engagement
- **Responsive Design**: Looks great on desktop and mobile devices

## Tech Stack

### Frontend
- React.js with TypeScript
- Material-UI for components
- Redux for state management
- Formik with Yup for form validation

### Backend
- Node.js with Express
- Prisma ORM for database access
- JWT for authentication
- PostgreSQL database

### Storage
- AWS S3 for media storage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- AWS S3 bucket (or equivalent for media storage)

### Environment Setup

Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/presskit
JWT_SECRET=your_secret_key_here
S3_BUCKET=your_bucket_name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
PORT=3001
```

Create a `.env` file in the frontend directory with:

```
REACT_APP_API_URL=http://localhost:3001/api
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/dxaginfo/digital-press-kit-builder.git
cd digital-press-kit-builder
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Set up the database:

```bash
npx prisma migrate dev --name init
```

4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend development server:

```bash
cd frontend
npm start
```

3. Access the application at http://localhost:3000

## Deployment

### Backend

1. Build the backend:

```bash
cd backend
npm run build
```

2. Deploy to your server or cloud platform of choice

### Frontend

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Deploy the `build` directory to your web server or CDN

## License

This project is licensed under the MIT License - see the LICENSE file for details.
