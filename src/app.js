import express from "express";
import cors from "cors";
import routes from "./routes/routes.js";
import errorMiddleware from "./middlewares/error-middleware.js";
import authorizationSdk from "@adameds/authorization-sdk";
import MODELMERGE from "./models/model-synchronize.js";
import efp from "express-fileupload";
import defineAssociations from "./configurations/database-associations.js";

const APPLICATION_PORT = process.env.APPLICATION_PORT || 8080;
const APPLICATION_HOST = process.env.APPLICATION_HOST || 'localhost';

const app = express();
app.use(
    cors({
        origin: "*",
        allowedHeaders: [
            "Origin",
            "Content-Type",
            "Accept",
            "User-Agent",
            "Content-Length",
            "Authorization",
        ],
        methods: ["GET", "POST", "HEAD", "PUT", "DELETE", "PATCH", "OPTIONS"],
    })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(authorizationSdk([]));
app.use(efp());
app.use(routes);
app.use(errorMiddleware);
app.listen(APPLICATION_PORT, APPLICATION_HOST, async () => {
    try {
        defineAssociations();
        // for (const model of MODELMERGE) {
        //     await model.sync({alter: false, force: true});
        // }
        // await dbSeeder();
    } catch (error) {
        console.error("Failed to synchronize the database:", error);
    }

    console.log(
        `Server running on http://${APPLICATION_HOST}:${APPLICATION_PORT}`
    );
});
