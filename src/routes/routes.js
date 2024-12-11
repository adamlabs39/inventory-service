import express from "express";


const apiBase = process.env.API_BASE || "api";
const apiVersion = process.env.API_VERSION || "v1";
const baseUrl = `/${apiBase}/${apiVersion}/inventory`;

const routes = express.Router();

// HEALTH CHECK
routes.get(`${baseUrl}/health`, (req, res) => res.status(200).json({ message: "OK" }));


export default routes;