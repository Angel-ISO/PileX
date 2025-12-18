export function toPlayerResponse(player) {
  return {
    id: player._id,
    username: player.username,
    bornDate: player.bornDate,
    lastPlayed: player.lastPlayed,
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
  };
}
