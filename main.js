$(document).ready(init)

// initialise game when DOM content fully loaded
function init () {
  // animation for start of game
  function entryAnim () {
    var $introPic = $('<img>')
    $introPic.attr({
      'id': 'introPic',
      'src': 'images/WDI6400px.gif',
      'alt': 'WDI 6 Games'
    })
    $('.container').prepend($introPic)
    $introPic.fadeIn(1000).delay(4500).fadeOut('slow')
    window.setTimeout(exitAnim, 5500)
  }
  function exitAnim () {
    $('.menu').fadeIn('medium')
    $('.menu').removeClass('hidden')
  }
  entryAnim()

  // name variable for canvas
  // getContent method returns an object that provides methods and properties for drawing on canvas
  // declare height and width of canvas
  // declare other 'global variables'
  var canvas = document.getElementById('canvas')
  var c = canvas.getContext('2d')
  var W = canvas.width = 500
  var H = canvas.height = 700
  var ball
  var lava
  var startBlock
  var blockArray
  var level
  var vx
  var vy
  var runGame
  var gameRunning
  var playerScore = 0
  var highestScore = 0

  // set variables for canvas drawImage
  var road = new Image()
  road.src = 'images/road.png'
  var lavaImage = new Image()
  lavaImage.src = 'images/lava.jpg'
  var cloud = new Image()
  cloud.src = 'images/cloud.png'
  var earth = new Image()
  earth.src = 'images/earth.png'
  var kongleft = new Image()
  kongleft.src = 'images/kongleft.png'
  var kongleftjump = new Image()
  kongleftjump.src = 'images/kongleftjump.png'
  var kongright = new Image()
  kongright.src = 'images/kongright.png'
  var kongrightjump = new Image()
  kongrightjump.src = 'images/kongrightjump.png'
  var wkleft = new Image()
  wkleft.src = 'images/wkleft.png'
  var wkleftjump = new Image()
  wkleftjump.src = 'images/wkleftjump.png'
  var wkright = new Image()
  wkright.src = 'images/wkright.png'
  var wkrightjump = new Image()
  wkrightjump.src = 'images/wkrightjump.png'
  var blueHeli = new Image()
  blueHeli.src = 'images/blueheli.png'
  var redHeli = new Image()
  redHeli.src = 'images/redheli.png'
  var blackHeli = new Image()
  blackHeli.src = 'images/blackheli.png'
  var bigHeli = new Image()
  bigHeli.src = 'images/cloud5.png'
  var ufo = new Image()
  ufo.src = 'images/ufo.png'

  // AUDIO
  function bounceSound () {
    var bounceSound = new Audio('audio/bounce.mp3')
    bounceSound.play()
  }
  var felix
  function backgroundSound () {
    felix = new Audio('audio/tranquilisland.mp3')
    felix.addEventListener('ended', function () {
      this.currentTime = 0
      this.play()
    })
    felix.play()
  }
  function stopbackgroundSound () {
    felix.pause()
    felix.currentTime = 0
  }

  // event listener for buttons
  // hard code limits of vx and vy
  $(document).on('keydown', function (event) {
    var x = event.keyCode
    // prevent space and arrow key defaults
    if (x === 32 || x === 37 || x === 38 || x === 39 || x === 40) {
      event.preventDefault()
    }
    // A or left button to decrease vx
    if (x === 65 || x === 37) {
      vx -= 4
      if (vx < -6) {
        vx = -6
      }
    }
    // D or right button to increase vy
    if (x === 68 || x === 39) {
      vx += 4
      if (vx > 6) {
        vx = 6
      }
    }
    // S or down button to increase vy and limit vy to 15
    if (x === 83 || x === 40) {
      if (ball.y < canvas.height / 8) {
        vy += 2
        vy *= 0.90
      } else if (ball.y < canvas.height / 6) {
        vy += 3
      } else if (ball.y < canvas.height / 4) {
        vy += 5
        vy *= 0.95
      } else if (ball.y < canvas.height / 2) {
        vy += 8
      } else if (ball.y < canvas.height / 1.75) {
        vy += 9
      } else {
        vy += 12
      }
      if (vy > 18) {
        vy = 18
      }
    }
    // R button to start/ restart game
    if (x === 82 && !gameRunning) {
      start()
    }
  })

  // addEventListener for start button
  // when start pressed, fadeout menu, create new core and start game
  var $start = $('.nav a').eq(0)
  $start.on('click', start)
  function start () {
    $start.off('click', start)
    $('.menu').fadeOut('slow')
    createCore()
    renderFrame()
    backgroundSound()
    gameRunning = true
  }

  // when ball touch lava, run lose, fadeIn menu and stop game
  function lose () {
    stopbackgroundSound()
    gameRunning = false
    $('.scoretitle').show()
    $('#currentscore').show()
    $('#highscore').show()
    $('.instructions').hide()
    $('.key').hide()
    $('.menu').fadeIn('slow')
    cancelAnimationFrame(runGame)
    $start.on('click', start)
    $start.text('Restart')
  }

  // addEventListener for how to play button
  // create the instructions using jquery and hide
  // showHow function toggles hide and show of score and instructions
  var $howPlay = $('.nav a').eq(1)
  $howPlay.on('click', showHow)
  function createInstructions () {
    var $instructions = $('<p>')
    $instructions.addClass('instructions')
    $instructions.text('Kong is travelling around the world. Help him get to 5000m by jumping on the helicopters. Be careful, it\'s a mighty long drop!')
    var $key = $('<p>')
    $key.addClass('key')
    $key.text('Down arrow to bounce. Left & Right arrow to move horizontally. R to Restart. (A, S, D works too!)')
    $('.score').append($instructions)
    $('.score').append($key)
    $('.instructions').hide()
    $('.key').hide()
  }
  createInstructions()
  function showHow () {
    $('.scoretitle').toggle(1000)
    $('#currentscore').toggle(1000)
    $('#highscore').toggle(1000)
    $('.instructions').toggle(1000)
    $('.key').toggle(1000)
  }

  // calculate the score
  // score is the biggest difference in ball y and start block y
  function highscore () {
    var score = (startBlock.y - (ball.y + ball.radius)) / 10
    if (score > playerScore) {
      playerScore = score
    }
    playerScore = Math.floor(playerScore)
    $('#currentscore').text(playerScore + 'm')
    if (playerScore > highestScore) {
      highestScore = playerScore
      $('#highscore').text(highestScore + 'm')
    }

    // if score above 5000m
    if (playerScore > 5000) {
      lose()
      showHow()
      $('.nav p').eq(0).text('Winner!')
      $('.instructions').text('Congratulations, You completed the game! Lunch is on me!')
      $('.key').text('Credits to WDI6 Instructor and TAs, Prima, Glen & Kai Lin!:D')
    }
  }

  // give ball its dimensions and color
  function Ball () {
    this.radius = 30
    this.x = canvas.width / 2
    this.y = canvas.height / 8

    this.draw = function (c) {
      // c.fillStyle = 'black'
      c.beginPath()
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
      c.closePath()
      // c.fill()
    }
  }

  // give lava its dimensions and color
  function Lava () {
    this.x = 0
    this.y = canvas.height - (ball.radius * 2)
    this.w = canvas.width
    this.h = ball.radius * 2

    this.draw = function (c) {
      c.fillStyle = 'rgba(225,225,225,0)'
      c.beginPath()
      c.fillRect(this.x, this.y, this.w, this.h)
      c.closePath()
      c.fill
    }
  }

  // give StartBlock its dimensions and color
  // ensure ball does not fall into lava at start
  function StartBlock () {
    this.x = canvas.width / 4
    this.y = canvas.height / 4
    this.w = canvas.width / 2
    this.h = 25

    this.draw = function (c) {
      c.fillStyle = 'rgba(225,225,225,0.5)'
      c.beginPath()
      c.fillRect(this.x, this.y, this.w, this.h)
      c.closePath()
      c.fill
    }
  }

  // randomise block dimensions
  // x, y, width, height, velocity, horizontal spd, color
  function randomBlock (difficulty) {
    var dimensions = {
      x: this.x,
      y: 0,
      w: this.w,
      h: 25,
      v: this.v,
      hr: this.hr,
      color: 'rgba(225,225,225,0)'
    }
    if (difficulty === 'Monkey') {
      dimensions.v = 1.25
    }
    if (difficulty === 'Chimp') {
      dimensions.v = 1.5
    }
    if (difficulty === 'Gorilla') {
      dimensions.v = 1.75
    }
    if (difficulty === 'KingKong') {
      dimensions.v = 2
    }
    if (difficulty === 'WuKong') {
      dimensions.v = 2.25
    }
    // creates a random number from 0 to 3
    // block 0 moves left
    // block 1 moves right
    // block 2 & 3 is fixed
    // block 4 is wider & higher horizontal speed
    var randomNo = Math.floor(Math.random() * 6)
    if (randomNo === 0) {
      dimensions.x = canvas.width / 4
      dimensions.w = canvas.width / 4
      dimensions.hr = 1
      return dimensions
    } else if (randomNo === 1) {
      dimensions.x = canvas.width / 2
      dimensions.w = canvas.width / 4
      dimensions.hr = -1
      return dimensions
    } else if (randomNo === 2) {
      dimensions.x = canvas.width / 2
      dimensions.w = canvas.width / 4
      dimensions.hr = 0
      return dimensions
    } else if (randomNo === 3) {
      dimensions.x = canvas.width / 6
      dimensions.w = canvas.width / 4
      dimensions.hr = 0
      return dimensions
    } else if (randomNo === 4) {
      dimensions.x = 0
      dimensions.w = canvas.width / 3
      dimensions.hr = 1.5
      return dimensions
    } else if (randomNo === 5) {
      dimensions.x = canvas.width / 3
      dimensions.w = canvas.width / 3
      dimensions.hr = -1.5
      return dimensions
    }
  }

  // give block randomised values
  function Block (difficulty) {
    var random = randomBlock(difficulty)
    this.x = random.x
    this.y = random.y
    this.w = random.w
    this.h = random.h
    this.v = random.v
    this.hr = random.hr
    this.color = random.color
  }

  // function to draw the blocks
  // change block direction if block hits left and right canvas
  Block.prototype.createBlk = function () {
    c.fillStyle = this.color
    c.fillRect(this.x, this.y, this.w, this.h)
    if (this.x + this.w > canvas.width || this.x < 0) {
      this.hr = -this.hr
      this.x += this.hr
    } else {
      this.x += this.hr
    }
    this.y += this.v
  }

  // create core pieces of the game, ball, lava, blocks
  function createCore () {
    vx = 0
    vy = 0
    level = '1: Monkey'
    playerScore = 0
    ball = new Ball()
    lava = new Lava()
    startBlock = new StartBlock()
    // create a block array to store the dimensions of the new blocks
    // draw new blocks using for loop and push to array
    // blocks now can reach 5000m
    blockArray = []
    var newblock
    for (var i = 0; i < 10; i++) {
      newblock = new Block('Monkey')
      blockArray.push(newblock)
    }
    for (var j = 0; j < 20; j++) {
      newblock = new Block('Chimp')
      blockArray.push(newblock)
    }
    for (var k = 0; k < 50; k++) {
      newblock = new Block('Gorilla')
      blockArray.push(newblock)
    }
    for (var l = 0; l < 120; l++) {
      newblock = new Block('KingKong')
      blockArray.push(newblock)
    }
    for (var m = 0; m < 200; m++) {
      newblock = new Block('WuKong')
      blockArray.push(newblock)
    }
  }

  // ensure ball stays in canvas
  // ensure ball bounces on blocks
  function ballCheck () {
    var bounce_y = 0.8
    var bounce_x = 0.5
    // if ball touches lava, run lose function
    // if ball hits canvas roof, reflect by 0.4 'energy'
    // if ball above start block and on block
    // times vy by negative 0.8 to get negative number, decreasing ball's y which induce ball moving up
    if (ball.y + ball.radius > lava.y) {
      lose()
    } else if (ball.y - ball.radius < 0 && vy < 0) {
      vy = -vy * 0.2
    } else if (ball.y - ball.radius < 0 && vy > 0) {
      vy = vy * 0.2
    } else if (ball.y + ball.radius > startBlock.y && ball.y + ball.radius < startBlock.y + startBlock.h && ball.x + (ball.radius) > startBlock.x && ball.x - (ball.radius / 2) < (startBlock.x + startBlock.w)) {
      ball.y = ball.y - ball.radius
      vy *= -bounce_y
      bounceSound()
    }

    // if ball hits canvas on right or left, reflect 0.5 vx value to induce bounce
    if ((ball.x + ball.radius) > canvas.width || (ball.x - ball.radius) < 0) {
      vx = -vx * bounce_x
      ball.x += vx
    }

    // function to check if ball bouncing on blocks array
    for (var i = 0; i < blockArray.length; i++) {
      if (ball.y + ball.radius > blockArray[i].y && ball.y + ball.radius < blockArray[i].y + blockArray[i].h && ball.x + (ball.radius / 2) > blockArray[i].x && ball.x - (ball.radius / 2) < (blockArray[i].x + blockArray[i].w)) {
        ball.y = blockArray[i].y - ball.radius
        vy *= -bounce_y
        bounceSound()
      }
    }
  }

  // tools to draw images and canvas text
  function background (image) {
    var $canvas = $('#canvas')
    $canvas.css({'backgroundImage': "url('images/" + image + ".gif')", 'background-size': '100%, 100%'})
  }
  function changeKong (image) {
    c.drawImage(image, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2)
  }
  function changeLava (image) {
    c.drawImage(image, 0, canvas.height - (ball.radius * 2), canvas.width, ball.radius * 2)
  }
  function heli (no, image, height) {
    c.drawImage(image, blockArray[no].x, blockArray[no].y, blockArray[no].w, height)
  }
  function canvasText (color) {
    function canvasTextConstr (size, color, text, x, y) {
      c.font = size + 'px Orbitron, sans-serif'
      c.fillStyle = color
      c.fillText(text, x, y)
    }
    canvasTextConstr(40, '#D0F4EA', playerScore + 'm', 20, 40)
    canvasTextConstr(20, '#D0F4EA', 'level ' + level, canvas.width - 210, 30)
  }

  // draw city background, road, kong and helicopter images
  // draw  ball, startblock, lava, canvas text
  // draw first random block & use for loop to create rest of blocks
  function draw () {
    background('city')
    changeLava(road)
    blockArray[0].createBlk()
    heli(0, blueHeli, 45)
    // for loop to draw subsequent blocks if previous block reaches a certain height
    for (var i = 1; i < blockArray.length; i++) {
      if (blockArray[i - 1].y > canvas.height / 3) {
        blockArray[i].createBlk()
        if (i < 10) {
          heli(i, blueHeli, 45)
        } else if (i < 30) {
          level = '2: Chimp'
          heli(i, redHeli, 45)
        } else if (i < 80) {
          background('mountain')
          changeLava(lavaImage)
          heli(i, blackHeli, 45)
          level = '3: Gorilla'
        } else if (i < 200) {
          background('sky')
          changeLava(cloud)
          heli(i, bigHeli, 45)
          level = '4: King Kong'
        } else {
          background('space')
          changeLava(earth)
          heli(i, ufo, 65)
          level = '5: Wu Kong'
        }
      }
    }
    startBlock.draw(c)
    lava.draw(c)
    ball.draw(c)
    canvasText()
  }

  // renderFrame function to hold and update the positions of all the objects moving in canvas
  // clearRect to clear canvas to white
  function renderFrame () {
    runGame = requestAnimationFrame(renderFrame)
    c.clearRect(0, 0, W, H)
    // calculate score while game running
    highscore()

    // decrease horizontal speed to prevent constant horizontal movement
    // add 0.5 to vertical y to induce 'gravity'
    vx *= 0.95
    vy += 0.5
    // move start block down by 1.5
    startBlock.y += 1.25

    // add vx to the ball's horizontal value
    // add vy to the ball's vertical value
    ball.x += vx
    ball.y += vy

    // ensure ball stay in canvas and bounces on blocks
    ballCheck()

    // change ball image depending on direction and velocity
    if (level === '5: Wu Kong') {
      if (vy < 0 && vx < 0) {
        changeKong(wkleftjump)
      } else if (vy < 0 && vx > 0) {
        changeKong(wkrightjump)
      } else if (vy > 0 && vx > 0) {
        changeKong(wkright)
      } else {
        changeKong(wkleft)
      }
    } else {
      if (vy < 0 && vx < 0) {
        changeKong(kongleftjump)
      } else if (vy < 0 && vx > 0) {
        changeKong(kongrightjump)
      } else if (vy > 0 && vx > 0) {
        changeKong(kongright)
      } else {
        changeKong(kongleft)
      }
    }
    draw()
  }
}
