
var myId = "";
var backup = "";
var backup2 = "";
var joinButton=document.getElementById("Join");
var newGame = document.getElementById("newGame");
var fleshy = document.getElementById("fleshy");
var balls = [];
var t = "req=new";
var controls = {a:false,d:false};
var tick = 0;
var players = [];
var canvas = document.getElementById("mainCan");
var queuePos = 0;
var joined = false;
var characters = new Image();
var faces = new Image();
var balls = new Image();
var platformimg = new Image();
var backgrounds = new Image();
var logo = new Image();
var medals = new Image();
var graph = new Image();
var shootA = 0;
var cannonBalls = [];
var myGame = -1;
var amReady = false;
var lobbyData = {players:[]}
var gamesContainer = document.getElementById("gamesContainer")
var lobbyContainer = document.getElementById("lobbyContainer")
var gamesList = document.getElementById("gamesList")
var playersList = document.getElementById("playerList")
var nameButton = document.getElementById("nameButton")
var nameInput = document.getElementById("nameInput")
var ready = document.getElementById("ready")
var openingScreen = document.getElementById("openingScreen")
var clientCan = document.getElementById("backgroundCanvas")
var lobbyChat = document.getElementById("lobbyChat")
var submitMessage = document.getElementById("submitMessage")
var textBox = document.getElementById("textBox")
var vCard = true;
var invalid = false;
var refresh = document.getElementById("Refresh")
var myLobbyNum = -1
var readied = false;
var gameStatus = document.getElementById("gameStatus")
var statusContainer = document.getElementById("statusContainer")
var compendiumContainer = document.getElementById("compendiumContainer")
var compImg = document.getElementById("compImg")
var comSources = ["felipe.png","dannyDenim.png","bigjohn.png","wackycat.png","chillycharlie.png","conception.png","feud.png"]
var page = 1;
var platforms = [];
var timeSinceChange = 100;
var timerY=400;
var flashTime = 0;
var logoScale = 250;
var logoRise = true;
var snowFlakes = [];
var chatOpen = false;
var compen = document.getElementById("compen")
while(snowFlakes.length<200){
  snowFlakes.push({xSpeed:Math.random()*10,ySpeed:Math.random()*10,x:Math.random()*2248-200,y:0-Math.random()*700})
}
var fakeGuys = []
while(fakeGuys.length<10){
  var dir = 0;
  if(Math.random()>.5){
    dir=5
  }else{
    dir=-5;
  }
  fakeGuys.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,yAcc:0,dir:dir,char:Math.floor(Math.random()*5)})
}
characters.src = "images/People.png"
faces.src = "images/FaceSheet.png"
balls.src = "images/Balls.png"
platformimg.src = "images/AllPlats.png"
backgrounds.src = "images/Backgrounds.png"
logo.src = "images/logo.png"
medals.src = "images/medals.png"
graph.src = "images/graph.jpg"
/*
Character IDs:

0 - Flesh Mongerer
1 - Danny Denim
2 - John
3 - Wacky Cat
4 - Chilly Charlie

*/
refresh.addEventListener('click',reqGames,false);
newGame.addEventListener('click',reqNewGame,false)
compen.addEventListener('click',showCompen,false)
compImg.addEventListener('click',openCompen,false)
function showCompen(){
  compendiumContainer.style.display="block"
  compen.style.display="none"
}
document.getElementById("x").addEventListener('click',function(){
  document.getElementById("compendiumContainer").style.display = "none"
  page=1;
  compen.style.display="block"
  compImg.setAttribute('src',"images/compendium.png")
  compendiumContainer.style.width = "414px"
  compendiumContainer.style.height = "630px"
  compendiumContainer.style.marginLeft = "-190px"
  compendiumContainer.style.marginTop = "-290"
  arrowLeft.style.display = "none"
  arrowRight.style.display = "none"
},false)
document.getElementById("arrowLeft").addEventListener('click',function(){
  page--;
  compImg.setAttribute('src',"images/"+comSources[page-1])
  arrowDecide();
},false)
document.getElementById("arrowRight").addEventListener('click',function(){
  page++;
  compImg.setAttribute('src',"images/"+comSources[page-1])
  arrowDecide();
},false)
function arrowDecide(){
  if(page==7){
    document.getElementById("arrowRight").style.display = "none"
  }else{
    document.getElementById("arrowRight").style.display = "block"
  }
  if(page==1){
    document.getElementById("arrowLeft").style.display = "none"
  }else{
    document.getElementById("arrowLeft").style.display = "block"
  }
}
function openCompen(){
  if(compImg.getAttribute('src')!="images/compendium.png"){
    return false;
  }
  compImg.setAttribute('src',"images/"+comSources[page-1])
  document.getElementById("arrowLeft").style.display = "block"
  document.getElementById("arrowRight").style.display = "block"
  compendiumContainer.style.height = "630px"
  compendiumContainer.style.width = "777px"
  compendiumContainer.style.marginLeft = "-389px"
  compendiumContainer.style.marginTop = "-315px"
}
function reqGames(){
  var gamesReq = new XMLHttpRequest();
  gamesReq.open("GET","/requestGames");
  gamesReq.addEventListener('load',gotGames,false);
  gamesReq.send();
}
function buttonFunc(){
  joinGame(Number(this.getAttribute('gameID')))
}
function drawFakes(){
  for(var i=0;i<fakeGuys.length;i++){
    thisPlayer=fakeGuys[i];
    thisPlayer.x+=thisPlayer.dir;
    thisPlayer.yAcc+=.5;
    thisPlayer.y+=thisPlayer.yAcc;
    if(thisPlayer.y>=window.innerHeight){
      thisPlayer.yAcc=-25;
    }
    if(thisPlayer.x+30>=window.innerWidth||thisPlayer.x<=0){
      thisPlayer.dir*=-1;
    }
    var xPix = 0;
    var yPix = thisPlayer.char*136;
    if(thisPlayer.dir>0){
      xPix = 96;
    }
    clientCtx.drawImage(characters,xPix,yPix,95,136,thisPlayer.x,thisPlayer.y,30,51)
    xPix=190;
    yPix=0;
    if(thisPlayer.dir>0){
      xPix+=95;
    }
    clientCtx.drawImage(faces,xPix,yPix,95,136,thisPlayer.x,thisPlayer.y,30,51)
  }
}
function time(seconds){
  var minutes = Math.floor(seconds/60);
  var seconds = seconds%60;
  return {minutes:minutes,seconds:seconds}
}
function gotGames(){
  var games = JSON.parse(this.responseText);
  while(gamesList.firstChild!=null){
    gamesList.removeChild(gamesList.firstChild)
  }
  for(var i=0;i<games.length;i++){
    var newGame = document.createElement("ul")
    newGame.innerHTML=games[i].name
    var newButton = document.createElement("img")
    newButton.src="images/join.JPG"
    newButton.setAttribute('class','JoinButton')
    newButton.setAttribute('gameID',games[i].id)
    newButton.addEventListener('click',buttonFunc,false)
    newButton.setAttribute('align',"right")
    newGame.appendChild(newButton)
    gamesList.appendChild(newGame)
  }
}
reqGames();
function reqNewGame(){
  var gameReq = new XMLHttpRequest();
  gameReq.open("GET", "/newGame?name="+box.value)
  gameReq.addEventListener('load',gotGame,false)
  gameReq.send()
}
function gotGame(){
  if(this.responseText=="Taken"){
    window.alert("Lobby name taken")
    return false;
  }
  if(this.responseText=="long"){
    window.alert("That name is too long and will not fit!")
    return false;
  }
  if(this.responseText=="not"){
    window.alert("No name entered into the box!!!")
    return false;
  }
  var info = JSON.parse(this.responseText)
  joinGame(info.game)
}
submitMessage.addEventListener('click',function(){
  sendMessage(textBox.value)
  textBox.value="";
},false)
function joinGame(game){
  var joinReq = new XMLHttpRequest();
  joinReq.open("GET","/joinRequest?game="+game)
  joinReq.addEventListener('load',function(res){
    if(this.responseText=="Game in progress"){
      window.alert("This game is in progress")
      return false;
    }
    if(this.responseText=="Invalid"){
      window.alert("This game does no longer exist. Refresh your game list")
      return false;
    }
    if(this.responseText=="Game full"){
      window.alert("This game is full. Refresh your game list")
      return false;
    }
    myGame=game;
    var res = JSON.parse(this.responseText);
    lobbyData.players = res.players;
    myId = res.id;
    backup = res.id;
    backup2 = res.id;
    displayLobby();
  })
  joinReq.send();
}
function whichAmI(){
  whichQuest = new XMLHttpRequest();
  whichQuest.open("GET","/whichQuest?id="+myId)
  whichQuest.addEventListener('load',iAmHe,false)
  whichQuest.send()
}
function iAmHe(){
  var data = JSON.parse(this.responseText);
  var num = data.number;
  myLobbyNum = num;
}
ready.addEventListener('click',readyUp,false)
nameButton.addEventListener('click',nameFunc,false)
function readyUp(){
  if(readied==false){
    readied = true;
    ready.setAttribute("src","images/readyGreen.png")
  }else{
    readied = false;
    ready.setAttribute("src","images/readyRed.png")
  }
  var readyReq = new XMLHttpRequest
  readyReq.open("POST","/readyUp")
  readyReq.setRequestHeader('Content-type', 'application/json')
  readyReq.addEventListener('load',function(){
    refreshPlayers();
  })
  readyReq.send(JSON.stringify({status:readied,id:myId,lobbyNum:myLobbyNum,game:myGame}))
}
function nameFunc(){
  var setName = new XMLHttpRequest();
  var desiredName = document.getElementById('nameInput').value
  document.getElementById('nameInput').value='';
  setName.open("POST","/setName")
  setName.setRequestHeader('Content-Type', 'application/json');
  setName.addEventListener('load',function(){
    if(this.responseText=="No"){
      window.alert("That names is of invalid length!!!!")
      return false;
    }
    refreshPlayers()
  })
  setName.send(JSON.stringify({name:desiredName,id:myId,lobbyId:myLobbyNum}))
}
function startGame(){
  openingScreen.style.display="none"
  canvas.style.display="inline"
  clientCan.style.display = "none";
  timerY=400;
  joined=true;
}
function stopGame(){
  openingScreen.style.display = "block"
  canvas.style.display="none"
  gameStatus.innerHTML = "READY UP EVERYONE!"
}
function cheatCode(code){
  var cheatReq = new XMLHttpRequest();
  cheatReq.open("POST","/cheat");
  cheatReq.setRequestHeader('Content-Type','application/json')
  cheatReq.send(JSON.stringify({code:code,id:myId}));
}
function refreshPlayers(){
  var nameValue = ''
  if(document.getElementById('nameInput')!=null){
    nameValue  = document.getElementById('nameInput')
  }
  refQuest = new XMLHttpRequest();
  refQuest.open("POST","/refreshPlayers?game="+myGame)
  refQuest.setRequestHeader('Content-Type','application/json')
  refQuest.addEventListener('load',function(){//refunction
    if(this.responseText=="Invalid"){
      window.alert("The server has detected your ID has never existed")
      invalid = true;
      return false;
    }
    if(this.reponseText=="Gone"){
      window.alert("To prevent excessive server lag and game holdups, you have been booted from the server for inactivity. Refresh your tab to get back in!")
      invalid = true;
      return false;
    }
    whichAmI();
    var res = JSON.parse(this.responseText);
    if((res.phase=="Starting"||res.phase=="Running"||res.phase=="Ending")&&lobbyData.phase=="Lobby"){
      startGame();
    }
    if(res.time!=lobbyData.time&&res.phase=="Starting"){
      timeSinceChange=500;
    }
    if(res.phase=="Lobby"&&lobbyData.phase!="Lobby"){
      stopGame();
    }
    if(res.phase=="Ending"&&lobbyData.phase=="Running"){
      flashTime=120;
    }
    lobbyData=res;
    while(playersList.firstChild!=null){
      playersList.removeChild(playersList.firstChild);
    }
    for(var i=0;i<lobbyData.players.length;i++){
      var thisPlayer = lobbyData.players[i]
      var newPlayer = document.createElement("ul")
      var playerName = document.createTextNode(""+thisPlayer.name)
      if(thisPlayer.ready){
        newPlayer.style.color="green"
      }else{
        newPlayer.style.color="red"
      }
      newPlayer.appendChild(playerName);
      playersList.appendChild(newPlayer);
      if(myLobbyNum==thisPlayer.number){
        var meImage = document.createElement('img')
        meImage.setAttribute('width','48px')
        meImage.setAttribute('height','48px')
        meImage.setAttribute('src','images/person.png')
        meImage.setAttribute('align',"right")
        newPlayer.appendChild(meImage)
      }
    }
    while(lobbyChat.firstChild!=null){
      lobbyChat.removeChild(lobbyChat.firstChild)
    }
    for(var i=0; i<lobbyData.chat.length; i++){
      var msg = lobbyData.chat[i];
      var newmsg = document.createElement("ul");
      var content = document.createTextNode(">"+msg.name+": "+msg.content)
      newmsg.setAttribute("class","message")
      newmsg.appendChild(content)
      lobbyChat.appendChild(newmsg)
    }
    if(lobbyData.phase=="Lobby"){
      if(lobbyData.allReady==false){
        gameStatus.style.fontSize = "50"
        statusContainer.style.backgroundColor = "#e80000"
        gameStatus.innerHTML = "Ready up everyone!"
      }else{
        gameStatus.style.fontSize = "#2fc700"
        gameStatus.innerHTML = lobbyData.time+" seconds!!!"
        statusContainer.style.backgroundColor = "lime"
      }
    }
  })
  refQuest.send(JSON.stringify({game:myGame,id:myId}));
}
function displayLobby(){
  gamesContainer.style.display="none";
  lobbyContainer.style.display="inline"
  refreshPlayers()
}

function sendMessage(message){
  var chat = new XMLHttpRequest();
  chat.open("POST","/chatMsg")
  chat.setRequestHeader('Content-Type', 'application/json');
  chat.addEventListener('load',function(){
    console.log(this.responseText)
    if(this.responseText=="empty"){
      window.alert("I SAID TYPE SOMETHING!!!!! >:(")
    }
    if(this.responseText=="invalidID"){
      window.alert("you're're id is invalid!!!!")
    }
    if(this.responseText=="invalidgame"){
      window.alert("you aren't in a valid game!")
    }
  },false)
  var text = JSON.stringify({message:message,id:myId,time:time(lobbyData.time)})
  chat.send(text)
}
window.addEventListener('keydown',function(args){
  key = args.key;
  if(key=="Enter"){
    if(lobbyData.phase==null){
      return false;
    }
    if(lobbyData.phase=="Lobby"){
      console.log(textBox.value)
      sendMessage(textBox.value);
      textBox.value = ""
    }
  }
  if(key=='a'||key=="ArrowLeft"){
    controls.a=true;
  }
  if(key=='d'||key=="ArrowRight"){
    controls.d=true;
  }
  if(key==" "){
    shoot(0,0)
  }
  sendCtrls();
},false)
window.addEventListener('keyup',function(args){
  key=args.key;
  if(key=='a'||key=="ArrowLeft"){
    controls.a=false;
  }
  if(key=='d'||key=="ArrowRight"){
    controls.d=false;
  }
  sendCtrls();
},false);
function antiCheat(){
  if(myId!=backup||myId!=backup2||backup!=backup2){
      window.close();
      if(myId==backup){
        backup2 = myId;
      }
      if(myId==backup2){
        backup = myId;
      }
      if(backup==backup2){
        myId = backup;
      }
  }
}
function removeID(){
  if(myGame==-1){
    return false;
  }
  var request = new XMLHttpRequest();
  var t = "uid";
  request.open("GET","/removeID?id="+myId)
  request.send(t);
}
window.addEventListener("beforeunload",removeID)
window.onclose = removeID
window.beforeuload = removeID
function drawHUD(){
  //1248
  ctx.globalAlpha = .7;
  if(lobbyData.phase!="Ending"){
    ctx.fillStyle="#7f7f7f"
    ctx.fillRect(351,7,106,166)
    ctx.fillRect(461,7,106,166)
    ctx.fillRect(571,7,106,166)
    ctx.fillRect(681,7,106,166)
    ctx.fillRect(791,7,106,166)
    ctx.fillStyle="#FFFFFF"
    ctx.fillRect(354,10,100,125)
    ctx.fillRect(464,10,100,125)
    ctx.fillRect(574,10,100,125)
    ctx.fillRect(684,10,100,125)
    ctx.fillRect(794,10,100,125)
    for(var i=0;i<players.length;i++){
      var thisPlayer=players[i];
      var xPix = 96;
      var yPix = thisPlayer.char*136;
      if(thisPlayer.dir=="Right"){
        xPix = 96;
      }
      ctx.drawImage(characters,xPix,yPix,95,136,359+i*110,15,90,115)
      if(thisPlayer.face == "shoot"){
        xPix=0+95;
        yPix=136;
      }else if(thisPlayer.face == "smile"){
        xPix=190+95;
        yPix=0;
      }

      ctx.textAlign="center"
      ctx.font="18px Arial"
      ctx.drawImage(faces,xPix,yPix,95,136,359+i*110,15,90,115)
      ctx.fillStyle="#000000"
      ctx.fillText(thisPlayer.name,409+i*110,155)
      var red = 123;
      var green = 255;
      red+=thisPlayer.damage/100*132
      green-=thisPlayer.damage/100*255
      ctx.fillStyle="rgb("+red+","+green+",0)"
      thisPlayer.damage=Math.floor(thisPlayer.damage)
      ctx.fillText(thisPlayer.damage+"% "+thisPlayer.deaths+"☠",409+i*110,170)
      if(lobbyData.phase=="Starting"||lobbyData.phase=="Running"){
        timeSinceChange-=4*(timeSinceChange/300);
        if(lobbyData.setting==0){
          ctx.fillStyle="#000000"
        }else{
          ctx.fillStyle = "rgb(255,0,0)"
        }
        if(timeSinceChange>24){
          ctx.font=timeSinceChange+"px Arial"
        }else{
          ctx.font= "24px Arial"
        }
        if(lobbyData.phase=="Running"&&timerY>200){
          timerY--;

        }
        ctx.globalAlpha = 1;
        if(lobbyData.phase=="Starting"){
          ctx.fillText(lobbyData.time,600,timerY)
        }else if(lobbyData.phase=="Running"){
          var thisTime  = time(lobbyData.time)
          if(thisTime.seconds>=10){
            ctx.fillText(thisTime.minutes+":"+thisTime.seconds,600,timerY)
          }else{
            ctx.fillText(thisTime.minutes+":0"+thisTime.seconds,600,timerY)
          }
        }
      }
    }//end for players
  }//end not ending
  ctx.globalAlpha = 1;
  if(lobbyData.phase=="Ending"){
    for(var j=0;j<players.length;j++){
      var thisPlayer = players[j];
      ctx.fillStyle = "#000000"
      if(lobbyData.setting==2){
        ctx.fillStyle = "#FFFFFF"
      }
      ctx.fontStyle = "30px Arial"
      if(thisPlayer.place==1){
        ctx.fontStyle == "60px Arial"
        ctx.fillText(thisPlayer.name+" wins!!!",624,200)
        if(thisPlayer.name=="Unnamed"){
          ctx.fillText("Imagine how cool this would look if you'd have taken 5 seconds to pick a name!!!!!!",624,235)
        }
      }
    }
    ctx.fillStyle = "rgb(63,51,60)"
    ctx.fillRect(0,675,1248,25)
    ctx.fillStyle = "#000000"
    ctx.fontStyle = "20px Arial"
    ctx.fillText(lobbyData.time,1100,698)
  }
  if(lobbyData.setting==4){
    for(var i=0;i<snowFlakes.length;i++){
      var flake = snowFlakes[i]
      flake.x+=flake.xSpeed;
      flake.y+=flake.ySpeed;
      if(flake.x>2048||flake.y>700){
        flake.x=Math.random()*1048
        flake.y=-100;
      }
      //Circles
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, 5, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }
  }
}
function drawPlatforms(){
  ctx.globalAlpha=1;
  for(var i=0;i<platforms.length;i++){
    var newColor = [0,0,0]
    var plat = platforms[i]
    var yPix=0;
    if(plat.char<0){
      yPix = 122*lobbyData.setting;
    }else{
      yPix = 122*plat.char;
      if(lobbyData.phase!="Ending"){
        flashTime=120;
      }
      if(plat.char==0){
        newColor = [255,153,94]
      }
      if(plat.char==1){
        newColor = [74,187,239]
      }
      if(plat.char==2){
        newColor = [182,182,182]
      }
      if(plat.char==3){
        newColor = [80,0,80]
      }
      if(plat.char==4){
        newColor = [173,236,255]
      }
      ctx.fillStyle = "#000000"
      ctx.fillRect(plat.x,plat.y+15,120,1004)
      ctx.fillStyle = "rgb("+newColor[0]+","+newColor[1]+","+newColor[2]+")"
      ctx.fillRect(plat.x+2,plat.y+15,116,1000)
      var place = 0;
      place=plat.y-350
      place = place/50;
      ctx.drawImage(medals,143*(place-1),0,143,143,plat.x+10,plat.y+20,100,100)
    }
    ctx.drawImage(platformimg,0,yPix,420,122,plat.x,plat.y,120,60)
  }
}
function sendCtrls(){
  var postReq = new XMLHttpRequest();
  postReq.open("POST","/sendCtrls")
  postReq.setRequestHeader('Content-Type', 'application/json');
  var text = JSON.stringify({keys:controls,id:myId})
  postReq.send(text)
}
function getObjects(){
  var posRequest =  new XMLHttpRequest();
  posRequest.addEventListener('load',recObjects,false);
  posRequest.open("GET","/getObjects?game="+myGame)
  posRequest.send("req=new")
}
function recObjects(){
  if(this.responseText=="Invalid"){
    window.alert("Your browser requested information for a game that doesn't exist! Refresh your page")
    invalid = true;
    return false;
  }
  var objects = JSON.parse(this.responseText);
  players = objects.players;
  cannonBalls = objects.balls;
  platforms = objects.platforms;
}
function drawPlayers(){
  for(var i=0;i<players.length;i++){
    thisPlayer=players[i];
    var xPix = 0;
    var yPix = thisPlayer.char*136;
    if(thisPlayer.dir=="Right"){
      xPix = 96;
    }

    ctx.drawImage(characters,xPix,yPix,95,136,thisPlayer.x,thisPlayer.y,30,51)
    if(thisPlayer.face == "shoot"){
      xPix=0;
      yPix=136;
    }else if(thisPlayer.face=="smile"){
      xPix=190;
      yPix=0;
    }

    if(thisPlayer.dir=="Right"){
      xPix+=95;
    }

    ctx.drawImage(faces,xPix,yPix,95,136,thisPlayer.x,thisPlayer.y,30,51)
  }
}
function drawBalls(){
  for(var i=0;i<cannonBalls.length;i++){
    ball = cannonBalls[i];
    ctx.drawImage(balls,0,ball.char*95,95,95,ball.x,ball.y,20,20);
  }
}
function shoot(x,y){
  var shootPost = new XMLHttpRequest();
  shootPost.open("POST","/shootPost")
  shootPost.setRequestHeader('Content-Type','application/json')
  var text = JSON.stringify({id:myId})
  shootPost.send(text)
}
var dimension = [document.documentElement.clientWidth, document.documentElement.clientHeight];
var c = document.getElementById("mainCan");
c.addEventListener('click',function(args){
  shoot(args.clientX,args.clientY)
})
c.width = 1248;
c.height = 700;
var ctx = document.getElementById("mainCan").getContext("2d")
var growUp = .5;
var growth = 11;

//Client canvas nonsense
var clientCtx = clientCan.getContext("2d")
setInterval(function(){
  clientCtx.fillStyle = "#f24804"
  clientCtx.fillRect(0,0,window.innerWidth,window.innerHeight)
  clientCtx.drawImage(graph,0,0,window.innerWidth,window.innerHeight)
  if(tick%50==0&&(clientCan.width!=window.innerWidth||clientCan.height!=window.innerHeight)){
    clientCan.width  = window.innerWidth;
    clientCan.height = window.innerHeight;
  }
  if(lobbyData.phase=="Lobby"||myGame==-1){
    drawFakes()
  }
  if(tick%50==0){
    reqGames();
  }
  clientCtx.drawImage(logo,window.innerWidth/2-logoScale/2,10+(200-logoScale)+20,logoScale,logoScale*1.23)
  if(lobbyData.currentPhase!="Lobby"&&myGame!=-1){
    clientCtx.drawImage(graph,0,0,window.innerWidth,window.innerHeight)
  }
  if(logoRise){
    logoScale++
    if(logoScale>=250){
      logoRise=false;
    }
  }else{
    logoScale--
    if(logoScale<=150){
      logoRise=true;
    }
  }
  if(invalid){
    return false;
  }
  tick+=1
  growth+=growUp
  if(growth<=10||growth>=30){
    growUp*=-1;
  }
  if(tick%10==0&&myGame!=-1){
    refreshPlayers();
  }

  if(!joined){
    return false;
  }
  ctx.fillStyle = "green"
  ctx.drawImage(backgrounds,0,700*lobbyData.setting,1248,700,0,0,1648,700)
  antiCheat();
  getObjects();
  drawPlatforms();
  drawPlayers();
  if(cannonBalls.length>0){
    drawBalls();
  }
  drawHUD();
  if(shootA>0){
    shootA--;
  }
  if(flashTime>0){
    flashTime--;
  }
  ctx.fillStyle = "rgba(255,255,255,"+(flashTime/100)+")"
  ctx.fillRect(0,0,2000,2000)
},10)
