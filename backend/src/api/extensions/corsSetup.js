
import cors from 'cors';
export function configureCors(app) {
  app.use(
    cors({
      origin: ['http://localhost:3000','http://localhost:5173', 'http://localhost:5174' ,'https://pilex.stellarco.online'],
      methods: ['GET', 'POST', 'PUT','PATCH','DELETE','OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'], 
      credentials: true,
    })
  );
}