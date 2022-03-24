import { ApolloError, AuthenticationError } from "apollo-server-errors";
import { allow, deny, not, rule, shield } from "graphql-shield";

const isGuest = rule()(async (source, args, ctx) => {
  return ctx.user.role == "Guest" ? true : new AuthenticationError("yikes");
});
const isClerk = rule()(async (source, args, ctx) => {
  return ctx.user.role == "Clerk" ? true : new AuthenticationError("yikes");
});
const isManager = rule()(async (source, args, ctx) => {
  return ctx.user.role == "Manager" ? true : new AuthenticationError("yikes");
});

export const permissions = shield(
  {
    Query: {
      "*": isManager,
      room: isClerk || isGuest,
      rooms: isClerk || isGuest,
      reservation: isClerk || isGuest,
      reservations: isClerk || isGuest,
    },
    Mutation: {
      "*": isManager,
      userCreate: allow,
      userLogin: allow,
      updateRoom: isClerk,
      createReservation: isClerk || isGuest,
      updateReservation: isClerk || isGuest,
      deleteReservation: isClerk,
    },
  },
  {
    fallbackRule: allow,
    fallbackError: async (thrownThing, parent, args, context, info) => {
      if (thrownThing instanceof ApolloError) {
        // expected errors
        return thrownThing;
      } else if (thrownThing instanceof Error) {
        // unexpected errors
        console.error(thrownThing);
        return new ApolloError("Internal server error", "ERR_INTERNAL_SERVER");
      } else {
        // what the hell got thrown
        console.error("The resolver threw something that is not an error.");
        console.error(thrownThing);
        return new ApolloError("Internal server error", "ERR_INTERNAL_SERVER");
      }
    },
  }
);
