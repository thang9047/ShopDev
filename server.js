const app = require("./src/app");

const PORT = process.env.PORT || 3057

const server = app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`)
})

// process.on('SIGINT', () => {
//   server.close( () => console.log('Exit'))
// })