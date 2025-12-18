import express from 'express';
import { setupApp } from './extensions/appServicesSetup.js';

const app = express();

setupApp(app);

export default app;
