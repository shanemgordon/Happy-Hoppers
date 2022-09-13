var express = require("express");
var app = express();
var path = require('path');
var fs = require('fs');
var bodyParser=require('body-parser');
var data = {response:"blankResponse"};
const availableChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
var players = [];
var platforms = [];
var ticks = 0;
var cannonBalls = [];
var games = [];
var currentGame = 0;
var removedIDs = [];
var removeIDs = [];
var spliceGames = [];
const velocities = [
  //X, Y, Gravity
  [10,1,.5], //Flesh mongerer
  [16,-8,1], //Denim
  [14,0,0],//John
  [10,-10,1],//Wacky Cat
  [4,-2,.05]//Charles
]
var levels = [
  [
    {xPos:200,yPos:600,xDis:0,yDis:300,rise:true},
    {xPos:938,yPos:250,xDis:588,yDis:0,rise:true},
    {xPos:938,yPos:600,xDis:588,yDis:0,rise:false},
    {xPos:1068,yPos:600,xDis:0,yDis:300,rise:true}
  ],[
    {xPos:1100,yPos:250,xDis:1100,yDis:0,rise:true},
    {xPos:1100,yPos:550,xDis:1100,yDis:0,rise:true},
    {xPos:1100,yPos:400,xDis:1100,yDis:0,rise:true}
  ],[
    {xPos:200,yPos:700,xDis:0,yDis:400},
    {xPos:400,yPos:700,xDis:0,yDis:400},
    {xPos:600,yPos:700,xDis:0,yDis:400},
    {xPos:800,yPos:700,xDis:0,yDis:400},
    {xPos:1000,yPos:700,xDis:0,yDis:400}
  ]
]
//Configures a platform from simpler parameters
function newPlat(game,xPos,yPos,xDis,yDis,char){
  platforms.push({game:game,move:1,tickMark:0,x:xPos,y:yPos,xDis:xDis,yDis:yDis,char:char,tickMark:0});
}
//Checks if this player is in the list of players to be removed
function isRemoved(id){
  for(var o=0;o<removedIDs.length;o++){
    if(removedIDs[o]==id){
      return true;
    }
  }
  return false;
}
//Returns all players in the lobby system
function allLobbyPlayers(){
  var returned = []
  for(var i=0;i<games.length;i++){
    game=games[i];
    for(var k=0;k<game.players.length;k++){
      returned.push(game.players[k]);
    }
  }
  return returned;
}
//returns the player object for the given id
function lobbyPlayerId(id){
  for(var i=0;i<games.length;i++){
    var game = games[i];
    for(var k=0;k<game.players.length;k++){
      var thisPlayer=game.players[k];
      if(thisPlayer.id==id){
        return thisPlayer;
      }
    }
  }
  return null;
}
//Returns the game corresponding to the given ID
function gameID(id){
  for(var i=0;i<games.length;i++){
    if(games[i].id==id){
      return games[i];
    }
  }
  return null;
}
//Returns the player for the corresponding ID
function playerID(id){
  for(var i=0;i<players.length;i++){
    if(players[i].id==id){
      return players[i]
    }
  }
  return null;
}
//Returns all platforms present in a given game
function platformsInGame(gameNum){
  var rePlats = []
  for(var i=0;i<platforms.length;i++){
    if(platforms[i].game==gameNum){
      rePlats.push(platforms[i])
    }
  }
  return rePlats;
}
//Returns all players in a given game
function playersInGame(gameNum){
  var returned = []
  for(var i=0;i<players.length;i++){
    if(players[i].gameID==gameNum){
      returned.push(players[i])
    }
  }
  return returned;
}
//Returns all balls in a given game
function ballsInGame(gameNum){
  var returned = []
  for(var i=0;i<cannonBalls.length;i++){
    if(cannonBalls[i].game==gameNum){
      returned.push(cannonBalls[i])
    }
  }
  return returned;
}

app.use(express.static(path.join(__dirname, 'public')));//Set the used directory to the correct path
app.use(bodyParser.json()); //Need a JSON decoder for incoming net messages
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/requestGames",function(req,res){//Return the list of games to the client when requested
  res.send(JSON.stringify(games));
})

app.post("/refreshPlayers",function(req,res){//Function to refresh players, with included debug codes to see what's going wrong
  var game = gameID(req.body.game)
  var theirId = req.body.id
  if(isRemoved(req.body.id)){
    res.send("Gone")
    return false;
  }
  if(playerID(theirId)==null||lobbyPlayerId(theirId)==null){
    res.send("Invalid");
    return false;
  }
  lobbyPlayerId(theirId).timeout=12000;
  playerID(theirId).timeout=12000;
  if(game == null){
    res.send("No")
    return false;
  }
  var sentPlayers = []
  for(var i=0;i<game.players.length;i++){
    var thisPlayer=game.players[i];
    sentPlayers.push({name:thisPlayer.name,number:thisPlayer.lobbyNum,me:false,ready:thisPlayer.ready})
  }
  var sentChat = []
  for(var i=0;i<game.chat.length;i++){
    var mes = game.chat[i]
    if(playerID(mes.id)!=null){
      sentChat.push({name:playerID(mes.id).name,content:mes.content,time:mes.time})
    }
  }
  res.send(JSON.stringify({chat:sentChat,players:sentPlayers,phase:game.currentPhase,allReady:game.allReady,time:game.roundTimer,setting:game.setting}))
})
app.post("/readyUp",function(req,res){
  if(playerID(req.body.id)==null){
    return false;
  }
  playerID(req.body.id).ready=req.body.ready;
  lobbyPlayerId(req.body.id).ready=req.body.status;
  res.send("Success")
})
app.post("/setName",function(req,res){
  var data = req.body;
  if(data.name==""||data.name.length>20){
    res.send("No")
    return false;
  }
  playerID(req.body.id).name=req.body.name
  for(var i=0;i<games.length;i++){
    for(var k=0;k<games[i].players.length;k++){
      if(games[i].players[k].id==req.body.id){
        games[i].players[k].name=req.body.name;
      }
    }
  }
  res.send('yeet')
})
app.get("/whichQuest",function(req,res){
  var id = req.query.id;
  var sentNum=-1;
  for(var i=0;i<games.length;i++){
    thisGame=games[i]
    for(var k=0;k<thisGame.players.length;k++){
      var thisPlayer = thisGame.players[k]
      if(thisPlayer.id==id){
        sentNum=thisPlayer.lobbyNum;
      }
    }
  }
  res.send(JSON.stringify({number:sentNum}))
})
app.get('/joinRequest',function(req,res){
  var thisId = "";
  var game = gameID(req.query.game)
  if(game==null){
    res.send("Invalid")
    return false;
  }
  if(game.currentPhase!="Lobby"){
    res.send("Game in progress")
    return false;
  }
  if(game.players.length>=5){
    res.send("Game full")
    return false;
  }
  while(thisId.length<10){
    var charNum = Math.floor(Math.random()*availableChars.length);
    thisId+=availableChars.charAt(charNum);
  }
  var charNum = (Math.floor(Math.random()*5))
  players.push({lobbyNum:game.players.length,crowned:false,place:0,frictionTimer:0,deaths:0,name:"Unnamed",gameID:req.query.game,timeout:2000,index:players.length,id:thisId,keys:{a:false,d:false},x:0,y:-200,xVelocity:0,yVelocity:0,char:charNum,dir:"left",damageTimer:0,shootA:0,face:"smile",damage:0})
  game.players.push({gameNum:game.id,wins:0,crowned:false,id:thisId,name:"Unnamed",lobbyNum:game.players.length,ready:false})
  var playerData = [];
  for(var i=0;i<game.players.length;i++){
    var thisPlayer = game.players[i];
    playerData.push({name:thisPlayer.name})
  }
  res.send({id:thisId,players:playerData})
})
app.post("/chatMsg",function(req,res){
  var data  = req.body;
  var player = playerID(req.body.id)
  var game = playerID(req.body.id).gameID
  if(req.body.message==""){
    res.send("empty");
    return false;
  }
  if(playerID(req.body.id)==null){
    res.send("invalidID")
  }
  if(game==null)[
    res.send("invalidgame")
  ]
  game = gameID(game)
  game.chat.push({content:req.body.message,name:player.name,id:req.body.id,time:req.body.time})
  console.log(game.chat)
  res.send("Recieved")
})
app.get('/newGame',function(req,res){
  for(var i=0;i<games.length;i++){
    if(games[i].name==req.query.name){
      res.send("Taken")
      return false;
    }
  }
  if(req.query.name.length>30){
    res.send("long");
    return false;
  }
  if(req.query.name.length==0){
    res.send("not")
    return false;
  }
  games.push({setting:0,chat:[],allReady:false,currentPhase:"Lobby",roundTimer:10,id:currentGame,name:req.query.name,players:[]})
  currentGame++
  res.send({game:currentGame-1})
})
app.get('/removeID',function(req,res){
  splicePlayer(req.query.id)

})
function splicePlayer(id){
  if(playerID(id)==null){
    return false;
  }
  var game = gameID(playerID(id).gameID);
  if(game==null){
    return false;
  }
  removedIDs.push(id)
  removeIDs.push(id)
}
function clearOut(){
  for(var i=0;i<removeIDs.length;i++){
    if(playerID(removeIDs[i])!=null){
      //Getting index
      var player = playerID(removeIDs[i])
      var lobbyPlayer = lobbyPlayerId(removeIDs[i]);
      var game = gameID(player.gameID);
      var newPlayers = [];
      for(var k=0;k<players.length;k++){
        if(players[k].id!=removeIDs[i]){
          newPlayers.push(players[k])
        }
      }
      var newLobbyPlayers = []
      for(var k=0;k<game.players.length;k++){
        if(game.players[k].id!=removeIDs[i]){
          newLobbyPlayers.push(game.players[k])
        }
      }
      console.log("1:")
      console.log(players)
      console.log("1a:")
      console.log(game.players)
      players = newPlayers;
      game.players = newLobbyPlayers;
      console.log("2:")
      console.log(players)
      console.log("2a:")
      console.log(game.players)
    }
  }
  for(var i=0;i<spliceGames.length;i++){
    var newGames = []
    for(var k=0;k<games.length;k++){
      if(spliceGames[i].id!=games[k].id){
        newGames.push(games[k])
      }
    }
    games=newGames;
  }
}
app.post("/sendCtrls",function(req,res){
  for(var i=0;i<players.length;i++){
    if(req.body.id==players[i].id){
      var thisPlayer = players[i];
      if(thisPlayer.keys!=req.body.keys){
        lobbyPlayerId(thisPlayer.id).timeout=12000;
      }
      thisPlayer.keys=req.body.keys;
    }
  }
  res.send("yeet")
});
app.post("/shootPost",function(req,res){
  res.send();
  var playerSent = playerID(req.body.id);
  if(playerSent==null){
    return false;
  }
  if(gameID(playerSent.gameID).currentPhase=="Starting"||gameID(playerSent.gameID).currentPhase=="Lobby"){
    return false;
  }
  playerSent.timeout=12000;
  if(playerSent.cooldown>0&&false){
    return false;
  }
  if(playerSent.char==2){
    playerSent.cooldown=120;
  }else{
    playerSent.cooldown=30;
  }
  playerSent.shootA = 30;
  var damage = 8+Math.random()*10;
  var xd = Math.random()*10-5
  damage+=xd
  var thisBall = cannonBalls.push({game:playerSent.gameID,damage:damage,yVel:0,vector:velocities[playerSent.char],char:playerSent.char,x:playerSent.x,y:playerSent.y,dir:playerSent.dir})
})
app.get("/getObjects",function(req,res){
  var sentPlayers = [];
  var sentBalls = [];
  var sentPlats = [];
  var game = Number(req.query.game)
  if(isNaN(game)){
    res.send("Invalid")
    return false;
  }
  for(var i=0;i<playersInGame(game).length;i++){
    var thisPlayer = playersInGame(game)[i]
    sentPlayers.push({name:thisPlayer.name,place:thisPlayer.place,deaths:thisPlayer.deaths,damage:thisPlayer.damage,cooldown:thisPlayer.cooldown,game:1,x:thisPlayer.x,y:thisPlayer.y,char:thisPlayer.char,dir:thisPlayer.dir,damageTimer:thisPlayer.damageTimer,face:thisPlayer.face})
  }
  res.send(JSON.stringify({platforms:platformsInGame(game),players:sentPlayers,balls:ballsInGame(game)}))
})
function explosion(game,char,x,y){
  var direction = "";
  var ballNum = 100;

  if(x>700){
    direction = "Right"
  }else{
    direction = "Left"
  }
  while(ballNum>0){
    var newVector = [0,0,0]
    ballNum--;
    newVector[0] = -(Math.random()*30);
    newVector[1] = -Math.random()*30+5;
    newVector[2]=velocities[char][2]
    cannonBalls.push({game:game,damage:1,yVel:0,vector:newVector,dir:direction,x:x,y:y,char:char,})
  }
}
function playerMovements(){
  for(var i=0;i<players.length;i++){
    thisPlayer = players[i];
    if(thisPlayer.frictionTimer>0){
      thisPlayer.frictionTimer--;
    }
    if(gameID(thisPlayer.gameID)==null){
      return false;
    }
    if(gameID(thisPlayer.gameID).currentPhase=="Lobby"||gameID(thisPlayer.gameID).currentPhase=="Starting"){
      return false;
    }
    if(thisPlayer.cooldown>0){
      thisPlayer.cooldown--;
    }
    thisPlayer.timeout--;
    var xVelocity = thisPlayer.xVelocity;
    var yVelocity = thisPlayer.yVelocity;
    var x = thisPlayer.x;
    var y = thisPlayer.y;
    var keys = thisPlayer.keys;
    if(keys.a&&xVelocity>-5){
      if(thisPlayer.frictionTimer<=0){xVelocity-=.20}
      thisPlayer.dir="Left"
    }
    if(xVelocity>0&&thisPlayer.frictionTimer<=0){
      xVelocity-=.05;
    }
    if(xVelocity<0&&thisPlayer.frictionTimer<=0){
      xVelocity+=.05;
    }
    if(xVelocity<.1&&xVelocity>-.1){
      xVelocity=0;
    }
    if(keys.d&&xVelocity<5){
      if(thisPlayer.frictionTimer<=0){xVelocity+=.20}
      thisPlayer.dir="Right"
    }
    if(yVelocity<25){
      yVelocity+=.15;
    }
    if(x>1248||x+30<0){
      explosion(thisPlayer.gameID,thisPlayer.char,x,y);
      xVelocity=0;
      x=600;
      y=-1000;
      thisPlayer.damage=0;
      thisPlayer.deaths++;
    }
    var thesePlats = platformsInGame(thisPlayer.gameID)
    for(var k=0;k<thesePlats.length;k++){
      var plat = thesePlats[k];
      if(x+30>=plat.x&&x<=plat.x+120&&y+40<=plat.y+plat.move&&y+60+yVelocity>=plat.y+plat.move){
        yVelocity=-7.5;
      }
      //30x51
    }
    if(y+51>=670){
      yVelocity=-7.5;
    }
    if(gameID(thisPlayer.gameID).currentPhase!="Ending"){
      x+=xVelocity;
    }
    y+=yVelocity;
    thisPlayer.xVelocity = xVelocity;
    thisPlayer.yVelocity = yVelocity;
    thisPlayer.x = x;
    thisPlayer.y = y;

    if(thisPlayer.shootA>0){
      thisPlayer.shootA--;
      thisPlayer.face="shoot";
    }else{
      thisPlayer.face="smile";
    }
  }
}
function cannonMovements(){
  var splicedBalls = [];
  for(var i=0;i<cannonBalls.length;i++){
    var ball = cannonBalls[i];
    if(ball.dir=="Left"){
      ball.x-=ball.vector[0]
    }else{
      ball.x+=ball.vector[0];
    }
    ball.y+=ball.vector[1]+ball.yVel;;
    ball.yVel+=ball.vector[2];

    for(var k=0;k<players.length;k++){
      var thisPlayer = players[k];
      if(ball.x<thisPlayer.x+30&&ball.x+20>thisPlayer.x&&ball.y+60>thisPlayer.y&&ball.y<thisPlayer.y+51&&thisPlayer.char!=ball.char){
        var addedVel = 0;
        if(ball.dir=="Left"){
          addedVel=-10*(ball.damage/100)
        }else{
          addedVel=10*(ball.damage/100)
        }
        if(ball.char==2){
          addedVel*=-1;
        }
        thisPlayer.xVelocity+=addedVel+thisPlayer.damage/4;
        thisPlayer.damage+=ball.damage;
        if(ball.char==4){
          thisPlayer.frictionTimer=60;
        }
        splicedBalls.push(ball)
      }
    }//end collisions
    if(Math.abs(ball.y)>3000||Math.abs(ball.x)>3000){
      splicedBalls.push(ball)
    }
  }//end each ball
  for(var i=0;i<splicedBalls.length;i++){
    cannonBalls.splice(splicedBalls[i],1)
  }
}//end ball function
function startGame(game){
  thisGame.roundTimer=5;
  thisGame.currentPhase = "Starting"
  var aChars = [0,1,2,3,4]
  var thesePlayers = playersInGame(thisGame.id)
  var levelNum = Math.floor(Math.random()*levels.length);
  var level = levels[levelNum]
  for(var i=0;i<level.length;i++){
    var thisPlat = level[i];
    newPlat(thisGame.id,thisPlat.xPos,thisPlat.yPos,thisPlat.xDis,thisPlat.yDis,-1)
  }
  thisGame.setting=Math.floor(Math.random()*5);
  for(var i=0;i<thesePlayers.length;i++){
    var taken = true;
    var charNum = (Math.floor(Math.random()*aChars.length));
    thesePlayers[i].char=aChars[charNum];
    aChars.splice(charNum,1)
    thesePlayers[i].x=Math.random()*1000;
  }
}
function endGame(){
  thisGame.roundTimer=20;
  var thesePlayers = playersInGame(thisGame.id)
  var currentPlace = 1
  while(currentPlace<=thisGame.players.length){
    var theirScore = 300000;
    var lowest = players[0];
    for(var k=0;k<thesePlayers.length;k++){
      var thisPlayer = thesePlayers[k]
      if(thisPlayer.deaths<theirScore&&thisPlayer.place==0){
        theirScore = thisPlayer.deaths;
        lowest = thisPlayer;
      }
    }
    lowest.place=currentPlace;
    if(lowest.place==1){
      lowest.crowned=true;
    }else{
      lowest.crowned=false;
    }
    currentPlace++;
  }
  var thesePlats = platformsInGame(thisGame.id);
  for(var p=0;p<thesePlats.length;p++){
    platforms.splice(thesePlats[p])
  }
  var currentX = 324;
  for(var k=0;k<thesePlayers.length;k++){
    var thisPlayer = thesePlayers[k]
    thisPlayer.x=currentX+26;
    thisPlayer.y=0-Math.random()*100
    newPlat(thisGame.id,currentX,350+thisPlayer.place*50,0,0,thisPlayer.char)
    currentX+=120;
  }
}
function restartGame(){
  for(var l=0;l<players.length;l++){
    var thisPlayer = players[l]
    if(thisPlayer.gameID == thisGame.id){
      var lobbyPlayer = lobbyPlayerId(thisPlayer.id)
      thisPlayer.deaths = 0;
      thisPlayer.x = 0;
      thisPlayer.y = -200;
      thisPlayer.damage = 0;
      thisPlayer.cooldown = 0;
      if(thisPlayer.place = 1){
        lobbyPlayer.wins++;
        lobbyPlayer.crowned = true;
      }else{
        lobbyPlayer.crowned = false;
      }
      thisPlayer.place = 0;
      lobbyPlayer.ready = false;
    }
  }
  var thesePlats = platformsInGame(thisGame.id)
  for(var i=0;i<thesePlats.length;i++){
    platforms.splice(thesePlats[i],1)
  }
}
function platformMovements(){
  for(var i=0;i<platforms.length;i++){
    var plat = platforms[i];
    if(plat.tickMark==ticks||plat.tickMark==0){
      plat.move*=-1
      if(plat.xDis>0){
        plat.tickMark = ticks+plat.xDis;
      }
      if(plat.yDis>0){
        plat.tickMark = ticks+plat.yDis;
      }

    }
    if(plat.xDis>0){
      plat.x+=plat.move;
    }else if(plat.yDis>0){
      plat.y+=plat.move;
    }
  }
}
function lobbyTimeout(){
  for(var i=0;i<allLobbyPlayers().length;i++){
    var thisPlayer = allLobbyPlayers()[i];
    thisPlayer.timeout--;
  }
}
function gameManagement(){//this function MUST run once per second!
  for(var i=0;i<games.length;i++){//Catch every game
    var thisGame = games[i]//Declare this game as the present game
    if(thisGame.players==0){//Delete any games with zero players to clear space on the list and prevent lag
      spliceGames.push(thisGame)
    }
    for(var k=0;k<thisGame.players.length;k++){
      var thisPlayer = players[k]
      if(thisPlayer.timeout<=0){ //Timeout script
        removedIDs.push(thisPlayer.id)
        splicePlayer(thisPlayer.id)
      }
    }
    if(thisGame.currentPhase=="Lobby"){
      thisGame.allReady = true;//This variable starts as true
      for(var k=0;k<thisGame.players.length;k++){
        if(thisGame.players[k].ready==false){
          thisGame.allReady = false;//It turns false if any player isnt ready
        }
      }
      if(thisGame.allReady==true){
        thisGame.roundTimer-=1;
      }else{
        thisGame.roundTimer=5;//DEBUG
      }
      if(thisGame.roundTimer<=0){
        thisGame.currentPhase="Starting"
        startGame(thisGame.id);
      }
    }//End Lobby Procedure
    if(thisGame.currentPhase=="Starting"){
      if(thisGame.roundTimer>0){
        thisGame.roundTimer--;
      }else{
        thisGame.currentPhase="Running"
        thisGame.roundTimer = 120;//DEBUG
      }
    }
    if(thisGame.currentPhase=="Running"){
      if(thisGame.roundTimer>0){
        thisGame.roundTimer--;
      }else{
        thisGame.currentPhase="Ending"
        thisGame.roundTimer = 15;
        endGame(thisGame)
      }
    }
    if(thisGame.currentPhase=="Ending"){
      thisGame.roundTimer--;
      if(thisGame.roundTimer<=0){

        restartGame(thisGame)
        thisGame.currentPhase="Lobby"
        console.log("Done")
      }
    }
  }//End game management for loop
}//End game management
setInterval(function(){
  if(ticks%100==0){
    gameManagement();
  }
  playerMovements();
  platformMovements();
  cannonMovements();
  lobbyTimeout();
  clearOut();
  ticks++;
},10)
 // THIS CODE IS NESSECARY FOR LAUNCHING ON A CLOUD SERVICE WHERE PORT IS VARIABLE
let http=require('http');
let server=http.createServer(app)
server.listen(0,()=>{

console.log(server.address().port)
});
/* THIS CODE IS CONVENIENT AS IT ALWAYS CHOOSES THE SAME PORT
app.listen(3000,function(){
  console.log("Opened")
})
*/
