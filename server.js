var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var room = 0, room1 = 0 , room2 = 0 , room3 = 0;
var room1data = new Array(), room2data = new Array(), room3data = new Array();
var trash1;

var room_ing = new Array(3);

app.get('/',function(req, res){
  res.sendFile(__dirname + '/main.html');

});
app.get('/room1',function(req, res){
  res.sendFile(__dirname + '/room1.html');

});
var count=1;
io.on('connection', function(socket){
  console.log('user connected: ', socket.id);
  var name = "user" + count++;
  io.to(socket.id).emit('change name',name);

  socket.on('disconnect', function(){
	for(var i =0;i<room1data.length;i++){
		if(room1data[i].id == socket.id){
			trash1 = room1data.splice(i,1);
			console.log(trash1);
			io.emit('userIn_',room1data,1);
		}
	}
	for(var i =0;i<room2data.length;i++){
		if(room2data[i].id == socket.id){
			room2data.splice(i,1);
			io.emit('userIn_',room2data,2);
		}
	}
	for(var i =0;i<room3data.length;i++){
		if(room3data[i].id == socket.id){
			room3data.splice(i,1);
			io.emit('userIn_',room3data,3);
		}
	}

	io.emit('hereIsUser',room1data.length,room2data.length,room3data.length);
    console.log('user disconnected: ', socket.id);

  });

  socket.on('send message', function(name,text){
    var msg = name + ' : ' + text;
    console.log(msg);
    io.emit('receive message', msg);
  });
  socket.on('room', function(){
	  io.emit('roomCount',room);
  });
  socket.on('userCount', function(){
	  io.emit('hereIsUser',room1data.length,room2data.length,room3data.length);
  });
  socket.on('join', function(n,id){
	  if(n == 1)
		  room1 ++;
	  else if(n==2)
		  room2 ++;
	  else if(n==3)
		  room3 ++;
  });
  socket.on('userIn', function(n,myId){
	  if(n==1){
			if(trash1 != null && trash1[0].myId == myId){
				room1data[room1data.length] = new user(socket.id,trash1[0].myId);
			}
			else{
				room1data[room1data.length] = new user(socket.id,myId);
			}
			trash1=null;
			io.emit('userIn_',room1data,1);
	  }
	  else if (n ==2){
		  room2data[room2data.length] = new user(socket.id);
		  io.emit('userIn_',room2data,2);
	  }
	  else if (n ==3){
		  room3data[room3data.length] = new user(socket.id);
		  io.emit('userIn_',room3data,3);
	  }
	  io.emit('hereIsUser',room1data.length,room2data.length,room3data.length);
  });

  socket.on('ready', function(room_num){
    if(room_num == 1)
      room_ing[0] = new prepare(room1data);
    else if(room_num==2)
      room_ing[1] = new prepare(room2data);
    else if(room_num==3)
      room_ing[2] = new prepare(room3data);

    io.emit('ready_', room_ing[0]);
  });
  
});

http.listen(3000, function(){
  console.log('server on!');
});


function user(id,myId)
{
	this.penalty = 0;
	this.card = new Array(10);
	this.id = id;
	this.myId = myId;
}

function card_(name_num,penalty_num,card_img)
{
  this.name_num = name_num;
  this.penalty_num = penalty_num;
  this.card_img = card_img;
}

function card_deck()
{
  this.card_deck = [];
  for(this.i=1; this.i<=104; this.i++)
  {
    if(this.i == 55)
    {
      this.card_deck[this.i-1] = new card_(this.i, 7,this.i);
    }
    else if(this.i%11 == 0)
    {
      this.card_deck[this.i-1] = new card_(this.i, 5,this.i);
    }
    else if(this.i%10 == 0)
    {
      this.card_deck[this.i-1] = new card_(this.i, 3,this.i);
    }
    else if(this.i%5 == 0)
    {
      this.card_deck[this.i-1] = new card_(this.i, 2,this.i);
    }
    else
    {
      this.card_deck[this.i-1] = new card_(this.i, 1,this.i);
    }
  }
  return this.card_deck;
}

function prepare(room_data)
{
  this.roomdata = room_data;
  this.deck_ = card_deck();
  this.mainFieldCard= new Array(4);
  this.userCardArray = new Array();

  for(this.i = 0; this.i<this.roomdata.length; this.i++)
  {
    this.userCardArray[this.i] = this.roomdata[this.i];
    for(this.j = 0; this.j<10; this.j++)
    {
      this.ran = Math.floor(Math.random() * this.deck_.length);
      this.userCardArray[this.i].card[this.j] = this.deck_[this.ran];
      this.deck_.splice(this.ran,1);
    }
  }

  for(this.i = 0; this.i < 4; this.i++)
  {
    this.ran = Math.floor(Math.random() * this.deck_.length);
    this.mainFieldCard[this.i] = this.deck_[this.ran];
    this.deck_.splice(this.ran,1);
  }
}
