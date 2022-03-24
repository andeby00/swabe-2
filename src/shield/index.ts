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
      room: isClerk || isGuest || isManager,
      rooms: isClerk || isGuest || isManager,
      reservation: isClerk || isGuest || isManager,
      reservations: isClerk || isGuest || isManager,
    },
    Mutation: {
      "*": isManager,
      userCreate: allow || isManager,
      userLogin: allow || isManager,
      updateRoom: isClerk || isManager,
      createReservation: isClerk || isGuest || isManager,
      updateReservation: isClerk || isGuest || isManager,
      deleteReservation: isClerk || isManager,
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
