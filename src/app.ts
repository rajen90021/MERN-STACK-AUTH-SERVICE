import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('hellow this is tersting ')
})

export default app
