import {} from 'dotenv/config'
import connectDb from './db/index.js'
import app from './app.js'

connectDb()
.then(()=>{
    app.listen(`${process.env.PORT || 3000}`, ()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log('Database connection failed', error);
}
)