import express from 'express'
import connectDb from './db/index.js'

connectDb();

const app = express();

app.get('/', (req, res)=>{
    console.log('home route')
})

app.listen(process.env.PORT, ()=>{
    console.log(`App is listening on port ${process.env.PORT}`)
})
