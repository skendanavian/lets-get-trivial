/* eslint-disable func-style */

const rooms = {};
const users = {};

function createUser({ socket, name, score }) {

  const user = {
    id: socket.id,
    name: "",
    score: 0,
  };

  users[socket.id] = user;

  return user;
}

function createRoom({ roomId, hostId, isPublic }) {
  const room = {
    roomId,
    hostId,
    isPublic,
    token: null,
    questions: [],
    users: [],
    status: {
      started: false,
      //answers: each { name, score, pointsEarned, correctAnswer, qIndex }
      answers: [],
      currentQ: null,
      timer: null,
    },

    params: {
      timeLimit: null,
      numQuestions: null,
      categoryId: null,
      difficulty: null
    },
  };

  rooms[roomId] = room;

  return room;
}

function getRoomFromUserId(userId) {
  return Object.values(rooms).find((r) => {
    return r.users.includes(userId);
  });
}

function getAllPublicNonStartedGames() {

  return Object.values(rooms).filter(r => {

    return r.isPublic && !r.started;

  }).map((r) => {

    let hostName = 'No host name found';
    if (users[r.hostId]) hostName = users[r.hostId].name;
    return { roomId: r.roomId, hostName, numUsers: r.users.length };

  });
}

/* filters list of answers for  */
function generateScoreboard(room) {

  const userIdsWhoDidntAnswer = room.users.filter((userId) => {
    return !room.status.answers.find((a) => a.userId === userId);
  });

  const playersWhoDidntAnswer = userIdsWhoDidntAnswer.map((userId) => {
    const { name, score } = users[userId];
    return { name, score, pointsEarned: 0, correct: false };
  });

  const scoreboard = [...room.status.answers, ...playersWhoDidntAnswer];
  return scoreboard;
}

function clearScores(room) {
  room.users.forEach(userId => {
    users[userId].score = 0;
  });
}

function createOrRefRoom(userId, roomId, isPublic) {
  return rooms[roomId] || createRoom({ roomId, hostId: userId, isPublic });
}

function getUsersInRoom(room) {
  return room.users.map((id) => {
    const userPayload = { ...users[id] };
    delete userPayload.socket;
    return userPayload;
  });
}

function removeUserFromRoom(userId, room) {
  const position = room.users.findIndex((id) => id === userId);
  room.users.splice(position, 1);
}


function destroyUser(userId) {

  console.log("Destroy user:", users[userId].name);
  console.log("");

  delete users[userId];
}

function destroyRoom(roomId) {
  console.log("Destroy room:", roomId);
  console.log("");

  delete rooms[roomId];
}

module.exports = {
  rooms,
  users,
  createUser,
  createRoom,
  getRoomFromUserId,
  generateScoreboard,
  clearScores,
  getUsersInRoom,
  createOrRefRoom,
  removeUserFromRoom,
  destroyUser,
  destroyRoom,
  getAllPublicNonStartedGames

};
