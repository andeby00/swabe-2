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
import { Reservation } from "nexus-prisma";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";

export const reservation = objectType({
  name: Reservation.$name,
  description: Reservation.$description,
  definition(t) {
    t.field(Reservation.id);
    t.field(Reservation.room);
    t.field(Reservation.user);
    t.field(Reservation.start);
    t.field(Reservation.end);
    t.string("token");
  },
});

export const ReservationQueries = extendType({
  type: "Query",
  definition: (t) => {
    t.field("reservations", {
      type: nonNull(list(nonNull("Room"))),
      args: {
        from: intArg(),
        to: intArg(),
      },
      resolve: async (_source, { from, to }, ctx) => {
        let reservations = await ctx.db.reservation.findMany();

        if (!!from) {
          reservations = reservations.filter(
            (reservation) => reservation.start > from
          );
        }
        if (!!to) {
          reservations = reservations.filter(
            (reservation) => reservation.end < to
          );
        }

        return reservations;
      },
    });
    t.field("reservation", {
      type: "Reservation",
      args: {
        uid: nonNull(stringArg()),
      },
      resolve: async (_source, { uid }, ctx) => {
        return await ctx.db.reservation.findUnique({ where: { id: uid } });
      },
    });
  },
});

export const ReservationMutations = extendType({
  type: "Mutation",
  definition: (t) => {
    t.field("createReservation", {
      type: "Reservation",
      args: {
        roomNumber: nonNull(intArg()),
        start: nonNull(intArg()),
        end: nonNull(intArg()),
        userId: nonNull(stringArg()),
      },
      resolve: async (_source, args, ctx) => {
        return await ctx.db.reservation.create({
          data: {
            room: { connect: { roomNumber: args.roomNumber } },
            start: args.start,
            end: args.end,
            user: { connect: { id: "" } },
          },
        });
      },
    });
    t.field("updateReservation", {
      type: "Reservation",
      args: {
        uid: nonNull(stringArg()),
        roomNumber: nonNull(intArg()),
        start: nonNull(intArg()),
        end: nonNull(intArg()),
        userId: nonNull(stringArg()),
      },
      resolve: async (_source, args, ctx) => {
        return await ctx.db.reservation.update({
          where: { id: args.uid },
          data: {
            room: { connect: { roomNumber: args.roomNumber } },
            start: args.start,
            end: args.end,
            user: { connect: { id: args.userId } },
          },
        });
      },
    });
    t.field("deleteReservation", {
      type: "Reservation",
      args: {
        uid: nonNull(stringArg()),
      },
      resolve: async (_source, { uid }, ctx) => {
        return await ctx.db.reservation.delete({
          where: { id: uid },
        });
      },
    });
  },
});
