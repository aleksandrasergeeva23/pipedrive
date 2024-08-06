import express, { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import morgan from 'morgan';
import responseTime from 'response-time';
import http from 'http';

const app = express();
const PORT = 3000;
const API_TOKEN = 'd66e6fae331bf2b9644677311043a2cd189b55b0'; // Replace with your actual API token
const COMPANY_DOMAIN = 'aleksandra'; // Replace with your actual company domain


const metrics: { [key: string]: number[] } = {};

const responseTimeMiddleware = responseTime((req: Request, res: Response, time: number) => {
    const route = req.route ? req.route.path : req.path;
    if (!metrics[route]) {
        metrics[route] = [];
    }
    metrics[route].push(time);
});

app.use(responseTimeMiddleware);
app.use(morgan('tiny'));
app.use(express.json());

// GET all deals
app.get('/deals', async (req, res) => {
    const url = `https://${COMPANY_DOMAIN}.pipedrive.com/api/v1/deals?api_token=${API_TOKEN}`;

    try {
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        const axiosError = error as AxiosError;
        res.status(axiosError.response?.status || 500).json({ error: axiosError.message });
    }
});

// POST a new deal
app.post('/deals', async (req, res) => {
    const { title, org_id } = req.body; // Capture the title and org_id from the request body

    if (!title) {
        return res.status(400).json({ error: 'A deal title is required' });
    }

    const url = `https://${COMPANY_DOMAIN}.pipedrive.com/api/v1/deals?api_token=${API_TOKEN}`;

    try {
        const response = await axios.post(url, {
            title,
            org_id  // Optional, include only if provided
        });
        const result = response.data;

        if (result && result.data && result.data.id) {
            res.status(201).json({ message: 'Deal was added successfully!', dealId: result.data.id });
        } else {
            res.status(400).json({ error: 'Failed to create deal', details: result });
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        res.status(axiosError.response?.status || 500).json({ error: axiosError.message });
    }
});

// PUT update an existing deal
app.put('/deals/:id', async (req, res) => {
    const { id } = req.params; // Capture the deal ID from the URL
    const dealUpdates = req.body; // Capture the updates from the request body
    
    if (!id) {
        return res.status(400).json({ error: 'Deal ID is required' });
    }

    const url = `https://${COMPANY_DOMAIN}.pipedrive.com/api/v1/deals/${id}?api_token=${API_TOKEN}`;

    try {
        const response = await axios.put(url, dealUpdates);
        const result = response.data;

        if (result && result.success) {
            res.status(200).json({ message: 'Deal updated successfully!', deal: result.data });
        } else {
            res.status(400).json({ error: 'Failed to update deal', details: result });
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        res.status(axiosError.response?.status || 500).json({ error: axiosError.message });
    }
    
});

app.get('/metrics', (req: Request, res: Response) => {
    const detailedMetrics = Object.keys(metrics).reduce((acc, key) => {
        const total = metrics[key].reduce((total, current) => total + current, 0);
        const meanDuration = metrics[key].length ? (total / metrics[key].length).toFixed(2) : 0;
        acc[key] = {
            meanRequestDuration: meanDuration + " ms",
            totalRequests: metrics[key].length
        };
        return acc;
    }, {} as { [key: string]: { meanRequestDuration: string; totalRequests: number } });
    
    res.json(detailedMetrics);
});


let server: http.Server;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { app, server };// Export the app instance as default
