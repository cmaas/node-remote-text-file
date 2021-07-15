import { startServer } from "./server";
import { TextDb } from "./textdb";

startServer(new TextDb('server-prod-db.sqlite'), 8080)