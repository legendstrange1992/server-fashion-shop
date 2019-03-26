const express 	= require('express');
const app 		= express();
const session 	= require('express-session');
const server 	= require('http').createServer(app);
const io 		= require('socket.io')(server);

//-----------------------------------------------------------------------------

server.listen(process.env.PORT || 3000);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

//-----------------------------------------------------------------------------

session.mang_room	 	= 	[];
session.array_chat 	= 	[];

io.on('connection',(socket) => {
	var room = '';
 	socket.on('user_client_room',(data)=>{
        socket.join(data);
        socket.room = data;
        room = data;
        var mang_room = session.mang_room;
        const count = mang_room.length;
        var flag = 0;
        if(count == 0){
            session.mang_room.push(data);
        }
        else{
            for(let i = 0 ; i < count ; i++){
                if(mang_room[i] == data){
                    flag++;
                }
            }
            if(flag == 0){
                mang_room.push(data);
            }
        }

        session.mang_room = mang_room;
        socket.emit('server-send-room-socket',data);
        io.sockets.emit('server-send-rooms',mang_room);
        var data_chat = [];
        session.array_chat.forEach((item)=>{
            var user_admin = "Admin_"+data;
            if(item.user == data || item.user == user_admin ){
                data_chat.push(item);
            }
        })
        io.sockets.in(data).emit('server-send-data-chat-user',data_chat);
    })
    socket.on('admin_choose_room',(data)=>{
        socket.join(data);
        room = data;
        var data_chat = [];
        session.array_chat.forEach((item)=>{
            var user_admin = "Admin_"+data;
            if(item.user == data || item.user == user_admin ){
                data_chat.push(item);
            }
        })
        io.sockets.in(data).emit('server-send-data-chat-admin-choose-room',data_chat);
    })
    socket.on('client-send-data-chat', (data)=>{
        
        if(data.user == "Admin"){
            var user = "Admin_"+room;
            var ob = {
                user : user,
                noidung : data.noidung
            }
            session.array_chat.push(ob);
        }
        else{
            var ob = {
                user : data.user,
                noidung : data.noidung
            }
            session.array_chat.push(ob);
        }
        var data_chat = [];
        session.array_chat.forEach((item)=>{
            var user_admin = "Admin_"+room;
            if(item.user == room || item.user == user_admin ){
                data_chat.push(item);
            }
        })
        io.sockets.in(room).emit('sever-send-data-chat',{data,data_chat});
    })
    	socket.on('load_noidung_chat',(data)=>{
        	var data_chat = [];
        	session.array_chat.forEach((item)=>{
            var user_admin = "Admin_"+room;
            if(item.user == data.user || item.user == user_admin ){
                data_chat.push(item);
            }
        })
        io.sockets.in(room).emit('server-send-data-load-noidung-chat',{data_chat});
    })
    socket.on('load-user',()=>{
        io.sockets.emit('server-send-rooms',session.mang_room);
    })
    socket.on("disconnect",()=>{
        session.mang_room.splice(session.mang_room.indexOf(room),1);
        io.sockets.emit('server-send-rooms',session.mang_room);
    });
});