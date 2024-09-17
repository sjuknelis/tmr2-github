import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import "dotenv/config";
import { makeSearchResponse } from "./search";

const app = express();

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25
}));

app.use(cors());

app.get("/s", async (req, res) => {
    const title = req.query.t as string;
    res.json(await makeSearchResponse(title));
});

app.use("/privacy", express.static("privacy"));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}`));