import {
  booleanArg,
  extendType,
  intArg,
  list,
  nonNull,
  nullable,
  objectType,
  stringArg,
} from "nexus";
import { Room } from "nexus-prisma";

export const room = objectType({
  name: Room.$name,
  description: Room.$description,
  definition(t) {
    t.field(Room.roomNumber);
    t.field(Room.capacity);
    t.field(Room.category);
    t.field(Room.minibar);
  },
});

export const RoomQueries = extendType({
  type: "Query",
  definition: (t) => {
    t.field("rooms", {
      type: nonNull(list(nonNull("Room"))),
      args: {
        date: nonNull(intArg()),
      },
      resolve: async (_source, { date }, ctx) => {
        const rooms = await ctx.db.room.findMany();

        let roomIds = await (
          await ctx.db.reservation.findMany({
            include: { room: true },
            where: { start: { lte: date }, end: { gt: date } },
          })
        ).map(({ roomNumber }) => roomNumber);

        return rooms.reduce<Room[]>((acc, cur) => {
          if (roomIds.includes(cur.roomNumber)) {
            acc.push();
          }
          return acc;
        }, []);
      },
    });
    t.field("room", {
      type: "Room",
      args: {
        roomNumber: nonNull(intArg()),
      },
      resolve: async (_source, { roomNumber }, ctx) => {
        return await ctx.db.room.findUnique({ where: { roomNumber } });
      },
    });
  },
});

export const RoomMutations = extendType({
  type: "Mutation",
  definition: (t) => {
    t.field("createRoom", {
      type: "Room",
      args: {
        roomNumber: nonNull(intArg()),
        capacity: nonNull(intArg()),
        category: nonNull(stringArg()),
        minibar: nonNull(booleanArg()),
      },
      resolve: async (_source, args, ctx) => {
        return await ctx.db.room.create({
          data: {
            roomNumber: args.roomNumber,
            capacity: args.capacity,
            category: args.category,
            minibar: args.minibar,
          },
        });
      },
    });
    t.field("updateRoom", {
      type: "Room",
      args: {
        roomNumber: nonNull(intArg()),
        capacity: nonNull(intArg()),
        category: nonNull(stringArg()),
        minibar: nonNull(booleanArg()),
      },
      resolve: async (_source, args, ctx) => {
        return await ctx.db.room.update({
          where: { roomNumber: args.roomNumber },
          data: {
            roomNumber: args.roomNumber,
            capacity: args.capacity,
            category: args.category,
            minibar: args.minibar,
          },
        });
      },
    });
    t.field("deleteRoom", {
      type: "Room",
      args: {
        roomNumber: nonNull(intArg()),
      },
      resolve: async (_source, { roomNumber }, ctx) => {
        await ctx.db.reservation.deleteMany({ where: { roomNumber } });
        return await ctx.db.room.delete({
          where: { roomNumber },
        });
      },
    });
  },
});
