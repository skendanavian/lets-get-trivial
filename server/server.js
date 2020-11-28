const express = require("express");
// STEP 1 get socket.io required
const socketio = require("socket.io");
// STEP 2 require HTTP into our server.
const http = require("http");
const PORT = 8080;

const app = express();
// STEP 3 wrap http with app
const server = http.createServer(app);

// STEP 4 wrap socket with server above
const io = socketio(server);

// reference to in-memory database, helpers and constants file
const ds = require("./data");
const gh = require('./gameHelpers');
const { SCOREBOARD_LAG, STARTPAGE_LAG } = require('./constants');
const { Console } = require("console");
const { destroyRoom } = require("./data");

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  const user = ds.createUser({ socket });

  socket.on("join_room", function(name, roomId, isPublic) {
    user.name = name;
    user.roomId = roomId;

    const room = ds.createOrRefRoom(user.id, roomId, isPublic);
    room.users.push(user.id);

    socket.join(roomId);
    console.log("Join user", name, "to", roomId);

    const users = ds.getUsersInRoom(room);

    io.in(roomId).emit("user_connected", { users });
    
    handlePublicRoomInfoUpdate(room.isPublic);
  });

  //for validating roomId at join game
  socket.on("get_room_info", () => {
    const roomInfo = Object.values(ds.rooms).map((r) => {
      return { roomId: r.roomId, started: r.status.started };
    });
    socket.emit("room_info", { roomInfo });
  });

  socket.on("get_public_games", () => {

    const publicGames = ds.getAllPublicNonStartedGames();

    console.log('Requesting public games', publicGames);
    socket.emit("public_games", { publicGames });
  });

  socket.on("start_game", async (data) => {
    const { params } = data;
    const room = ds.getRoomFromUserId(socket.id);

    console.log("starting info gathering");
    const gameParamsAndQuestions = await gh.gatherAndSetGameInfo(room, params);
    /* log rooms the socket is in to server, should just be one */
    console.log(`Server starting ${Object.values(socket.rooms)[1]} with:`);
    console.log(`${JSON.stringify(params)}`);
    console.log('Start game at:', new Date().getSeconds());
    console.log("");

    handlePublicRoomInfoUpdate(room.isPublic);
    
    io.in(room.roomId).emit("game_started", gameParamsAndQuestions);

    room.timer = setTimeout(() => {
      console.log('moving on because time ran out');
      handleMoveOn(room);
    }, room.params.timeLimit * 1000 + STARTPAGE_LAG);
  });

  socket.on("picked_answer", (answer) => {
    // user defined above
    const room = ds.getRoomFromUserId(socket.id);

    console.log(
      ` ${user.name} picked ${answer.correct ? "right" : "wrong"} for ${
        room.status.currentQ
      } / ${answer.questionIndex - 1}`
    );
    console.log(answer);

    gh.recordAndAward(user, room, answer);

    if (gh.weShouldMoveOn(room)) {

      handleMoveOn(room);
    }
  });

  const handleMoveOn = (room) => {

    clearTimeout(room.timer);

    /* create scores list */
    const payload = { players: ds.generateScoreboard(room) };
      
    /* reset answers */
    room.status.answers = [];

    const nextQuestion = room.questions[room.status.currentQ + 1];

    if (nextQuestion) { //if next question exists move to next question

      room.status.currentQ = room.status.currentQ + 1;

      payload.currentQ = room.status.currentQ;

      console.log('Next question at:', new Date().getSeconds());

      io.in(room.roomId).emit("next_question", payload);
      
      room.timer = setTimeout(() => {
        console.log('moving on because time ran out');
        handleMoveOn(room);
        // clearTimeout(room.timer);
      }, room.params.timeLimit * 1000 + SCOREBOARD_LAG);
      
    } else { //if no next question end game
      
      room.status.currentQ = null;

      clearTimeout(room.timer);
      room.timer = null;

      console.log('End game at:', new Date().getSeconds());
      console.log(`${room.roomId} ended`);
      io.in(room.roomId).emit("game_ended", payload);

      handlePublicRoomInfoUpdate(room.isPublic);

    }
  };

  const handlePublicRoomInfoUpdate = (isPublic) => {
    if (isPublic) {
      const publicGames = ds.getAllPublicNonStartedGames();
      io.emit("public_games", { publicGames });
    }
  };

  socket.on("disconnect", () => {
    ds.destroyUser(socket.id);
    const room = ds.getRoomFromUserId(socket.id);

    if (room) {
      ds.removeUserFromRoom(socket.id, room);
      const users = ds.getUsersInRoom(room);

      io.in(room.roomId).emit("user_disconnected", { users });

      if (!room.users.length) {
        destroyRoom(room.roomId);
      }

      handlePublicRoomInfoUpdate(room.isPublic);
    }
  });
});

// STEP 5 - server.listen instead of app.listen!
server.listen(PORT, () => console.log("Server is listening on ", PORT));
