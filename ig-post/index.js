const Instagram = require('instagram-web-api')
const username = 'larevueltadelasreplicas'
const password = 'PineraCuliao19'

const client = new Instagram({username: username, password: password})

// ;(async () => {
//     // URL or path of photo

  
//     await client.login()
  
//     // Upload Photo to feed or story, just configure 'post' to 'feed' or 'story'
//     const { media } = await client.uploadPhoto({ photo: photo, caption: 'testing', post: 'feed' })
//     console.log(`https://www.instagram.com/p/${media.code}/`)
//   })()

const photo = './revoltofreplicas-2.jpg'
client
  .login()
  .then(() => {
    client
        .uploadPhoto({ photo: photo, caption: 'testing', post: 'feed' })
  })