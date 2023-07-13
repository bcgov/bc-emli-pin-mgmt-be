// Basic test file for Express

import express, { Express } from 'express'

const app: Express = express()
const port: number = 3000

app.listen(port, () => {
    console.log(`[Server]: I am running at https://localhost:${port}`)
})
