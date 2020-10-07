// This script loads all images from a .json scraped from instagram

let jDat

let prevTime = 0
let prevTop = 0

let screenshots = []

let sessionTime = 0
const sessionLength = 60 // in seconds

let path = "/feed-content/feed-content.json"

const today = new Date()
const week = 7 * 24 * 60 * 60 * 1000 //ms in a week 

// vars for double tap detection
let timeout, lastTap = 0

// Source: https://socket.io/docs/#Using-with-Express
let socket = io.connect(location.host.split(':')[0])
socket.on('connection answer', function(data){
    console.log(data)
})

socket.on('screenshot added', function(data){
    console.log(data)
    screenshots.push(data)
})

fetch(path)
  .then(response => response.json())
  .then(json => 
        {
            jDat = json
            let datLen = jDat.GraphImages.length
            
            let i = 0
            for (; i < 2; i++) {
                appendDivElement(jDat.GraphImages[i][1])
            }

            $(window).scroll(function(){
                // calculates and sends scroll speed
                let currentTop = $(window).scrollTop()
                let currentTime = new Date().getTime()
                let pixDelta = currentTop - prevTop
                let deltaTime = currentTime - prevTime
                let speed = pixDelta / deltaTime
                socket.emit('speed event', {my: 'swiping', speed: speed})
                prevTime = currentTime
                prevTop = currentTop

                // implements append divs under scroll
                if ($(window).scrollTop() >= $(document).height() - $(window).height() - 100) {
                    // TODO: Improve Instagram look
                    if(screenshots.length > 0){
                        appendDivElement(null, true)
                        i++

                        let randLen = 1 + Math.floor(Math.random() * 2)
                        for(let j = 0; j < randLen; j++)
                        {
                            if(j + i >= datLen) i = 0
                            appendDivElement(jDat.GraphImages[j + i][1], false)
                        }
                        i += randLen
                    }
                    else{
                        for(let j = 0; j < 3; j++)
                        {
                            if(j + i >= datLen) i = 0
                            appendDivElement(jDat.GraphImages[j + i][1], false)
                        }
                        i += 3                    
                    }
                }
            })
    })    

// set timer to end the experiencia once it has been started
setInterval(function () {
    sessionTime++
    console.log('experience time: ' + sessionTime + ' s')
    if(sessionTime == sessionLength){
        console.log('the experience is over')
        window.location.href = '/post-experience'
        // window.location.href = '/'
    }
}, 1000)

// Creates and appends elements on instagram feed
function appendDivElement(jsonObject, isScreenshot){
    let user
    if(isScreenshot){
        user = 'larevueltadelasreplicas'
    }
    else{
        if(jsonObject.__typename == "GraphVideo") return
        if(jsonObject.username != null && jsonObject.username != 'radiovillafrancia') user = jsonObject.username
        else user = 'plazadeladignidad'
    }

    // creates card =========================
    let card = document.createElement('div')
    card.className = "card"
    
    // creates card headers and components =========================
    let cardHeader = document.createElement('div')
    cardHeader.className = "card-header"
    let profileImage = document.createElement('div')
    profileImage.className = "profile-image"
    let avatar = document.createElement('img')
    avatar.className = "avatar"

    if(isScreenshot) avatar.src = '/thumbnails/revoltofreplicas-1.jpg'
    else {
        if(user != null) avatar.src = '/thumbnails/' + user + '.jpg'
    }
    
    let profileInfo = document.createElement('div')
    profileInfo.className = "profile-info"
    let name = document.createElement('div')
    name.className = "name"
    name.innerText = user
    let locationDiv = document.createElement('div')
    locationDiv.className = "location"
    locationDiv.innerText = "Santiago, Chile"
    let menu = document.createElement('div')
    menu.className = "menu"
    let menuIcon = document.createElement('img')
    menuIcon.className = "menu-icon"
    menuIcon.src = '/thumbnails/menu.png'
    
    // creates content and image content =========================
    let content = document.createElement('div')
    content.className = "content"
    let contentImg = document.createElement('img')
    if(isScreenshot)
    {
        // get from certain path
        contentImg.src = '/reality?id=' + screenshots[0].id
        screenshots.splice(0, 1)
    }
    else
    {
        let str = jsonObject.display_url.split('/')
        let strLen = str.length
        contentImg.src = '/feed-content/' + str[strLen - 1].split('?')[0]
    }

    // code to detect double tap
    // source code: https://stackoverflow.com/questions/8825144/detect-double-tap-on-ipad-or-iphone-screen-using-javascript
    content.addEventListener("touchend", function(e) {
        var currentTime = new Date().getTime();
        var tapLength = currentTime - lastTap;        

        e.preventDefault();
        clearTimeout(timeout);

        if(tapLength < 500 && tapLength > 0){
            //Double Tap
            socket.emit('double tap', 'double tapped')
        }
        lastTap = currentTime;
    })
    
    // creates cardFooter and components =========================
    let cardFooter = document.createElement('div')
    cardFooter.className = "card-footer"
    let interaction = document.createElement('div')
    interaction.className = "interaction"
    let heart = document.createElement('div')
    heart.className = "heart"
    let heartIcon = document.createElement('img')
    heartIcon.className =  "heart-icon"
    heartIcon.src = "/thumbnails/heart.png"
    let dialog = document.createElement('div')
    dialog.className = "dialog"
    let dialogIcon = document.createElement('img')
    dialogIcon.className =  "dialog-icon"
    dialogIcon.src = "/thumbnails/chat.png"
    let share = document.createElement('div')
    share.className = "share"
    let shareIcon = document.createElement('img')
    shareIcon.className = "share-icon"
    shareIcon.src = "/thumbnails/share.png"
    let save = document.createElement('div')
    save.className = "save"
    let saveIcon = document.createElement('img')
    saveIcon.className = "save-icon"
    saveIcon.src = "/thumbnails/save.png"
    let likes = document.createElement('div')
    likes.className = "likes"
    let likesDisp = document.createElement('p')
    likesDisp.className = "likes-display"
    if(isScreenshot){
        likesDisp.innerText = Math.trunc(Math.random() * 2000) + ' likes'
    }
    else {
        likesDisp.innerText = jsonObject.edge_media_preview_like.count + ' likes'
    }
    let description = document.createElement('div')
    description.className = "description"
    let p = document.createElement('p') 
    let username = document.createElement('span')
    username.className = "name"
    username.innerText = user
    let descriptionText = document.createElement('span')
    descriptionText.className = "description-text"
    if (isScreenshot) {
        descriptionText.innerText = ' ' + captions[Math.trunc(Math.random() * captions.length)]
    }
    else {
        if(jsonObject.edge_media_to_caption.edges.length > 1){
            descriptionText.innerText = " " + jsonObject.edge_media_to_caption.edges[1].node.text
        }
        else if(jsonObject.edge_media_to_caption.edges.length > 0){
            descriptionText.innerText = " " + jsonObject.edge_media_to_caption.edges[0].node.text
        }
        else
        {
            descriptionText.innerText = ""
        }
    }
    // let comments = document.createElement('div')
    // comments.className = "comments"
    // let form = document.createElement('div')
    // form.className = "form"
    let elapsedTime = document.createElement('div')
    elapsedTime.className = "elapsed-time"
    let timeDisplay = document.createElement('div')
    timeDisplay.className = "time-display"

    if(isScreenshot) {
        // english
        // timeDisplay.innerText = months[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear()
        // spanish
        timeDisplay.innerText =  today.getDate() + ' de ' + months[today.getMonth()]  + ' de ' + today.getFullYear()
    }
    else {
        let dt = new Date(Number(jsonObject.taken_at_timestamp) * 1000)
        // english
        // timeDisplay.innerText = months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear()
        // spanish
        timeDisplay.innerText = dt.getDate() + ' de ' + months[dt.getMonth()] + ' de ' + dt.getFullYear()
    }

    // appends cardHeader components =========================
    profileImage.appendChild(avatar)
    profileInfo.appendChild(name)
    profileInfo.appendChild(locationDiv)
    menu.appendChild(menuIcon)
    cardHeader.appendChild(profileImage)
    cardHeader.appendChild(profileInfo)
    cardHeader.appendChild(menu)
    card.appendChild(cardHeader)

    // appends content to card
    content.appendChild(contentImg)
    card.appendChild(content)

    // appends cardFooter components =========================
    heart.appendChild(heartIcon)
    dialog.appendChild(dialogIcon)
    share.appendChild(shareIcon)
    save.appendChild(saveIcon)
    interaction.appendChild(heart)
    interaction.appendChild(dialog)
    interaction.appendChild(share)
    interaction.appendChild(save)

    likes.appendChild(likesDisp)

    p.appendChild(username)
    p.appendChild(descriptionText)
    description.appendChild(p)

    cardFooter.appendChild(interaction)
    cardFooter.appendChild(likes)
    cardFooter.appendChild(description)
    // cardFooter.appendChild(comments)
    // cardFooter.appendChild(form)
    elapsedTime.appendChild(timeDisplay)
    cardFooter.appendChild(elapsedTime)
    card.appendChild(cardFooter)

    $('.container').append(card)
}

// const captions = [
//     'The territory no longer precedes the map, nor does it survive it.',
//     'It is no longer really the real, because no imaginary envelops it anymore.',
//     'Simulation threatens the difference between the "true" and the false, the \"real\" and the \"imaginary.\"',
//     'The transition from signs that dissimulate something to signs that dissimulate that there is nothing marks a decisive turning point.',
//     'Illusion is no longer possible, because the real is no longer posible.',
//     'The hyperrealism of simulation is translated by the hallucinatory resemblance of the real to itself.',
//     'Ideology only corresponds to a corruption of reality through signs; simulation corresponds to a short circuit of reality and to its duplication through signs.',
//     'There is no real: the third dimension is only the imaginary of a two-dimensional world, the fourth that of a three-dimensional universe.',
//     'No cultural object can retain its power when there are no longer new eyes to see it.',
//     'In the conversion of practices and rituals into merely aesthetic objects, the beliefs of previous cultures are objectively ironized, transformed into artifacts.',
//     'Capitalism is what is left when beliefs have collapsed at the level of ritual and symbolic elaboration, and all that is left is the consumer-spectator, trudging through the ruins and the relics.',
//     'The \'realism\' is analogous to the deflationary perspective of a depressive who believes that any positive states, any hope, is a dangerous illusion.',
//     'For Lacan, the Real is what any \'reality\' must supress; indeed, reality constitutes itself through just this repression.',
//     'Abstract space is destined not to last forever, and already contains the birth of a new space within itself.',
//     'The most effectively appropriated spaces are those occupied by symbols, appropriation offering the chance to invert social relations and meanings and so create a kind of heterotopic space.',
//     'Space is a social and political product.',
//     'Space is produced in two ways: as a social formation (mode of production), and as a mental construction (conception).',
//     'Our mode of reaction to space is not geometric, only our mode of abstraction is. There is an opposition established between our conception of space — abstract, mental and geometric — and our perception of space — concrete, material and physical.'
// ]

const captions = [

    'El territorio ya no precede al mapa ni le sobrevive.',
    'La realidad ni siquiera es real puesto que nada imaginario lo envuelve.',
    'La simulación amenaza a la diferencia entre lo \"verdadero\" y lo falso, lo \"real\" y lo \"imaginario\".',
    'El paso de signos que disimulan algo a signos que disimulan que no hay nada marca un giro decisivo.',
    'La ilusión ya no es posible, porque lo real ya no es posible.',
    'El hiperrealismo de la simulación se traduce por el parecido alucinatorio de lo real consigo mismo.',
    'La ideología sólo corresponde a una corrupción de la realidad mediante signos; la simulación corresponde a un cortocircuito de la realidad y a su duplicación mediante signos.',
    'No existe lo real: la tecera dimensión es únicamente el imaginario de un mundo bidimensional, mientras que la cuarta es el imaginario de un universo tridimensional.',
    'Ningún objeto cultural puede retener su poder cuando no existen nuevos ojos para verlo.',
    'En el proceso de conversión de las prácticas y rituales en meros objetos estéticos, las creencias de culturas anteriores son objetivamente ironizadas, transformadas en artefactos.',
    'El capitalismo es lo que queda cuando las creencias se han derrumbado a nivel de elaboración ritual y simbólica, y lo único que queda es el consumidor-espectador, caminando penosamente entre ruinas y reliquias.',
    'El \'realismo\' es análogo a la perspectiva deflacionaria de un depresivo que cree que cualquier estado positivo, cualquier esperanza, es una ilusión peligrosa.',
    'Para Lacan, lo Real es lo que toda "realidad" debe suprimir; de hecho, la realidad se constituye precisamente a través de esta represión.',
    'El espacio abstracto está destinado a no durar para siempre y ya contiene el nacimiento de un nuevo espacio dentro de sí mismo.',
    'Los espacios de apropiación más efectiva son los ocupados por símbolos, la apropiación ofrece la posibilidad de invertir las relaciones y significados sociales y así crear una especie de espacio heterotópico.',
    'El espacio es un producto social y político.',
    'El espacio se produce de dos formas: como formación social (modo de producción) y como construcción mental (concepción).',
    'Nuestro modo de reacción al espacio no es geométrico, solo nuestro modo de abstracción lo es. Existe una oposición establecida entre nuestra concepción del espacio - abstracto, mental y geométrico - y nuestra percepción del espacio - concreto, material y físico.'
]

// const months = [
//     'January',
//     'February',
//     'March',
//     'April',
//     'May',
//     'June',
//     'July',
//     'August',
//     'September',
//     'October',
//     'November',
//     'December'
// ]

const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
]